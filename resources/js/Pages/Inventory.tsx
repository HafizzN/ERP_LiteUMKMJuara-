import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import styles from "./Inventory.module.css";

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    image_color: string;
}

interface InventoryProps {
    products: Product[];
}

export default function Inventory({ products }: InventoryProps) {
    // Filters state
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("Semua");
    const [stockFilter, setStockFilter] = useState("Semua");

    // Modal form state
    const [showAddModal, setShowAddModal] = useState(false);
    const [newProdName, setNewProdName] = useState("");
    const [newProdPrice, setNewProdPrice] = useState("");
    const [newProdStock, setNewProdStock] = useState("");
    const [newProdCategory, setNewProdCategory] = useState("Kopi");
    const [selectedColor, setSelectedColor] = useState("#6366f1");

    const presetColors = [
        "#6366f1", // Indigo
        "#10b981", // Emerald
        "#f59e0b", // Amber
        "#ef4444", // Rose
        "#8b5cf6", // Purple
        "#0ea5e9", // Sky
        "#ec4899", // Pink
        "#14b8a6", // Teal
    ];

    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "Semua" || p.category === categoryFilter;
        
        let matchesStock = true;
        if (stockFilter === "Stok Aman") {
            matchesStock = p.stock > 10;
        } else if (stockFilter === "Stok Menipis") {
            matchesStock = p.stock > 0 && p.stock <= 10;
        } else if (stockFilter === "Stok Habis") {
            matchesStock = p.stock === 0;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    const updateStockLevel = (productId: number, delta: number) => {
        router.post(
            route("inventory.adjust", { product: productId }),
            { delta: delta },
            { preserveScroll: true }
        );
    };

    const handleSubmitProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProdName || !newProdPrice || !newProdStock) {
            alert("Semua kolom harus diisi!");
            return;
        }

        router.post(
            route("inventory.product"),
            {
                name: newProdName,
                price: Number(newProdPrice),
                stock: Number(newProdStock),
                category: newProdCategory,
                imageColor: selectedColor,
            },
            {
                onSuccess: () => {
                    setNewProdName("");
                    setNewProdPrice("");
                    setNewProdStock("");
                    setNewProdCategory("Kopi");
                    setSelectedColor("#6366f1");
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
            <Head title="Inventaris & Stok Produk" />

            <div className="animate-fade">
                <header className={styles.headerSection}>
                    <div>
                        <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Inventaris & Stok Produk</h1>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                            Kelola katalog produk, pantau level stok, dan sesuaikan ketersediaan barang.
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        ➕ Tambah Produk
                    </button>
                </header>

                <section className={styles.filterBar}>
                    <div>
                        <input
                            type="text"
                            placeholder="Cari produk berdasarkan nama atau SKU..."
                            className="glass-input"
                            style={{ width: "100%" }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div>
                        <select
                            className="glass-input"
                            style={{ width: "100%", cursor: "pointer" }}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="Semua">Kategori: Semua</option>
                            <option value="Kopi">Kopi</option>
                            <option value="Non-Kopi">Non-Kopi</option>
                            <option value="Bakery">Bakery</option>
                        </select>
                    </div>

                    <div>
                        <select
                            className="glass-input"
                            style={{ width: "100%", cursor: "pointer" }}
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                        >
                            <option value="Semua">Filter Stok: Semua</option>
                            <option value="Stok Aman">Stok Aman (&gt; 10)</option>
                            <option value="Stok Menipis">Stok Menipis (1 - 10)</option>
                            <option value="Stok Habis">Stok Habis (0)</option>
                        </select>
                    </div>
                </section>

                <section className={styles.grid}>
                    {filteredProducts.map((p) => {
                        const isOutOfStock = p.stock === 0;
                        const isLowStock = p.stock > 0 && p.stock <= 10;

                        return (
                            <div key={p.id} className={`${styles.card} glass-card`}>
                                <div className={styles.cardVisual} style={{ backgroundColor: p.image_color }}>
                                    {getInitials(p.name)}
                                </div>
                                <div className={styles.sku}>{p.sku}</div>
                                <h3 className={styles.name}>{p.name}</h3>
                                <div className={styles.price}>Rp {p.price.toLocaleString("id-ID")}</div>

                                <div className={styles.stockSection}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span className={styles.stockLabel}>Level Stok</span>
                                        <span
                                            className={`badge ${
                                                isOutOfStock ? "badge-danger" : isLowStock ? "badge-warning" : "badge-success"
                                            }`}
                                            style={{ marginTop: "4px", alignSelf: "flex-start", padding: "2px 8px" }}
                                        >
                                            {isOutOfStock ? "Habis" : isLowStock ? "Menipis" : "Aman"}
                                        </span>
                                    </div>
                                    
                                    <div className={styles.stockAdjustment}>
                                        <button className={styles.adjustBtn} onClick={() => updateStockLevel(p.id, -1)}>
                                            -
                                        </button>
                                        <span
                                            className={styles.stockValue}
                                            style={{
                                                color: isOutOfStock
                                                    ? "var(--color-danger)"
                                                    : isLowStock
                                                    ? "var(--color-warning)"
                                                    : "#fff",
                                            }}
                                        >
                                            {p.stock}
                                        </span>
                                        <button className={styles.adjustBtn} onClick={() => updateStockLevel(p.id, 1)}>
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </section>

                {showAddModal && (
                    <div className={styles.modalOverlay}>
                        <div className={`${styles.modalContent} glass-card animate-slide`}>
                            <div className={styles.modalHeader}>
                                <span>➕ Tambah Produk Baru</span>
                                <button
                                    style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}
                                    onClick={() => setShowAddModal(false)}
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitProduct}>
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Nama Produk</label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Double Choco Muffin"
                                        className="glass-input"
                                        required
                                        value={newProdName}
                                        onChange={(e) => setNewProdName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Harga (Rupiah)</label>
                                        <input
                                            type="number"
                                            placeholder="Contoh: 15000"
                                            className="glass-input"
                                            required
                                            value={newProdPrice}
                                            onChange={(e) => setNewProdPrice(e.target.value)}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.formLabel}>Stok Awal</label>
                                        <input
                                            type="number"
                                            placeholder="Contoh: 50"
                                            className="glass-input"
                                            required
                                            value={newProdStock}
                                            onChange={(e) => setNewProdStock(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>Kategori</label>
                                    <select
                                        className="glass-input"
                                        style={{ cursor: "pointer" }}
                                        value={newProdCategory}
                                        onChange={(e) => setNewProdCategory(e.target.value)}
                                    >
                                        <option value="Kopi">Kopi</option>
                                        <option value="Non-Kopi">Non-Kopi</option>
                                        <option value="Bakery">Bakery</option>
                                    </select>
                                </div>

                                <div className={styles.colorPickerSection}>
                                    <label className={styles.formLabel}>Dekorasi Visual Kartu</label>
                                    <div className={styles.colorPresets}>
                                        {presetColors.map((color) => (
                                            <div
                                                key={color}
                                                className={`${styles.colorBubble} ${
                                                    selectedColor === color ? styles.colorBubbleActive : ""
                                                }`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => setSelectedColor(color)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-primary">
                                        Simpan Produk
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
