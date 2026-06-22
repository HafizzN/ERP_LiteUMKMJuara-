import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { LineChart, DonutChart } from "@/Components/SvgCharts";
import styles from "./Dashboard.module.css";

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    image_color: string;
}

interface DashboardProps {
    metrics: {
        totalPenjualan: number;
        totalPengeluaran: number;
        labaBersih: number;
        jumlahTransaksi: number;
    };
    sales7Days: {
        labels: string[];
        data: number[];
    };
    categorySales: {
        labels: string[];
        data: number[];
    };
    criticalStock: Product[];
    recentTransactions: {
        id: number;
        date: string;
        total: number;
        paymentMethod: string;
        customerName: string;
    }[];
}

export default function Dashboard({
    metrics,
    sales7Days,
    categorySales,
    criticalStock,
    recentTransactions,
}: DashboardProps) {
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        const today = new Date();
        const options: Intl.DateTimeFormatOptions = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        };
        setCurrentDate(today.toLocaleDateString("id-ID", options));
    }, []);

    return (
        <AuthenticatedLayout>
            <Head title="Ringkasan Performa UMKM" />

            <div className="animate-fade">
                {/* Header */}
                <header className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Ringkasan Performa UMKM</h1>
                        <p className={styles.subtitle}>Selamat datang kembali. Pantau performa bisnis secara visual.</p>
                    </div>
                    <div className={styles.dateBadge}>📅 {currentDate}</div>
                </header>

                {/* Metrics Cards Grid */}
                <section className={styles.metricsGrid}>
                    {/* Card 1: Penjualan */}
                    <div className={`${styles.metricCard} glass-card`}>
                        <div className={styles.metricHeader}>
                            <span>Penjualan</span>
                            <div className={`${styles.metricIcon} ${styles.iconPenjualan}`}>📈</div>
                        </div>
                        <div className={styles.metricValue}>Rp {metrics.totalPenjualan.toLocaleString("id-ID")}</div>
                        <div className={styles.metricFooter}>
                            <span className={styles.trendUp}>+12.4%</span> vs minggu lalu
                        </div>
                    </div>

                    {/* Card 2: Pengeluaran */}
                    <div className={`${styles.metricCard} glass-card`}>
                        <div className={styles.metricHeader}>
                            <span>Pengeluaran</span>
                            <div className={`${styles.metricIcon} ${styles.iconPengeluaran}`}>💸</div>
                        </div>
                        <div className={styles.metricValue}>Rp {metrics.totalPengeluaran.toLocaleString("id-ID")}</div>
                        <div className={styles.metricFooter}>
                            <span className={styles.trendDown}>-3.2%</span> vs minggu lalu
                        </div>
                    </div>

                    {/* Card 3: Laba Bersih */}
                    <div className={`${styles.metricCard} glass-card glow-indigo`}>
                        <div className={styles.metricHeader}>
                            <span>Laba Bersih</span>
                            <div className={`${styles.metricIcon} ${styles.iconLaba}`}>🏆</div>
                        </div>
                        <div className={styles.metricValue} style={{ color: "var(--color-success)" }}>
                            Rp {metrics.labaBersih.toLocaleString("id-ID")}
                        </div>
                        <div className={styles.metricFooter}>
                            <span className={styles.trendUp}>+18.1%</span> efisiensi operasional
                        </div>
                    </div>

                    {/* Card 4: Transaksi */}
                    <div className={`${styles.metricCard} glass-card`}>
                        <div className={styles.metricHeader}>
                            <span>Jumlah Transaksi</span>
                            <div className={`${styles.metricIcon} ${styles.iconTransaksi}`}>🛒</div>
                        </div>
                        <div className={styles.metricValue}>{metrics.jumlahTransaksi}</div>
                        <div className={styles.metricFooter}>
                            Rata-rata Rp {(metrics.totalPenjualan / (metrics.jumlahTransaksi || 1)).toLocaleString("id-ID", { maximumFractionDigits: 0 })} / trx
                        </div>
                    </div>
                </section>

                {/* Charts Grid */}
                <section className={styles.chartsGrid}>
                    {/* Trend Penjualan */}
                    <div className={`${styles.chartCard} glass-card`}>
                        <h3 className={styles.chartTitle}>
                            <span>Tren Penjualan (7 Hari Terakhir)</span>
                            <span className="badge badge-success">Live Database</span>
                        </h3>
                        <LineChart data={sales7Days.data} labels={sales7Days.labels} height={220} />
                    </div>

                    {/* Kategori Terlaris */}
                    <div className={`${styles.chartCard} glass-card`}>
                        <h3 className={styles.chartTitle}>Distribusi Kategori Penjualan</h3>
                        <DonutChart data={categorySales.data} labels={categorySales.labels} size={150} />
                    </div>
                </section>

                {/* Content Split Grid (Stock & Transactions) */}
                <section className={styles.contentGrid}>
                    {/* Peringatan Stok */}
                    <div className={`${styles.listCard} glass-card`}>
                        <div className={styles.listHeader}>
                            <span style={{ color: "var(--color-danger)" }}>⚠️ Peringatan Stok (Menipis/Habis)</span>
                            <span className="badge badge-danger">{criticalStock.length} Produk</span>
                        </div>
                        <div className={styles.itemList}>
                            {criticalStock.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>
                                    Semua stok produk dalam kondisi aman! 👍
                                </p>
                            ) : (
                                criticalStock.map((p) => (
                                    <div key={p.id} className={styles.stockItem}>
                                        <div className={styles.productMeta}>
                                            <div className={styles.colorIndicator} style={{ backgroundColor: p.image_color }} />
                                            <div>
                                                <div className={styles.productName}>{p.name}</div>
                                                <div className={styles.productSku}>{p.sku} • {p.category}</div>
                                            </div>
                                        </div>
                                        <div className={styles.stockStatus}>
                                            <span
                                                className={`badge ${p.stock <= 3 ? "badge-danger" : "badge-warning"}`}
                                                style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                                            >
                                                {p.stock <= 3 ? "Kritis" : "Menipis"}
                                            </span>
                                            <span className={styles.stockCount} style={{ color: p.stock <= 3 ? "var(--color-danger)" : "var(--color-warning)" }}>
                                                Sisa {p.stock} pcs
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Transaksi Terkini */}
                    <div className={`${styles.listCard} glass-card`}>
                        <div className={styles.listHeader}>
                            <span>🧾 Riwayat Transaksi Terkini</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-primary)", fontWeight: "600" }}>
                                Database Sync
                            </span>
                        </div>
                        <div className={styles.itemList}>
                            {recentTransactions.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "20px" }}>
                                    Belum ada transaksi tercatat.
                                </p>
                            ) : (
                                recentTransactions.map((t) => (
                                    <div key={t.id} className={styles.transactionItem}>
                                        <div className={styles.txnMeta}>
                                            <span className={styles.txnId}>Transaksi #T{t.id}</span>
                                            <span className={styles.txnDate}>
                                                {new Date(t.date).toLocaleDateString("id-ID", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })} • {t.customerName}
                                            </span>
                                        </div>
                                        <div className={styles.txnDetails}>
                                            <span className={styles.txnAmount}>Rp {t.total.toLocaleString("id-ID")}</span>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor:
                                                        t.paymentMethod === "QRIS"
                                                            ? "rgba(14, 165, 233, 0.15)"
                                                            : t.paymentMethod === "Transfer"
                                                            ? "rgba(99, 102, 241, 0.15)"
                                                            : "rgba(16, 185, 129, 0.15)",
                                                    color:
                                                        t.paymentMethod === "QRIS"
                                                            ? "var(--color-info)"
                                                            : t.paymentMethod === "Transfer"
                                                            ? "var(--color-primary)"
                                                            : "var(--color-success)",
                                                    border: "none",
                                                }}
                                            >
                                                {t.paymentMethod}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
