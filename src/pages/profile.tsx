import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Star, MessageSquare, User as UserIcon, LogOut, Edit2, ShieldCheck, CreditCard, Settings, Bell, Briefcase } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

import prisma from '@/lib/prisma';
import SiteHeader from '@/components/layout/SiteHeader';
import SiteFooter from '@/components/layout/SiteFooter';
import ApiCard from '@/components/ApiCard';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

interface ProfileProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
    favorites: any[];
    reviews: any[];
    claims: any[];
    subscription: any | null;
    notificationPrefs: any | null;
}

export default function Profile({ user: initialUser, favorites, reviews, claims, subscription, notificationPrefs: initialNotificationPrefs }: ProfileProps) {
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [notificationPrefs, setNotificationPrefs] = useState(initialNotificationPrefs || {
        apiUpdateEmails: true,
        newsletterEmails: false,
    });
    const [savingSettings, setSavingSettings] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setUploadStatus({ type: 'error', text: 'File size exceeds 5MB limit' });
            return;
        }

        setUploading(true);
        setUploadStatus(null);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                body: formData,
            });

            if (res.ok) {
                const updatedUser = await res.json();
                setUser({ ...user, image: updatedUser.image });
                setUploadStatus({ type: 'success', text: 'Profile updated!' });
                setTimeout(() => setUploadStatus(null), 3000);
                router.replace(router.asPath);
            } else {
                setUploadStatus({ type: 'error', text: 'Upload failed' });
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus({ type: 'error', text: 'Upload error' });
        } finally {
            setUploading(false);
        }
    };

    const handleSettingChange = async (key: string, value: boolean) => {
        // Optimistic update
        const newPrefs = { ...notificationPrefs, [key]: value };
        setNotificationPrefs(newPrefs);
        setSavingSettings(true);

        try {
            const res = await fetch('/api/user/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPrefs),
            });

            if (!res.ok) throw new Error('Failed to update');

            // Success indication could be added here if needed
        } catch (error) {
            console.error('Settings update failed:', error);
            // Revert on failure
            setNotificationPrefs(notificationPrefs);
        } finally {
            setSavingSettings(false);
        }
    };

    return (
        <>
            <Head>
                <title>My Profile - API Sorter</title>
            </Head>
            <SiteHeader />

            <main className="min-h-screen bg-[#0d1117] pt-24 pb-12">
                <div className="container-max">

                    {/* Profile Header */}
                    <div className="bg-surface border border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="flex flex-col items-center gap-2">
                            <div className="relative group">
                                <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-accent/50 shadow-xl">
                                    {user.image ? (
                                        <Image src={user.image} alt={user.name || 'User'} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full bg-accent/20 flex items-center justify-center text-accent">
                                            <UserIcon size={40} />
                                        </div>
                                    )}
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        </div>
                                    )}
                                </div>
                                <label
                                    className="absolute bottom-0 right-0 p-1.5 bg-accent text-white rounded-full shadow-lg hover:bg-accent-light transition-colors cursor-pointer z-20"
                                    title="Upload Avatar"
                                >
                                    <Edit2 size={14} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            <span className="text-[10px] text-gray-500">Max size: 5MB</span>
                            {uploadStatus && (
                                <span className={`text-xs font-medium ${uploadStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                    {uploadStatus.text}
                                </span>
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left w-full">
                            <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                            <p className="text-gray-400 mb-4">{user.email}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <Star size={14} className="text-yellow-500" />
                                    <span>{favorites.length} Favorites</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <MessageSquare size={14} className="text-blue-500" />
                                    <span>{reviews.length} Reviews</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <ShieldCheck size={14} className="text-purple-500" />
                                    <span>{claims.length} Claims</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-white/10 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>

                    {/* Tabs */}
                    <Tab.Group>
                        <Tab.List className="flex flex-wrap gap-2 md:gap-0 md:space-x-1 rounded-xl bg-surface border border-white/10 p-1 mb-8 overflow-x-auto">
                            {[
                                { name: 'Favorites', icon: Star },
                                { name: 'My Reviews', icon: MessageSquare },
                                { name: 'Claims', icon: Briefcase },
                                { name: 'Billing', icon: CreditCard },
                                { name: 'Settings', icon: Settings },
                            ].map((tab) => (
                                <Tab
                                    key={tab.name}
                                    className={({ selected }) =>
                                        classNames(
                                            'px-6 py-2.5 text-sm font-medium leading-5 transition-all outline-none rounded-lg flex items-center gap-2 whitespace-nowrap',
                                            selected
                                                ? 'bg-accent text-white shadow'
                                                : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                                        )
                                    }
                                >
                                    <tab.icon size={16} />
                                    {tab.name}
                                </Tab>
                            ))}
                        </Tab.List>

                        <Tab.Panels>
                            {/* Favorites Panel */}
                            <Tab.Panel className="outline-none">
                                {favorites.length > 0 ? (
                                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {favorites.map((fav) => (
                                            <ApiCard
                                                key={fav.api.id}
                                                slug={fav.api.slug}
                                                name={fav.api.name}
                                                category={fav.api.category}
                                                tags={fav.api.tags}
                                                providerName={fav.api.provider?.name}
                                                providerLogo={fav.api.provider?.logoUrl}
                                                apiLogo={fav.api.logoUrl}
                                                description={fav.api.description}
                                                freeTier={fav.api.freeTier}
                                                rating={0}
                                                reviewCount={0}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-surface rounded-2xl border border-white/5 border-dashed">
                                        <Star size={48} className="mx-auto text-gray-600 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No favorites yet</h3>
                                        <p className="text-gray-500">Start exploring APIs and save your favorites here.</p>
                                    </div>
                                )}
                            </Tab.Panel>

                            {/* Reviews Panel */}
                            <Tab.Panel className="outline-none">
                                {reviews.length > 0 ? (
                                    <div className="space-y-4">
                                        {reviews.map((review) => (
                                            <div key={review.id} className="bg-surface border border-white/10 rounded-xl p-6 hover:border-accent/30 transition-colors">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-white text-lg">{review.api.name}</h3>
                                                        <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md">
                                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                                        <span className="font-bold text-white">{review.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 leading-relaxed">
                                                    {review.comment || <span className="italic text-gray-600">No comment provided</span>}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-surface rounded-2xl border border-white/5 border-dashed">
                                        <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No reviews yet</h3>
                                        <p className="text-gray-500">Share your experience with APIs you've used.</p>
                                    </div>
                                )}
                            </Tab.Panel>

                            {/* Claims Panel */}
                            <Tab.Panel className="outline-none">
                                {claims.length > 0 ? (
                                    <div className="space-y-4">
                                        {claims.map((claim) => (
                                            <div key={claim.id} className="bg-surface border border-white/10 rounded-xl p-6 flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-white text-lg">{claim.name}</h3>
                                                    <a href={claim.website} target="_blank" className="text-sm text-accent hover:underline">{claim.website}</a>
                                                </div>
                                                <div className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize
                                                    ${claim.claimStatus === 'APPROVED' ? 'bg-green-500/20 text-green-400' :
                                                        claim.claimStatus === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'}
                                                `}>
                                                    {claim.claimStatus.toLowerCase()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-20 bg-surface rounded-2xl border border-white/5 border-dashed">
                                        <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
                                        <h3 className="text-xl font-semibold text-gray-300 mb-2">No Claims Found</h3>
                                        <p className="text-gray-500 mb-6">Are you an API provider? Claim your page to manage it.</p>
                                        <a href="/admin/claims" className="btn btn-primary">Submit a Claim</a>
                                    </div>
                                )}
                            </Tab.Panel>

                            {/* Billing Panel */}
                            <Tab.Panel className="outline-none">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="bg-surface border border-white/10 rounded-2xl p-8">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                            <CreditCard size={20} className="text-accent" />
                                            Current Plan
                                        </h3>

                                        <div className="mb-8">
                                            {subscription ? (
                                                <div className="space-y-2">
                                                    <div className="text-3xl font-extrabold text-white capitalize">{subscription.plan.name}</div>
                                                    <div className="text-gray-400">
                                                        {subscription.status === 'active' ? 'Active' : 'Inactive'} • Renews {new Date(subscription.endsAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="text-3xl font-extrabold text-white">Free Plan</div>
                                                    <div className="text-gray-400">Basic features access</div>
                                                </div>
                                            )}
                                        </div>

                                        <a href="/pricing" className="btn btn-primary w-full justify-center">
                                            {subscription ? 'Manage Subscription' : 'Upgrade to Pro'}
                                        </a>
                                    </div>

                                    <div className="bg-surface border border-white/10 rounded-2xl p-8">
                                        <h3 className="text-lg font-bold text-white mb-6">Payment Method</h3>
                                        <p className="text-gray-500 mb-6">Securely managed by Lemon Squeezy / Stripe.</p>
                                        <div className="p-4 bg-white/5 rounded-lg border border-white/5 text-gray-400 text-sm text-center">
                                            No payment methods saved
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>

                            {/* Settings Panel */}
                            <Tab.Panel className="outline-none">
                                <div className="bg-surface border border-white/10 rounded-2xl p-8 max-w-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Bell size={20} className="text-accent" />
                                            Notification Preferences
                                        </h3>
                                        {savingSettings && (
                                            <span className="text-xs text-accent animate-pulse">Saving...</span>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-white">API Updates</h4>
                                                <p className="text-sm text-gray-400">Get notified when your favorite APIs change.</p>
                                            </div>
                                            <div
                                                className={`h-6 w-11 rounded-full relative cursor-pointer transition-colors ${notificationPrefs.apiUpdateEmails ? 'bg-accent' : 'bg-white/10'}`}
                                                onClick={() => handleSettingChange('apiUpdateEmails', !notificationPrefs.apiUpdateEmails)}
                                            >
                                                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${notificationPrefs.apiUpdateEmails ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-semibold text-white">Newsletter</h4>
                                                <p className="text-sm text-gray-400">Weekly digest of new and trending APIs.</p>
                                            </div>
                                            <div
                                                className={`h-6 w-11 rounded-full relative cursor-pointer transition-colors ${notificationPrefs.newsletterEmails ? 'bg-accent' : 'bg-white/10'}`}
                                                onClick={() => handleSettingChange('newsletterEmails', !notificationPrefs.newsletterEmails)}
                                            >
                                                <div className={`absolute top-1 h-4 w-4 bg-white rounded-full transition-all ${notificationPrefs.newsletterEmails ? 'right-1' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Tab.Panel>

                        </Tab.Panels>
                    </Tab.Group>

                </div>
            </main>
            <SiteFooter />
        </>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const session = await getSession(context);

    if (!session || !session.user?.email) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }

    const { email } = session.user;

    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            favorites: {
                include: {
                    api: {
                        include: {
                            provider: { select: { name: true, logoUrl: true } }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            reviews: {
                include: {
                    api: { select: { name: true, slug: true } }
                },
                orderBy: { createdAt: 'desc' }
            },
            notificationPrefs: true,
            subscriptions: {
                where: { status: 'active' },
                include: { plan: true },
                take: 1
            }
        }
    });

    if (!user) {
        return {
            redirect: {
                destination: '/auth/signin',
                permanent: false,
            },
        };
    }

    // Fetch Claims (where claimedByUserId matches)
    // Note: Provider model has 'claimedByUserId' field
    const claims = await prisma.provider.findMany({
        where: { claimedByUserId: user.id },
        select: {
            id: true,
            name: true,
            website: true,
            claimStatus: true,
            createdAt: true
        }
    });

    // Serialize dates for Next.js
    const serializedFavorites = user.favorites.map(f => ({
        ...f,
        createdAt: f.createdAt.toISOString(),
        api: {
            ...f.api,
            createdAt: f.api.createdAt.toISOString(),
            updatedAt: f.api.updatedAt.toISOString(),
            lastCheckedAt: f.api.lastCheckedAt.toISOString(),
        }
    }));

    const serializedReviews = user.reviews.map(r => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
    }));

    const serializedClaims = claims.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString()
    }));

    const activeSubscription = user.subscriptions[0] ? {
        ...user.subscriptions[0],
        startsAt: user.subscriptions[0].startsAt.toISOString(),
        endsAt: user.subscriptions[0].endsAt ? user.subscriptions[0].endsAt.toISOString() : null,
        createdAt: user.subscriptions[0].createdAt.toISOString(),
        updatedAt: user.subscriptions[0].updatedAt.toISOString(),
    } : null;

    const notificationPrefs = user.notificationPrefs ? {
        ...user.notificationPrefs,
        createdAt: user.notificationPrefs.createdAt.toISOString(),
        updatedAt: user.notificationPrefs.updatedAt.toISOString(),
    } : null;

    return {
        props: {
            user: {
                name: user.name,
                email: user.email,
                image: user.image || (session.user as any).image || null,
            },
            favorites: serializedFavorites,
            reviews: serializedReviews,
            claims: serializedClaims,
            subscription: activeSubscription,
            notificationPrefs: notificationPrefs
        },
    };
};

