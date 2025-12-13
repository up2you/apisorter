import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, Users, CreditCard, Shield, Settings, Activity, List, Tag, Radio, DollarSign, Megaphone, Inbox } from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/admin/analytics', icon: Activity },
    { name: 'Crawler', href: '/admin/crawler', icon: Radio },
    { name: 'Discovery', href: '/admin/discovery', icon: Tag },
    { name: 'APIs', href: '/admin/apis', icon: List },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'Claims', href: '/admin/claims', icon: Shield },
    { name: 'Ads', href: '/admin/ads', icon: Megaphone },
    { name: 'Communications', href: '/admin/communications', icon: Inbox },
];

export function AdminNav() {
    const router = useRouter();

    return (
        <nav className="w-64 bg-surface border-r border-white/10 p-4 flex flex-col h-screen fixed left-0 top-0">
            <div className="flex items-center gap-3 px-4 mb-8">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-white">AS</span>
                </div>
                <span className="font-bold text-white text-lg">Admin Panel</span>
            </div>

            <div className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = router.pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-white/10 space-y-1">
                <Link
                    href="/admin/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${router.pathname === '/admin/settings'
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                >
                    <Settings size={18} />
                    Settings
                </Link>
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                    <LayoutDashboard size={18} />
                    View Site
                </Link>
            </div>
        </nav>
    );
}
