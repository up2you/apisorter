import Head from 'next/head';
import Link from 'next/link';
import SiteFooter from '@/components/layout/SiteFooter';
import SiteHeader from '@/components/layout/SiteHeader';
import { Calendar, User } from 'lucide-react';

const POSTS = [
    {
        slug: 'future-of-api-economy',
        title: 'The Future of the API Economy in 2025',
        excerpt: 'How AI agents and autonomous systems are reshaping the way we consume and build APIs.',
        date: 'Nov 24, 2025',
        author: 'Alex Chen',
        category: 'Industry Trends'
    },
    {
        slug: 'rest-vs-graphql-vs-trpc',
        title: 'REST vs GraphQL vs tRPC: Choosing the Right Tool',
        excerpt: 'A comprehensive guide to selecting the best API architecture for your next project.',
        date: 'Nov 18, 2025',
        author: 'Sarah Miller',
        category: 'Engineering'
    },
    {
        slug: 'monetizing-your-api',
        title: 'Strategies for Monetizing Your Public API',
        excerpt: 'From freemium models to usage-based billing, learn how to turn your API into a revenue stream.',
        date: 'Nov 10, 2025',
        author: 'David Kim',
        category: 'Business'
    }
];

export default function BlogIndexPage() {
    return (
        <>
            <Head>
                <title>Blog — API Sorter</title>
            </Head>
            <SiteHeader />
            <main className="mx-auto max-w-5xl px-6 py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-white mb-4">Engineering Blog</h1>
                    <p className="text-gray-400">Insights, tutorials, and updates from the API Sorter team.</p>
                </div>

                <div className="grid gap-10">
                    {POSTS.map((post) => (
                        <article key={post.slug} className="group relative flex flex-col md:flex-row gap-8 items-start p-6 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                            <div className="flex-1">
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                    <span className="text-accent font-medium">{post.category}</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-accent transition-colors">
                                    <Link href={`/blog/${post.slug}`} className="before:absolute before:inset-0">
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-gray-400 leading-relaxed">
                                    {post.excerpt}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
