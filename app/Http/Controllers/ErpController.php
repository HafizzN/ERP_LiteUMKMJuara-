<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Cashflow;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ErpController extends Controller
{
    /**
     * Dashboard view with metrics and charts.
     */
    public function dashboard(): Response
    {
        // 1. Calculate Metrics
        $totalPenjualan = Transaction::sum('total');
        $totalPengeluaran = Cashflow::where('type', 'pengeluaran')->sum('amount');
        $labaBersih = $totalPenjualan - $totalPengeluaran;
        $jumlahTransaksi = Transaction::count();

        // 2. Prep 7-day Sales Data
        $salesLabels = [];
        $salesData = [];
        $today = Carbon::today();

        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::parse($today)->subDays($i);
            $dayLabel = $date->translatedFormat('d M');
            $salesLabels[] = $dayLabel;

            $dayTotal = Transaction::whereDate('date', $date)->sum('total');
            $salesData[] = (int) $dayTotal;
        }

        // 3. Prep Category Sales Data
        $categorySalesRaw = DB::table('transaction_items')
            ->join('products', 'transaction_items.product_id', '=', 'products.id')
            ->select('products.category', DB::raw('SUM(transaction_items.price * transaction_items.quantity) as total'))
            ->groupBy('products.category')
            ->get();

        $categorySales = [
            'labels' => $categorySalesRaw->pluck('category')->toArray(),
            'data' => $categorySalesRaw->pluck('total')->map(fn($v) => (int) $v)->toArray()
        ];

        if (empty($categorySales['labels'])) {
            $categorySales = ['labels' => ['Belum Ada Penjualan'], 'data' => [1]];
        }

        // 4. Critical Stock Products (Stock <= 10)
        $criticalStock = Product::where('stock', '<=', 10)
            ->orderBy('stock', 'asc')
            ->take(5)
            ->get();

        // 5. Recent Transactions
        $recentTransactions = Transaction::with('customer')
            ->orderBy('date', 'desc')
            ->take(5)
            ->get()
            ->map(function ($t) {
                return [
                    'id' => $t->id,
                    'date' => $t->date->toIso8601String(),
                    'total' => $t->total,
                    'paymentMethod' => $t->payment_method,
                    'customerName' => $t->customer ? $t->customer->name : 'Pelanggan Umum',
                ];
            });

        return Inertia::render('Dashboard', [
            'metrics' => [
                'totalPenjualan' => (int) $totalPenjualan,
                'totalPengeluaran' => (int) $totalPengeluaran,
                'labaBersih' => (int) $labaBersih,
                'jumlahTransaksi' => $jumlahTransaksi,
            ],
            'sales7Days' => [
                'labels' => $salesLabels,
                'data' => $salesData,
            ],
            'categorySales' => $categorySales,
            'criticalStock' => $criticalStock,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    /**
     * POS Cashier page.
     */
    public function pos(): Response
    {
        $products = Product::all();
        $customers = Customer::orderBy('name', 'asc')->get();

        return Inertia::render('POS', [
            'products' => $products,
            'customers' => $customers,
        ]);
    }

    /**
     * Store new transaction from POS.
     */
    public function storeTransaction(Request $request): RedirectResponse
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'discount' => 'required|integer|min:0',
            'tax' => 'required|integer|min:0',
            'paymentMethod' => 'required|string|in:Tunai,QRIS,Transfer',
            'customerId' => 'nullable|exists:customers,id',
        ]);

        DB::transaction(function () use ($request) {
            $subtotal = 0;
            $itemsData = [];

            // Verify stock and prepare items data
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['productId']);
                
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok produk {$product->name} tidak mencukupi!");
                }

                // Decrement stock
                $product->decrement('stock', $item['quantity']);

                $itemSubtotal = $product->price * $item['quantity'];
                $subtotal += $itemSubtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $item['quantity'],
                ];
            }

            $discount = min($request->discount, $subtotal);
            $tax = $request->tax;
            $total = $subtotal - $discount + $tax;

            // Handle Customer loyalty points
            if ($request->customerId) {
                $customer = Customer::findOrFail($request->customerId);
                $pointsEarned = floor($total / 1000);
                $newPoints = $customer->points + $pointsEarned;

                // Loyalty Tiering
                $newTier = 'Bronze';
                if ($newPoints >= 750) {
                    $newTier = 'Gold';
                } elseif ($newPoints >= 300) {
                    $newTier = 'Silver';
                }

                $customer->update([
                    'points' => $newPoints,
                    'tier' => $newTier,
                ]);
            }

            // Save Transaction
            $txn = Transaction::create([
                'date' => Carbon::now(),
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $request->paymentMethod,
                'customer_id' => $request->customerId,
            ]);

            // Save Transaction Items
            foreach ($itemsData as $it) {
                $txn->items()->create($it);
            }

            // Record as income in Cashflow
            Cashflow::create([
                'date' => Carbon::now(),
                'type' => 'pemasukan',
                'amount' => $total,
                'description' => "Penjualan Transaksi #T" . $txn->id,
                'category' => 'Penjualan',
            ]);
        });

        // Get the latest transaction
        $latestTxn = Transaction::with('customer', 'items')->latest()->first();

        return redirect()->back()->with('flash', [
            'success' => 'Transaksi berhasil diproses!',
            'transaction' => $latestTxn
        ]);
    }

    /**
     * Inventory management page.
     */
    public function inventory(): Response
    {
        $products = Product::orderBy('name', 'asc')->get();

        return Inertia::render('Inventory', [
            'products' => $products,
        ]);
    }

    /**
     * Store new product.
     */
    public function storeProduct(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|integer|min:0',
            'stock' => 'required|integer|min:0',
            'category' => 'required|string',
            'imageColor' => 'required|string',
        ]);

        $skuPrefix = strtoupper(substr($request->category, 0, 3));
        $count = Product::where('category', $request->category)->count() + 1;
        $sku = "KK-" . $skuPrefix . "-" . str_pad($count, 2, '0', STR_PAD_LEFT);

        Product::create([
            'name' => $request->name,
            'sku' => $sku,
            'price' => $request->price,
            'stock' => $request->stock,
            'category' => $request->category,
            'image_color' => $request->imageColor,
        ]);

        return redirect()->back()->with('flash', ['success' => 'Produk berhasil ditambahkan!']);
    }

    /**
     * Quick stock adjustment (+/-).
     */
    public function adjustStock(Request $request, Product $product): RedirectResponse
    {
        $request->validate([
            'delta' => 'required|integer',
        ]);

        $newStock = max(0, $product->stock + $request->delta);
        $product->update(['stock' => $newStock]);

        return redirect()->back()->with('flash', ['success' => 'Stok berhasil diperbarui!']);
    }

    /**
     * Finance page.
     */
    public function finance(): Response
    {
        $cashflow = Cashflow::orderBy('date', 'desc')->get();

        $totalPemasukan = Cashflow::where('type', 'pemasukan')->sum('amount');
        $totalPengeluaran = Cashflow::where('type', 'pengeluaran')->sum('amount');
        $labaRugi = $totalPemasukan - $totalPengeluaran;
        $marginLaba = $totalPemasukan > 0 ? ($labaRugi / $totalPemasukan) * 100 : 0;

        // Group expense category distribution
        $expensesRaw = DB::table('cashflows')
            ->where('type', 'pengeluaran')
            ->select('category', DB::raw('SUM(amount) as total'))
            ->groupBy('category')
            ->get();

        $expenseDist = [
            'labels' => $expensesRaw->pluck('category')->toArray(),
            'data' => $expensesRaw->pluck('total')->map(fn($v) => (int) $v)->toArray()
        ];

        if (empty($expenseDist['labels'])) {
            $expenseDist = ['labels' => ['Belum Ada Pengeluaran'], 'data' => [1]];
        }

        return Inertia::render('Finance', [
            'cashflows' => $cashflow->map(function ($cf) {
                return [
                    'id' => $cf->id,
                    'date' => $cf->date->toIso8601String(),
                    'type' => $cf->type,
                    'amount' => $cf->amount,
                    'description' => $cf->description,
                    'category' => $cf->category,
                ];
            }),
            'stats' => [
                'totalPemasukan' => (int) $totalPemasukan,
                'totalPengeluaran' => (int) $totalPengeluaran,
                'labaRugi' => (int) $labaRugi,
                'marginLaba' => (float) $marginLaba,
            ],
            'expenseDist' => $expenseDist,
        ]);
    }

    /**
     * Store manual cashflow entry.
     */
    public function storeCashflow(Request $request): RedirectResponse
    {
        $request->validate([
            'type' => 'required|string|in:pemasukan,pengeluaran',
            'amount' => 'required|integer|min:0',
            'description' => 'required|string|max:255',
            'category' => 'required|string',
        ]);

        Cashflow::create([
            'date' => Carbon::now(),
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
            'category' => $request->category,
        ]);

        return redirect()->back()->with('flash', ['success' => 'Arus kas berhasil dicatat!']);
    }

    /**
     * Customers management (CRM) page.
     */
    public function customers(): Response
    {
        $customers = Customer::orderBy('name', 'asc')->get()->map(function ($c) {
            // Calculate total spent and transaction counts
            $custTxns = Transaction::where('customer_id', $c->id)->get();
            $totalSpent = $custTxns->sum('total');
            $visitCount = $custTxns->count();

            return [
                'id' => $c->id,
                'name' => $c->name,
                'phone' => $c->phone,
                'points' => $c->points,
                'tier' => $c->tier,
                'stats' => [
                    'count' => $visitCount,
                    'total' => $totalSpent,
                ]
            ];
        });

        return Inertia::render('Customers', [
            'customers' => $customers,
        ]);
    }

    /**
     * Store new customer.
     */
    public function storeCustomer(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
        ]);

        Customer::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'points' => 0,
            'tier' => 'Bronze',
        ]);

        return redirect()->back()->with('flash', ['success' => 'Pelanggan baru berhasil didaftarkan!']);
    }
}
