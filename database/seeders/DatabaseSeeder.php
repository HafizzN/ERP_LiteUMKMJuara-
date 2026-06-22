<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\TransactionItem;
use App\Models\Cashflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Admin User
        User::updateOrCreate(
            ['email' => 'admin@umkm.com'],
            [
                'name' => 'Warung Berkah',
                'password' => Hash::make('password'),
            ]
        );

        // 2. Seed Products
        $productsData = [
            ['name' => 'Espresso Double Shot', 'price' => 18000, 'stock' => 120, 'category' => 'Kopi', 'sku' => 'KK-ESP-01', 'image_color' => '#4f46e5'],
            ['name' => 'Iced Caramel Latte', 'price' => 24000, 'stock' => 95, 'category' => 'Kopi', 'sku' => 'KK-LAT-02', 'image_color' => '#0ea5e9'],
            ['name' => 'Matcha Cream Latte', 'price' => 26000, 'stock' => 45, 'category' => 'Non-Kopi', 'sku' => 'KK-MAT-03', 'image_color' => '#10b981'],
            ['name' => 'Butter Croissant', 'price' => 20000, 'stock' => 8, 'category' => 'Bakery', 'sku' => 'KK-CRO-04', 'image_color' => '#f59e0b'],
            ['name' => 'Chocolate Fudge Muffin', 'price' => 18000, 'stock' => 3, 'category' => 'Bakery', 'sku' => 'KK-MUF-05', 'image_color' => '#ef4444'],
            ['name' => 'Red Velvet Slices', 'price' => 28000, 'stock' => 15, 'category' => 'Bakery', 'sku' => 'KK-RVC-06', 'image_color' => '#ec4899'],
            ['name' => 'Iced Lychee Tea', 'price' => 18000, 'stock' => 60, 'category' => 'Non-Kopi', 'sku' => 'KK-LIT-07', 'image_color' => '#14b8a6'],
        ];

        $products = [];
        foreach ($productsData as $p) {
            $products[$p['sku']] = Product::create($p);
        }

        // 3. Seed Customers
        $customersData = [
            ['name' => 'Budi Santoso', 'phone' => '081234567890', 'points' => 450, 'tier' => 'Silver'],
            ['name' => 'Siti Rahma', 'phone' => '089876543210', 'points' => 820, 'tier' => 'Gold'],
            ['name' => 'Andi Wijaya', 'phone' => '085678901234', 'points' => 120, 'tier' => 'Bronze'],
        ];

        $customers = [];
        foreach ($customersData as $c) {
            $cust = Customer::create($c);
            $customers[$c['name']] = $cust;
        }

        // 4. Seed Transactions over last 7 days
        $today = Carbon::today();

        $txns = [
            [
                'days_ago' => 6,
                'customer' => 'Budi Santoso',
                'items' => [
                    ['sku' => 'KK-ESP-01', 'qty' => 2],
                    ['sku' => 'KK-CRO-04', 'qty' => 1],
                ],
                'discount' => 5000,
                'tax' => 5100,
                'payment' => 'QRIS',
            ],
            [
                'days_ago' => 5,
                'customer' => 'Siti Rahma',
                'items' => [
                    ['sku' => 'KK-LAT-02', 'qty' => 1],
                    ['sku' => 'KK-RVC-06', 'qty' => 2],
                ],
                'discount' => 0,
                'tax' => 8000,
                'payment' => 'Tunai',
            ],
            [
                'days_ago' => 4,
                'customer' => null,
                'items' => [
                    ['sku' => 'KK-MAT-03', 'qty' => 3],
                ],
                'discount' => 8000,
                'tax' => 7000,
                'payment' => 'Transfer',
            ],
            [
                'days_ago' => 3,
                'customer' => 'Andi Wijaya',
                'items' => [
                    ['sku' => 'KK-ESP-01', 'qty' => 1],
                    ['sku' => 'KK-LAT-02', 'qty' => 2],
                    ['sku' => 'KK-LIT-07', 'qty' => 1],
                ],
                'discount' => 0,
                'tax' => 8400,
                'payment' => 'QRIS',
            ],
            [
                'days_ago' => 2,
                'customer' => null,
                'items' => [
                    ['sku' => 'KK-MUF-05', 'qty' => 4],
                ],
                'discount' => 5000,
                'tax' => 6700,
                'payment' => 'Tunai',
            ],
            [
                'days_ago' => 1,
                'customer' => 'Budi Santoso',
                'items' => [
                    ['sku' => 'KK-LAT-02', 'qty' => 1],
                    ['sku' => 'KK-CRO-04', 'qty' => 2],
                ],
                'discount' => 0,
                'tax' => 6400,
                'payment' => 'QRIS',
            ],
            [
                'days_ago' => 0,
                'customer' => 'Siti Rahma',
                'items' => [
                    ['sku' => 'KK-MAT-03', 'qty' => 2],
                    ['sku' => 'KK-RVC-06', 'qty' => 1],
                ],
                'discount' => 10000,
                'tax' => 7000,
                'payment' => 'QRIS',
            ],
        ];

        foreach ($txns as $idx => $tData) {
            $date = Carbon::parse($today)->subDays($tData['days_ago'])->setHour(10 + $idx)->setMinute(15 + $idx * 3);
            $custObj = $tData['customer'] ? $customers[$tData['customer']] : null;

            // Calculate Subtotal
            $subtotal = 0;
            $itemsToCreate = [];
            foreach ($tData['items'] as $item) {
                $prod = $products[$item['sku']];
                $subtotal += $prod->price * $item['qty'];
                $itemsToCreate[] = [
                    'product_id' => $prod->id,
                    'name' => $prod->name,
                    'price' => $prod->price,
                    'quantity' => $item['qty'],
                ];
                
                // Deduct stock
                $prod->decrement('stock', $item['qty']);
            }

            $total = $subtotal - $tData['discount'] + $tData['tax'];

            $txn = Transaction::create([
                'date' => $date,
                'subtotal' => $subtotal,
                'discount' => $tData['discount'],
                'tax' => $tData['tax'],
                'total' => $total,
                'payment_method' => $tData['payment'],
                'customer_id' => $custObj ? $custObj->id : null,
            ]);

            foreach ($itemsToCreate as $it) {
                $txn->items()->create($it);
            }

            // Create income cashflow
            Cashflow::create([
                'date' => $date,
                'type' => 'pemasukan',
                'amount' => $total,
                'description' => "Penjualan Transaksi #T" . $txn->id,
                'category' => 'Penjualan',
            ]);
        }

        // 5. Seed Expense Cashflows
        $expenses = [
            ['days_ago' => 15, 'amount' => 800000, 'desc' => 'Bahan Baku Biji Kopi & Susu', 'cat' => 'Bahan Baku'],
            ['days_ago' => 10, 'amount' => 350000, 'desc' => 'Biaya Listrik & Air Mingguan', 'cat' => 'Utilitas'],
            ['days_ago' => 5, 'amount' => 1200000, 'desc' => 'Gaji Karyawan Part-time', 'cat' => 'Gaji'],
            ['days_ago' => 2, 'amount' => 250000, 'desc' => 'Pembelian Packaging & Cup', 'cat' => 'Operasional'],
        ];

        foreach ($expenses as $ex) {
            Cashflow::create([
                'date' => Carbon::parse($today)->subDays($ex['days_ago'])->setHour(14),
                'type' => 'pengeluaran',
                'amount' => $ex['amount'],
                'description' => $ex['desc'],
                'category' => $ex['cat'],
            ]);
        }
    }
}
