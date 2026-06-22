import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import styles from "./Customers.module.css";

interface Customer {
    id: number;
    name: string;
    phone: string;
    points: number;
    tier: string;
    stats: {
        count: number;
        total: number;
    };
}

interface CustomersProps {
    customers: Customer[];
}

export default function Customers({ customers }: CustomersProps) {
    // State
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [custName, setCustName] = useState("");
    const [custPhone, setCustPhone] = useState("");

    // CRM metrics
    const goldCount = customers.filter((c) => c.tier === "Gold").length;
    const silverCount = customers.filter((c) => c.tier === "Silver").length;
    const bronzeCount = customers.filter((c) => c.tier === "Bronze").length;

    // Filtered customers
    const filteredCustomers = customers.filter((c) => {
        return (
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        );
    });

    const handleSubmitCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!custName || !custPhone) {
            alert("Nama dan Nomor Telepon wajib diisi!");
            return;
        }

        router.post(
            route("customers.store"),
            {
                name: custName,
                phone: custPhone,
            },
            {
                onSuccess: () => {
                    setCustName("");
                    setCustPhone("");
                    setShowAddModal(false);
                },
            }
        );
    };

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pelanggan & CRM Loyalitas" />

            <div className="animate-fade">
                <header className={styles.headerSection}>
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Program Loyalitas & CRM</h1>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            Kelola data pelanggan, pantau riwayat transaksi belanja, dan atur tier loyalitas poin pelanggan.
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        ➕ Daftarkan Pelanggan
                    </button>
                </header>

                {/* CRM Tiers Summary cards */}
                <section className={styles.crmGrid}>
                    <div className={`${styles.crmCard} glass-card`} style={{ borderTop: "3px solid var(--color-warning)" }}>
                        <span className={styles.tierIcon}>🥇</span>
                        <span className={styles.tierLabel}>Gold Member</span>
                        <span className={styles.tierCount} style={{ color: "var(--color-warning)" }}>
                            {goldCount} Pelanggan
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            Min. 750 Poin
                        </span>
                    </div>

                    <div className={`${styles.crmCard} glass-card`} style={{ borderTop: "3px solid #94a3b8" }}>
                        <span className={styles.tierIcon}>🥈</span>
                        <span className={styles.tierLabel}>Silver Member</span>
                        <span className={styles.tierCount} style={{ color: "#cbd5e1" }}>
                            {silverCount} Pelanggan
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            300 - 749 Poin
                        </span>
                    </div>

                    <div className={`${styles.crmCard} glass-card`} style={{ borderTop: "3px solid #b45309" }}>
                        <span className={styles.tierIcon}>🥉</span>
                        <span className={styles.tierLabel}>Bronze Member</span>
                        <span className={styles.tierCount} style={{ color: "#a16207" }}>
                            {bronzeCount} Pelanggan
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                            &lt; 300 Poin
                        </span>
                    </div>
                </section>

                {/* List Section */}
                <section className={`${styles.listCard} glass-card`}>
                    <div className={styles.listHeader}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>Database Pelanggan Terdaftar</h3>
                        
                        <div className={styles.searchBox}>
                            <input
                                type="text"
                                placeholder="Cari pelanggan berdasarkan nama/telepon..."
                                className="glass-input"
                                style={{ width: "100%" }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.customerGrid}>
                        {filteredCustomers.map((c) => {
                            const avatarColorClass =
                                c.tier === "Gold"
                                    ? styles.tierGold
                                    : c.tier === "Silver"
                                    ? styles.tierSilver
                                    : styles.tierBronze;

                            return (
                                <div key={c.id} className={`${styles.customerCard} glass-card`}>
                                    <div className={`${styles.avatar} ${avatarColorClass}`}>
                                        {getInitials(c.name)}
                                    </div>

                                    <div className={styles.details}>
                                        <h4 className={styles.name}>{c.name}</h4>
                                        <span className={styles.phone}>📞 {c.phone}</span>
                                        
                                        <div className={styles.badgeContainer}>
                                            <span
                                                className="badge"
                                                style={{
                                                    backgroundColor:
                                                        c.tier === "Gold"
                                                            ? "rgba(245, 158, 11, 0.15)"
                                                            : c.tier === "Silver"
                                                            ? "rgba(148, 163, 184, 0.15)"
                                                            : "rgba(180, 83, 9, 0.15)",
                                                    color:
                                                        c.tier === "Gold"
                                                            ? "var(--color-warning)"
                                                            : c.tier === "Silver"
                                                            ? "#cbd5e1"
                                                            : "#a16207",
                                                    border: "none",
                                                    padding: "2px 8px",
                                                }}
                                            >
                                                {c.tier} Member
                                            </span>
                                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-primary)" }}>
                                                ⭐ {c.points} Pts
                                            </span>
                                        </div>

                                        <div className={styles.history}>
                                            <span>Total Kunjungan: <strong>{c.stats.count} Transaksi</strong></span>
                                            <span>Total Belanja: <strong style={{ color: "var(--color-success)" }}>Rp {c.stats.total.toLocaleString("id-ID")}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modalContent} glass-card animate-slide`}>
                            <div className={styles.modalHeader}>
                                <span>➕ Daftarkan Pelanggan Baru</span>
                                <button
                                    style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitCustomer}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Nama Lengkap Pelanggan</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Rian Hidayat"
                                        className="glass-input"
                                        required
                                        value={custName}
                                        onChange={(e) => setCustName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Nomor Telepon / WhatsApp</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: 0812XXXXXXXX"
                                        className="glass-input"
                                        required
                                        value={custPhone}
                                        onChange={(e) => setCustPhone(e.target.value)}
                                    />
                                </div>

                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "12px", background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-glass)" }}>
                                    ℹ️ Pelanggan baru yang didaftarkan akan secara otomatis memulai dari status **Bronze Member** dengan **0 Poin**. Poin loyalitas akan terakumulasi otomatis saat bertransaksi di Point of Sale (POS).
                                </div>

                                <div className={styles.formActions}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Daftarkan Pelanggan
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
