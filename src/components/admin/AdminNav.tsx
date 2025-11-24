import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Database, Server, Settings, Home } from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/providers', label: 'Providers', icon: Server },
    { href: '/admin/apis', label: 'APIs', icon: Database },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminNav() {
    const router = useRouter();

    return (
        <nav className="w-64 bg-surface border-r border-gray-800 min-h-screen p-4 flex flex-col">
            <div className="mb-8 px-4">
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            </div>

            <div className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors ${isActive
                                    ? 'bg-primary text-white'
                                    : 'text-gray-400 hover:bg-surface-light hover:text-white'
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-auto pt-4 border-t border-gray-800">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-surface-light hover:text-white rounded-md"
                >
                    <Home size={20} />
                    <span>Back to Site</span>
                </Link>
            </div>
        </nav>
    );
}
