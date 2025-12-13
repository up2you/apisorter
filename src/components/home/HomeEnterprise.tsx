import { useState } from 'react';
import Link from 'next/link';
import { CatalogApi } from '@/types/catalog';
import { Search, Filter, ArrowUpRight, Star, Clock, Activity, LayoutGrid, List as ListIcon } from 'lucide-react';
import { getCategoryIcon } from '@/lib/categoryIcons';

interface HomeEnterpriseProps {
    catalog: CatalogApi[];
    categories: { category: string; count: number }[];
}

export default function HomeEnterprise({ catalog, categories }: HomeEnterpriseProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredCatalog = catalog.filter(api => {
        const matchesSearch = api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            api.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? api.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex text-sm">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 fixed h-full overflow-y-auto">
                <div className="p-4 border-b border-gray-100 mb-2">
                    <div className="flex items-center gap-2 font-bold text-lg text-blue-600">
                        <LayoutGrid size={20} />
                        <span>API Sorter</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">Enterprise View</div>
                </div>

                <div className="px-3 py-2">
                    <div className="text-xs font-semibold text-gray-400 mb-2 px-3 uppercase">Master Data</div>
                    <nav className="space-y-0.5">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-colors ${!selectedCategory ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <ListIcon size={16} />
                            All APIs
                        </button>
                        {categories.slice(0, 5).map(cat => (
                            <button
                                key={cat.category}
                                onClick={() => setSelectedCategory(cat.category)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${selectedCategory === cat.category ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <img src={getCategoryIcon(cat.category)} className="w-4 h-4 opacity-70" alt="" />
                                    {cat.category}
                                </span>
                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">{cat.count}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 ml-64 p-8">
                {/* Header Toolbar */}
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">API Catalog</h1>
                        <p className="text-gray-500 mt-1">Manage and monitor your external integrations.</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-64 text-sm bg-white shadow-sm"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 shadow-sm text-gray-700 font-medium transition-colors">
                            <Filter size={16} />
                            Filter
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm font-medium transition-colors">
                            <ArrowUpRight size={16} />
                            Export CSV
                        </button>
                    </div>
                </header>

                {/* Data Grid */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                                <th className="p-4 font-semibold w-[30%]">Name & Provider</th>
                                <th className="p-4 font-semibold w-[15%]">Category</th>
                                <th className="p-4 font-semibold w-[15%]">Status</th>
                                <th className="p-4 font-semibold w-[15%]">Rating</th>
                                <th className="p-4 font-semibold w-[15%]">Latency (Avg)</th>
                                <th className="p-4 font-semibold w-[10%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCatalog.length > 0 ? (
                                filteredCatalog.map((api) => (
                                    <tr key={api.slug} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center p-1.5 overflow-hidden">
                                                    {api.logoUrl ? (
                                                        <img src={api.logoUrl} alt="" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="text-xs font-bold text-gray-400">{api.name.substring(0, 2)}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <Link href={`/api/${api.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                        {api.name}
                                                    </Link>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        {api.provider?.name || 'Unknown Provider'}
                                                        <span className="text-gray-300">•</span>
                                                        <span className="font-mono text-[10px] bg-gray-100 px-1 rounded text-gray-500">v1.2</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                <img src={getCategoryIcon(api.category)} className="w-3 h-3 grayscale opacity-60" alt="" />
                                                {api.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <span className="text-emerald-700 font-medium text-xs">Operational</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-gray-700">
                                                <Star size={14} className="fill-current text-amber-400" />
                                                <span className="font-medium">{api.metrics.averageRating}</span>
                                                <span className="text-gray-400 text-xs">({api.metrics.reviewCount})</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-gray-500 font-mono text-xs">
                                                <Activity size={14} className="text-gray-400" />
                                                {Math.floor(Math.random() * 200 + 50)}ms
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link
                                                href={`/api/${api.slug}`}
                                                className="text-gray-400 hover:text-blue-600 font-medium text-xs inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Details
                                                <ArrowUpRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        No APIs found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
