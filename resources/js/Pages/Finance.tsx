import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { DonutChart } from "@/Components/SvgCharts";
import styles from "./Finance.module.css";

interface CashflowItem {
    id: number;
    date: string;
    type: "pemasukan" | "pengeluaran";
    amount: number;
    description: string;
    category: string;
}

interface FinanceProps {
    cashflows: CashflowItem[];
    stats: {
        totalPemasukan: number;
        totalPengeluaran: number;
        labaRugi: number;
        marginLaba: number;
    };
    expenseDist: {
        labels: string[];
        data: number[];
    };
}

export default function Finance({ cashflows, stats, expenseDist }: FinanceProps) {
    const [filterType, setFilterType] = useState<"Semua" | "pemasukan" | "pengeluaran">("Semua");
    const [showAddModal, setShowAddModal] = useState(false);
    
    // New entry state
    const [entryType, setEntryType] = useState<"pemasukan" | "pengeluaran">("pengeluaran");
    const [entryAmount, setEntryAmount] = useState("");
    const [entryDesc, setEntryDesc] = useState("");
    const [entryCategory, setEntryCategory] = useState("Bahan Baku");

    const expenseCategories = ["Bahan Baku", "Utilitas", "Gaji", "Operasional", "Lainnya"];
    const incomeCategories = ["Penjualan", "Investasi", "Pemasukan Lain"];

    const filteredCashflow = cashflows.filter((cf) => {
        return filterType === "Semua" || cf.type === filterType;
    });

    const handleSubmitEntry = (e: React.FormEvent) => {
        e.preventDefault();
        if (!entryAmount || !entryDesc || !entryCategory) {
            alert("Semua kolom harus diisi!");
            return;
        }

        router.post(
            route("finance.cashflow"),
            {
                type: entryType,
                amount: Number(entryAmount),
                description: entryDesc,
                category: entryCategory,
            },
            {
                onSuccess: () => {
                    setEntryAmount("");
                    setEntryDesc("");
                    setEntryType("pengeluaran");
                    setEntryCategory("Bahan Baku");
                    setShowAddModal(false);
                },
            }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buku Kas & Keuangan" />

            <div className="animate-fade">
                <header className={styles.headerSection}>
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Buku Kas & Keuangan</h1>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            Catat pemasukan, pantau pengeluaran operasional, dan analisis margin keuntungan bersih tokomu.
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        📝 Catat Arus Kas
                    </button>
                </header>

                {/* Metrics Row */}
                <section className={styles.metricsGrid}>
                    <div className={`${styles.metricCard} glass-card`}>
                        <div className={styles.metricTitle} style={{ color: "var(--color-success)" }}>
                            Total Pemasukan
                        </div>
                        <div className={styles.metricValue} style={{ color: "var(--color-success)" }}>
                            Rp {stats.totalPemasukan.toLocaleString("id-ID")}
                        </div>
                    </div>

                    <div className={`${styles.metricCard} glass-card`}>
                        <div className={styles.metricTitle} style={{ color: "var(--color-danger)" }}>
                            Total Pengeluaran
                        </div>
                        <div className={styles.metricValue} style={{ color: "var(--color-danger)" }}>
                            Rp {stats.totalPengeluaran.toLocaleString("id-ID")}
                        </div>
                    </div>

                    <div className={`${styles.metricCard} glass-card glow-indigo`}>
                        <div className={styles.metricTitle} style={{ color: "var(--color-primary)" }}>
                            Laba / (Rugi) Bersih
                        </div>
                        <div
                            className={styles.metricValue}
                            style={{ color: stats.labaRugi >= 0 ? "var(--color-success)" : "var(--color-danger)" }}
                        >
                            Rp {stats.labaRugi.toLocaleString("id-ID")}
                        </div>
                    </div>

                    <div className={`${styles.metricCard} glass-card`}>
                        <div className={styles.metricTitle}>Margin Keuntungan</div>
                        <div className={styles.metricValue} style={{ color: "var(--color-warning)" }}>
                            {stats.marginLaba.toFixed(1)}%
                        </div>
                    </div>
                </section>

                {/* Charts Split */}
                <section className={styles.chartsGrid}>
                    <div className={`${styles.chartCard} glass-card`}>
                        <h3 className={styles.chartTitle}>Alokasi Pengeluaran UMKM</h3>
                        <DonutChart
                            data={expenseDist.data}
                            labels={expenseDist.labels}
                            colors={["#ef4444", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6"]}
                            size={160}
                        />
                    </div>

                    <div className={`${styles.chartCard} glass-card`} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <h3 className={styles.chartTitle} style={{ marginBottom: "16px" }}>Kesehatan Finansial</h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.1)" }}>
                                <div style={{ fontSize: "0.85rem", color: "var(--color-success)", fontWeight: "600", marginBottom: "4px" }}>
                                    Rekomendasi Arus Kas
                                </div>
                                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                                    {stats.labaRugi > 500000 
                                        ? "Arus kas Anda surplus dan sehat! Rekomendasi: Alokasikan 20% laba untuk re-stock bahan baku kritis, simpan 30% sebagai dana darurat bisnis."
                                        : "Arus kas Anda menipis. Rekomendasi: Kurangi pengeluaran biaya utilitas non-darurat dan buat diskon POS untuk meningkatkan volume transaksi harian."}
                                </p>
                            </div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", borderTop: "1px solid var(--border-glass)", paddingTop: "12px" }}>
                                <span style={{ color: "var(--text-secondary)" }}>Rasio Biaya Operasional</span>
                                <span style={{ fontWeight: "700" }}>
                                    {stats.totalPemasukan > 0 ? ((stats.totalPengeluaran / stats.totalPemasukan) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cashflow logs */}
                <section className={`${styles.logCard} glass-card`}>
                    <div className={styles.logHeader}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Jurnal Pencatatan Kas</h3>
                        
                        <div className={styles.tableFilters}>
                            <button
                                className={`${styles.typeBtn} ${filterType === "Semua" ? "btn-primary" : "btn-secondary"}`}
                                style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.75rem" }}
                                onClick={() => setFilterType("Semua")}
                            >
                                Semua
                            </button>
                            <button
                                className={`${styles.typeBtn} ${filterType === "pemasukan" ? "btn-primary" : "btn-secondary"}`}
                                style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.75rem" }}
                                onClick={() => setFilterType("pemasukan")}
                            >
                                Pemasukan
                            </button>
                            <button
                                className={`${styles.typeBtn} ${filterType === "pengeluaran" ? "btn-primary" : "btn-secondary"}`}
                                style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.75rem" }}
                                onClick={() => setFilterType("pengeluaran")}
                            >
                                Pengeluaran
                            </button>
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Kategori</th>
                                    <th>Keterangan</th>
                                    <th>Tipe</th>
                                    <th style={{ textAlign: "right" }}>Jumlah</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCashflow.map((cf) => (
                                    <tr key={cf.id}>
                                        <td>
                                            {new Date(cf.date).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </td>
                                        <td>
                                            <span className="badge badge-success" style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: "none" }}>
                                                {cf.category}
                                            </span>
                                        </td>
                                        <td>{cf.description}</td>
                                        <td>
                                            <span className={`badge ${cf.type === "pemasukan" ? "badge-success" : "badge-danger"}`}>
                                                {cf.type === "pemasukan" ? "Masuk" : "Keluar"}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: "right" }} className={cf.type === "pemasukan" ? styles.amountIn : styles.amountOut}>
                                            {cf.type === "pemasukan" ? "+" : "-"} Rp {cf.amount.toLocaleString("id-ID")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Add Entry Modal Overlay */}
                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modalContent} glass-card animate-slide`}>
                            <div className={styles.modalHeader}>
                                <span>📝 Catat Transaksi Arus Kas</span>
                                <button
                                    style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitEntry}>
                                <div className={styles.typeSelector}>
                                    <div
                                        className={`${styles.typeBtn} ${entryType === "pemasukan" ? styles.typeBtnActiveIn : ""}`}
                                        onClick={() => {
                                            setEntryType("pemasukan");
                                            setEntryCategory("Penjualan");
                                        }}
                                    >
                                        📈 Pemasukan
                                    </div>
                                    <div
                                        className={`${styles.typeBtn} ${entryType === "pengeluaran" ? styles.typeBtnActiveOut : ""}`}
                                        onClick={() => {
                                            setEntryType("pengeluaran");
                                            setEntryCategory("Bahan Baku");
                                        }}
                                    >
                                        📉 Pengeluaran
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Nominal Jumlah (Rupiah)</label>
                                    <input
                                        type="number"
                                        placeholder="Contoh: 250000"
                                        className="glass-input"
                                        required
                                        value={entryAmount}
                                        onChange={(e) => setEntryAmount(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Kategori Kas</label>
                                    <select
                                        className="glass-input"
                                        style={{ cursor: "pointer" }}
                                        value={entryCategory}
                                        onChange={(e) => setEntryCategory(e.target.value)}
                                    >
                                        {entryType === "pengeluaran"
                                            ? expenseCategories.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))
                                            : incomeCategories.map((c) => (
                                                    <option key={c} value={c}>
                                                        {c}
                                                    </option>
                                                ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Keterangan Tambahan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Beli kemasan pouch / Bayar listrik toko"
                                        className="glass-input"
                                        required
                                        value={entryDesc}
                                        onChange={(e) => setEntryDesc(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formActions}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Simpan Catatan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
