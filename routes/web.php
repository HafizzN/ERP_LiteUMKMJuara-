<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ErpController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('/', '/dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [ErpController::class, 'dashboard'])->name('dashboard');
    
    Route::get('/pos', [ErpController::class, 'pos'])->name('pos');
    Route::post('/pos/transaction', [ErpController::class, 'storeTransaction'])->name('pos.transaction');
    
    Route::get('/inventory', [ErpController::class, 'inventory'])->name('inventory');
    Route::post('/inventory/product', [ErpController::class, 'storeProduct'])->name('inventory.product');
    Route::post('/inventory/product/{product}/adjust', [ErpController::class, 'adjustStock'])->name('inventory.adjust');
    
    Route::get('/finance', [ErpController::class, 'finance'])->name('finance');
    Route::post('/finance/cashflow', [ErpController::class, 'storeCashflow'])->name('finance.cashflow');
    
    Route::get('/customers', [ErpController::class, 'customers'])->name('customers');
    Route::post('/customers/store', [ErpController::class, 'storeCustomer'])->name('customers.store');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
