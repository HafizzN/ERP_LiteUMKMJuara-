# ERP Lite UMKM 🥇

Aplikasi web ERP (Enterprise Resource Planning) Lite yang dirancang khusus untuk mempermudah operasional Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia. Dibangun dengan konsep desain **gelap premium (dark mode)** dan **glassmorphism** yang visual, modern, dan interaktif.

Sistem ini terintegrasi penuh menggunakan database **SQLite** lokal untuk penyimpanan data yang persisten.

---

## 🚀 Fitur Utama

1. **Dashboard Performa Real-time**:
   - Ringkasan otomatis total omset penjualan, pengeluaran operasional, laba bersih, dan jumlah transaksi.
   - Grafik garis kustom untuk tren penjualan 7 hari terakhir.
   - Grafik lingkaran kustom untuk distribusi kategori barang terjual.
   - Panel peringatan stok menipis/habis dan log transaksi terbaru.

2. **Point of Sale (POS) / Kasir**:
   - Input transaksi belanja cepat dengan filter kategori produk dan pencarian SKU.
   - Keranjang belanja interaktif dengan penyesuaian kuantitas barang otomatis.
   - Perhitungan diskon rupiah dan pajak PPN 10%.
   - Integrasi database pelanggan (CRM) untuk akumulasi poin loyalitas.
   - Visualisasi struk thermal digital siap cetak.

3. **Manajemen Inventaris & Stok**:
   - Daftar katalog produk lengkap dengan info harga, SKU, dan status persediaan.
   - Penyesuaian stok instan (`+` / `-`) langsung pada kartu produk tanpa modal yang rumit.
   - Deteksi otomatis stok menipis/kritis.
   - Form penambahan produk baru dengan preset dekorasi warna visual.

4. **Buku Kas & Catatan Keuangan**:
   - Analisis arus kas bulanan dan margin keuntungan bersih.
   - Donut chart visualisasi alokasi pengeluaran operasional (Bahan Baku, Gaji, Utilitas, dll.).
   - Jurnal keuangan untuk mencatat pengeluaran/pemasukan manual secara rapi.

5. **Program Loyalitas Pelanggan (CRM)**:
   - Database lengkap pelanggan dengan nomor kontak aktif.
   - Akumulasi poin belanja otomatis (setiap transaksi Rp 1.000 = +1 poin).
   - Penentuan level tiering loyalitas otomatis berdasarkan poin:
     - 🥉 **Bronze Member** (< 300 Poin)
     - 🥈 **Silver Member** (300 - 749 Poin)
     - 🥇 **Gold Member** (>= 750 Poin)

---

## 🛠️ Tech Stack

- **Backend**: Laravel 12 (PHP v8.2+) & SQLite.
- **Frontend**: React, TypeScript, Inertia.js (Single Page Application).
- **Build Tool**: Vite.
- **Styling**: Vanilla CSS kustom (Glassmorphism & Animasi) tanpa overhead framework CSS eksternal.

---

## 💻 Cara Menjalankan Proyek Secara Lokal

### Prerequisites
Pastikan komputer Anda sudah terinstal:
- PHP (v8.2 ke atas)
- Composer
- Node.js & npm

### Langkah Instalasi

1. **Clone / Download Proyek** dan masuk ke folder proyek:
   ```bash
   cd d:\Project
   ```

2. **Instal Dependensi Backend (PHP)**:
   ```bash
   composer install
   ```

3. **Instal Dependensi Frontend (Node)**:
   ```bash
   npm install --legacy-peer-deps
   ```

4. **Konfigurasi Environment**:
   Salin berkas `.env.example` menjadi `.env` (SQLite akan otomatis mendeteksi database lokal):
   ```bash
   copy .env.example .env
   ```

5. **Migrasi dan Pengisian Data Demo**:
   Wipe database lama, buat tabel baru, dan isi database SQLite dengan data simulasi toko Kopi & Bakery:
   ```bash
   php artisan migrate:fresh --seed
   ```

6. **Kompilasi Aset Frontend (Vite)**:
   - Untuk pengembangan lokal (Hot Reload):
     ```bash
     npm run dev
     ```
   - Untuk build produksi (Teroptimasi):
     ```bash
     npm run build
     ```

7. **Jalankan Laravel Local Server**:
   ```bash
   php artisan serve
   ```

---

## 🔑 Akun Demo Pengujian

Akses aplikasi di browser Anda melalui alamat: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.

Masuk menggunakan akun administrator bawaan berikut:
- **Email:** `admin@umkm.com`
- **Password:** `password`
