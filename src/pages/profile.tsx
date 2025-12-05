import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { Star, MessageSquare, User as UserIcon, LogOut, Edit2, X, Check } from 'lucide-react';
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
}

export default function Profile({ user: initialUser, favorites, reviews }: ProfileProps) {
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
                                <div className="flex items-center gap-1.5">
                                    <Star size={16} className="text-yellow-500" />
                                    <span>{favorites.length} Favorites</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <MessageSquare size={16} className="text-blue-500" />
                                    <span>{reviews.length} Reviews</span>
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
                        <Tab.List className="flex space-x-1 rounded-xl bg-surface border border-white/10 p-1 mb-8 max-w-md">
                            <Tab
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                                        selected
                                            ? 'bg-accent text-white shadow'
                                            : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                                    )
                                }
                            >
                                Favorites
                            </Tab>
                            <Tab
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-all',
                                        selected
                                            ? 'bg-accent text-white shadow'
                                            : 'text-gray-400 hover:bg-white/[0.12] hover:text-white'
                                    )
                                }
                            >
                                My Reviews
                            </Tab>
                        </Tab.List>

                        <Tab.Panels>
                            {/* Favorites Panel */}
                            <Tab.Panel>
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
                                                // We don't have rating in this query yet, can be added if needed
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
                            <Tab.Panel>
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

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
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

    return {
        props: {
            user: {
                name: user.name,
                email: user.email,
                image: user.image || session.user.image || null,
            },
            favorites: serializedFavorites,
            reviews: serializedReviews,
        },
    };
};
