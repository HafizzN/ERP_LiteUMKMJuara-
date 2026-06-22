import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router, usePage } from "@inertiajs/react";
import styles from "./POS.module.css";

interface Product {
    id: number;
    name: string;
    sku: string;
    price: number;
    stock: number;
    category: string;
    image_color: string;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    points: number;
    tier: string;
}

interface POSProps {
    products: Product[];
    customers: Customer[];
}

interface CartItem {
    product: Product;
    quantity: number;
}

export default function POS({ products, customers }: POSProps) {
    const { flash } = usePage().props as any;

    // Local state
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("Semua");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState("");
    const [discountInput, setDiscountInput] = useState("");
    const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS" | "Transfer">("Tunai");

    const [showReceipt, setShowReceipt] = useState(false);
    const [completedTxn, setCompletedTxn] = useState<any>(null);

    // Watch for flash success of transaction
    useEffect(() => {
        if (flash?.transaction) {
            setCompletedTxn(flash.transaction);
            setShowReceipt(true);
        }
    }, [flash]);

    const categories = ["Semua", "Kopi", "Non-Kopi", "Bakery"];

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        if (product.stock <= 0) return;

        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.product.id === product.id);
            if (existingItem) {
                const nextQty = Math.min(existingItem.quantity + 1, product.stock);
                return prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: nextQty } : item
                );
            } else {
                return [...prevCart, { product, quantity: 1 }];
            }
        });
    };

    const updateCartQty = (productId: number, delta: number) => {
        const product = products.find((p) => p.id === productId);
        if (!product) return;

        setCart((prevCart) =>
            prevCart
                .map((item) => {
                    if (item.product.id === productId) {
                        const nextQty = Math.min(Math.max(1, item.quantity + delta), product.stock);
                        return { ...item, quantity: nextQty };
                    }
                    return item;
                })
                .filter((item) => item.quantity > 0)
        );
    };

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    };

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discount = Math.min(Number(discountInput) || 0, subtotal);
    const tax = Math.round((subtotal - discount) * 0.1); // 10% PPN
    const total = subtotal - discount + tax;

    const handleCheckout = () => {
        if (cart.length === 0) return;

        router.post(
            route("pos.transaction"),
            {
                items: cart.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                })),
                discount: discount,
                tax: tax,
                paymentMethod: paymentMethod,
                customerId: selectedCustomerId || null,
            },
            {
                preserveState: true,
                onSuccess: () => {
                    // Handled by useEffect matching flash
                },
            }
        );
    };

    const resetSalesState = () => {
        setCart([]);
        setSelectedCustomerId("");
        setDiscountInput("");
        setPaymentMethod("Tunai");
        setShowReceipt(false);
        setCompletedTxn(null);
        // Clear session flash
        router.get(route("pos"), {}, { replace: true, preserveState: true });
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
            <Head title="Point of Sale (POS)" />

            <div className="animate-fade">
                <header style={{ marginBottom: "24px" }}>
                    <h1 style={{ fontSize: "1.8rem", fontWeight: 800 }}>Point of Sale (POS)</h1>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        Input pesanan pelanggan dengan cepat & lakukan pembayaran secara instan.
                    </p>
                </header>

                <div className={styles.posLayout}>
                    {/* Left Column: Products Listing */}
                    <div className={styles.leftCol}>
                        <div className={styles.searchBar}>
                            <input
                                type="text"
                                placeholder="Cari produk berdasarkan nama atau SKU..."
                                className="glass-input"
                                style={{ flex: 1 }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button className="btn-secondary" onClick={() => setSearchTerm("")}>
                                    Reset
                                </button>
                            )}
                        </div>

                        <div className={styles.categoryTabs}>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    className={`${styles.tab} ${selectedCategory === cat ? styles.activeTab : ""}`}
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className={styles.productGrid}>
                            {filteredProducts.map((p) => {
                                const isOutOfStock = p.stock <= 0;
                                const cartItem = cart.find((item) => item.product.id === p.id);
                                const qtyInCart = cartItem ? cartItem.quantity : 0;
                                const effectiveStock = p.stock - qtyInCart;

                                return (
                                    <div
                                        key={p.id}
                                        className={`${styles.productCard} glass-card ${
                                            isOutOfStock || effectiveStock <= 0 ? styles.productCardDisabled : ""
                                        }`}
                                        onClick={() => (effectiveStock > 0 ? addToCart(p) : null)}
                                    >
                                        <div className={styles.cardHeader} style={{ backgroundColor: p.image_color }}>
                                            {getInitials(p.name)}
                                        </div>
                                        <div className={styles.productName}>{p.name}</div>
                                        <div className={styles.productFooter}>
                                            <span className={styles.productPrice}>Rp {p.price.toLocaleString("id-ID")}</span>
                                            <span
                                                className={styles.productStock}
                                                style={{
                                                    color:
                                                        effectiveStock <= 3
                                                            ? "var(--color-danger)"
                                                            : effectiveStock <= 8
                                                            ? "var(--color-warning)"
                                                            : "var(--text-secondary)",
                                                }}
                                            >
                                                {effectiveStock <= 0 ? "Habis" : `Stok: ${effectiveStock}`}
                                            </span>
                                        </div>
                                        {qtyInCart > 0 && (
                                            <div
                                                className="badge badge-success"
                                                style={{ position: "absolute", top: "8px", right: "8px" }}
                                            >
                                                {qtyInCart}x
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: Checkout Cart */}
                    <div className={styles.rightCol}>
                        <div className={`${styles.cartCard} glass-card`}>
                            <div className={styles.cartHeader}>
                                <span>Keranjang Belanja</span>
                                <span className="badge badge-success">{cart.length} Jenis</span>
                            </div>

                            <div className={styles.cartList}>
                                {cart.length === 0 ? (
                                    <div className={styles.emptyCart}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            style={{ width: "48px", height: "48px" }}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                                        />
                                        </svg>
                                        <span>Keranjang masih kosong</span>
                                    </div>
                                ) : (
                                    cart.map((item) => (
                                        <div key={item.product.id} className={styles.cartItem}>
                                            <div className={styles.cartItemDetails}>
                                                <span className={styles.cartItemName}>{item.product.name}</span>
                                                <span className={styles.cartItemPrice}>
                                                    Rp {(item.product.price * item.quantity).toLocaleString("id-ID")}
                                                </span>
                                            </div>
                                            <div className={styles.cartItemQtyActions}>
                                                <button className={styles.qtyBtn} onClick={() => updateCartQty(item.product.id, -1)}>
                                                    -
                                                </button>
                                                <span className={styles.qtyText}>{item.quantity}</span>
                                                <button className={styles.qtyBtn} onClick={() => updateCartQty(item.product.id, 1)}>
                                                    +
                                                </button>
                                                <button className={styles.deleteBtn} onClick={() => removeFromCart(item.product.id)}>
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <div className={styles.checkoutSummary}>
                                    <div className={styles.customerSelect}>
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                            Pilih Pelanggan (CRM)
                                        </label>
                                        <select
                                            className="glass-input"
                                            value={selectedCustomerId}
                                            onChange={(e) => setSelectedCustomerId(e.target.value)}
                                            style={{ width: "100%", cursor: "pointer" }}
                                        >
                                            <option value="">-- Pelanggan Umum --</option>
                                            {customers.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {c.name} ({c.tier} - {c.points} Poin)
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.customerSelect}>
                                        <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                                            Diskon (Rupiah)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Masukkan nominal diskon..."
                                            className="glass-input"
                                            value={discountInput}
                                            onChange={(e) => setDiscountInput(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "8px" }}>
                                        <div className={styles.summaryRow}>
                                            <span>Subtotal</span>
                                            <span>Rp {subtotal.toLocaleString("id-ID")}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className={styles.summaryRow} style={{ color: "var(--color-danger)" }}>
                                                <span>Diskon</span>
                                                <span>-Rp {discount.toLocaleString("id-ID")}</span>
                                            </div>
                                        )}
                                        <div className={styles.summaryRow}>
                                            <span>Pajak (PPN 10%)</span>
                                            <span>Rp {tax.toLocaleString("id-ID")}</span>
                                        </div>
                                        <div className={styles.summaryRowTotal}>
                                            <span>Total Pembayaran</span>
                                            <span style={{ color: "var(--color-success)" }}>Rp {total.toLocaleString("id-ID")}</span>
                                        </div>
                                    </div>

                                    <div className={styles.paymentMethodSection}>
                                        <div className={styles.paymentTitle}>Metode Pembayaran</div>
                                        <div className={styles.paymentGrid}>
                                            {(["Tunai", "QRIS", "Transfer"] as const).map((method) => (
                                                <button
                                                    key={method}
                                                    className={`${styles.paymentBtn} ${
                                                        paymentMethod === method ? styles.paymentBtnActive : ""
                                                    }`}
                                                    onClick={() => setPaymentMethod(method)}
                                                >
                                                    {method === "Tunai" ? "💵 Tunai" : method === "QRIS" ? "📱 QRIS" : "💳 Transfer"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button className="btn-primary styles.checkoutBtn" onClick={handleCheckout}>
                                        🛒 Proses Transaksi (Bayar)
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Receipt */}
            {showReceipt && completedTxn && (
                <div className={styles.modalOverlay}>
                    <div className="animate-slide">
                        <div className={styles.receiptContainer}>
                            <div className={styles.receiptHeader}>
                                <div className={styles.receiptShopName}>KOPI KITA & BAKERY</div>
                                <div className={styles.receiptInfo}>Ruko Berkah Jaya, Jakarta</div>
                                <div className={styles.receiptInfo}>Telp: 0812-3456-7890</div>
                            </div>

                            <div style={{ fontSize: "0.8rem", marginBottom: "12px" }}>
                                <div>No: #T{completedTxn.id}</div>
                                <div>Tanggal: {new Date(completedTxn.date).toLocaleString("id-ID")}</div>
                                <div>Kasir: Warung Berkah</div>
                                <div>Pelanggan: {completedTxn.customer?.name || "Pelanggan Umum"}</div>
                            </div>

                            <div className={styles.receiptDivider} />

                            {completedTxn.items?.map((item: any, idx: number) => (
                                <div key={idx} className={styles.receiptItem}>
                                    <div>
                                        {item.name} <br />
                                        <span style={{ color: "#64748b" }}>
                                            {item.quantity} x Rp {item.price.toLocaleString("id-ID")}
                                        </span>
                                    </div>
                                    <div>Rp {(item.price * item.quantity).toLocaleString("id-ID")}</div>
                                </div>
                            ))}

                            <div className={styles.receiptDivider} />

                            <div className={styles.receiptSummaryRow}>
                                <span>Subtotal:</span>
                                <span>Rp {completedTxn.subtotal.toLocaleString("id-ID")}</span>
                            </div>
                            {completedTxn.discount > 0 && (
                                <div className={styles.receiptSummaryRow} style={{ color: "#ef4444" }}>
                                    <span>Diskon:</span>
                                    <span>-Rp {completedTxn.discount.toLocaleString("id-ID")}</span>
                                </div>
                            )}
                            <div className={styles.receiptSummaryRow}>
                                <span>Pajak (10%):</span>
                                <span>Rp {completedTxn.tax.toLocaleString("id-ID")}</span>
                            </div>
                            <div className={styles.receiptSummaryRowTotal}>
                                <span>TOTAL:</span>
                                <span>Rp {completedTxn.total.toLocaleString("id-ID")}</span>
                            </div>

                            <div className={styles.receiptDivider} />

                            <div style={{ fontSize: "0.85rem", display: "flex", justifyContent: "space-between" }}>
                                <span>Metode Bayar:</span>
                                <span style={{ fontWeight: "bold" }}>{completedTxn.payment_method}</span>
                            </div>

                            {completedTxn.customer_id && (
                                <div className={styles.receiptLoyalty}>
                                    ⭐ CRM Poin Bertambah: +{Math.floor(completedTxn.total / 1000)} Poin!
                                </div>
                            )}

                            <div className={styles.receiptFooter}>
                                <div>TERIMA KASIH ATAS KUNJUNGAN ANDA</div>
                                <div>Powered by Laravel & Inertia</div>
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                onClick={() => {
                                    alert("Struk berhasil dikirim ke antrean cetak thermal! (Simulasi)");
                                }}
                            >
                                🖨️ Cetak Thermal
                            </button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={resetSalesState}>
                                🔄 Transaksi Baru
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
