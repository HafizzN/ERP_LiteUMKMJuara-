<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cashflow extends Model
{
    protected $fillable = [
        'date',
        'type',
        'amount',
        'description',
        'category',
    ];

    protected $casts = [
        'date' => 'datetime',
    ];
}
