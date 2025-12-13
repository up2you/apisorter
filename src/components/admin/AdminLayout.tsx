import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { AdminNav } from './AdminNav';

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'loading') return;
        if (!session?.user || session.user.role !== 'ADMIN') {
            router.push('/auth/signin');
        }
    }, [session, status, router]);

    if (status === 'loading') {
        return <div className="min-h-screen flex items-center justify-center bg-midnight text-white">Loading...</div>;
    }

    if (!session?.user || session.user.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-midnight text-gray-100 font-sans">
            <AdminNav />
            <main className="flex-1 p-8 overflow-y-auto ml-64">
                {children}
            </main>
        </div>
    );
}
