import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode } from 'react';

interface AuthenticatedProps {
    header?: ReactNode;
}

export default function AuthenticatedLayout({
    header,
    children,
}: PropsWithChildren<AuthenticatedProps>) {
    const user = usePage().props.auth.user;
    
    // Get current URL path to highlight active sidebar item
    const currentUrl = window.location.pathname;

    const navItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            routeName: "dashboard",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="sidebar-icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                </svg>
            ),
        },
        {
            name: "Kasir (POS)",
            href: "/pos",
            routeName: "pos",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="sidebar-icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                </svg>
            ),
        },
        {
            name: "Produk & Stok",
            href: "/inventory",
            routeName: "inventory",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="sidebar-icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                    />
                </svg>
            ),
        },
        {
            name: "Buku Kas",
            href: "/finance",
            routeName: "finance",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="sidebar-icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5h16.5m-18 0a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 003.75 19.5h16.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0020.25 4.5M3.75 4.5V15M20.25 4.5V15m-16.5 4.5h16.5"
                    />
                </svg>
            ),
        },
        {
            name: "Pelanggan",
            href: "/customers",
            routeName: "customers",
            icon: (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="sidebar-icon"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                </svg>
            ),
        },
    ];

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="erp-body flex">
            {/* Sidebar Left */}
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">E</div>
                    <div className="sidebar-logo-text">
                        <span className="sidebar-logo-title">ERP Lite</span>
                        <span className="sidebar-logo-subtitle">UMKM Juara 🥇</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const isActive = currentUrl === item.href || currentUrl.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-profile">
                    <div className="sidebar-avatar">{getInitials(user.name)}</div>
                    <div className="sidebar-profile-info">
                        <span className="sidebar-profile-name">{user.name}</span>
                        <span className="sidebar-profile-role">Mitra UMKM 🏆</span>
                    </div>
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="sidebar-logout-btn"
                        title="Log Out"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            style={{ width: "20px", height: "20px" }}
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                            />
                        </svg>
                    </Link>
                </div>
            </aside>

            {/* Main Content Right */}
            <main
                style={{
                    flex: 1,
                    marginLeft: "var(--sidebar-width)",
                    padding: "32px",
                    width: "calc(100% - var(--sidebar-width))",
                    minHeight: "100vh",
                    overflowY: "auto",
                }}
            >
                {/* Header (optional page header) */}
                {header && (
                    <header style={{ marginBottom: "32px" }}>
                        {header}
                    </header>
                )}
                
                {/* Page Content */}
                <div className="animate-fade">
                    {children}
                </div>
            </main>
        </div>
    );
}
