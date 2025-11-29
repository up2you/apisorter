import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataGrid } from '@/components/admin/DataGrid';
import prisma from '@/lib/prisma';
import { Api, Provider } from '@prisma/client';
import { useRouter } from 'next/router';

interface ApiWithProvider extends Api {
    provider: Provider;
}

interface ApisPageProps {
    apis: ApiWithProvider[];
    categories: string[];
    sort: string;
    order: 'asc' | 'desc';
    filterCategory: string;
    filterStatus: string;
    pagination: {
        page: number;
        totalPages: number;
        totalCount: number;
    };
}

export default function AdminApis({ apis, categories, sort, order, filterCategory, filterStatus, pagination }: ApisPageProps) {
    const router = useRouter();

    const handleDelete = async (item: ApiWithProvider) => {
        if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;

        try {
            const res = await fetch(`/api/admin/apis/${item.id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                router.replace(router.asPath);
            } else {
                alert('Failed to delete');
            }
        } catch (error) {
            console.error(error);
            alert('Error deleting');
        }
    };

    const updateQueryParams = (newParams: Record<string, string | number>) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, ...newParams },
        });
    };

    const handleSortChange = (newSort: string) => {
        const newOrder = sort === newSort && order === 'asc' ? 'desc' : 'asc';
        updateQueryParams({ sort: newSort, order: newOrder, page: 1 });
    };

    const handleFilterChange = (category: string, status: string) => {
        const query: any = { ...router.query, page: 1 }; // Reset to page 1 on filter
        if (category) query.category = category;
        else delete query.category;

        if (status) query.status = status;
        else delete query.status;

        router.push({ pathname: router.pathname, query });
    };

    const handlePageChange = (newPage: number) => {
        updateQueryParams({ page: newPage });
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Sort by:</span>
                        <select
                            value={sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="bg-surface border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="createdAt">Created Date</option>
                            <option value="name">Name</option>
                            <option value="category">Category</option>
                        </select>
                        <button
                            onClick={() => handleSortChange(sort)}
                            className="px-3 py-1 text-sm bg-surface border border-gray-700 rounded hover:bg-surface-light"
                        >
                            {order === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Filter by Category:</span>
                        <select
                            value={filterCategory}
                            onChange={(e) => handleFilterChange(e.target.value, filterStatus)}
                            className="bg-surface border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-primary max-w-[200px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Filter by Status:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => handleFilterChange(filterCategory, e.target.value)}
                            className="bg-surface border border-gray-700 rounded px-3 py-1 text-sm focus:outline-none focus:border-primary"
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PENDING">Pending</option>
                            <option value="BROKEN">Broken</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} items)
                    </span>
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(1)}
                        className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        First
                    </button>
                    <button
                        disabled={pagination.page <= 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    <button
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Last
                    </button>
                </div>
            </div>

            <DataGrid
                title="APIs"
                data={apis}
                createUrl="/admin/apis/new"
                editUrl={(item) => `/admin/apis/${item.id}`}
                onDelete={handleDelete}
                columns={[
                    { header: 'Name', accessorKey: 'name' },
                    { header: 'Provider', cell: (item) => item.provider.name },
                    { header: 'Category', accessorKey: 'category' },
                    {
                        header: 'Status', cell: (item) => (
                            <span className={`px-2 py-1 rounded text-xs ${item.status === 'ACTIVE' ? 'bg-green-500/20 text-green-500' :
                                item.status === 'BROKEN' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500'
                                }`}>
                                {item.status}
                            </span>
                        )
                    },
                ]}
            />

            <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-400">
                    Page {pagination.page} of {pagination.totalPages} ({pagination.totalCount} items)
                </span>
                <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(1)}
                    className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    First
                </button>
                <button
                    disabled={pagination.page <= 1}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
                <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => handlePageChange(pagination.totalPages)}
                    className="px-3 py-1 bg-surface border border-gray-700 rounded hover:bg-surface-light disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Last
                </button>
            </div>
        </AdminLayout>
    );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
    const sort = (context.query.sort as string) || 'createdAt';
    const order = (context.query.order as 'asc' | 'desc') || 'desc';
    const filterCategory = (context.query.category as string) || '';
    const filterStatus = (context.query.status as string) || '';
    const page = parseInt(context.query.page as string) || 1;
    const pageSize = 50;

    const where: any = {};
    if (filterCategory) {
        where.category = filterCategory;
    }
    if (filterStatus) {
        where.status = filterStatus;
    }

    const orderBy = {
        [sort]: order,
    };

    const [apis, totalCount, categories] = await Promise.all([
        prisma.api.findMany({
            where,
            orderBy,
            take: pageSize,
            skip: (page - 1) * pageSize,
            include: { provider: true },
        }),
        prisma.api.count({ where }),
        prisma.api.findMany({
            select: { category: true },
            distinct: ['category'],
            orderBy: { category: 'asc' },
        }),
    ]);

    const serializedApis = JSON.parse(JSON.stringify(apis));
    const uniqueCategories = categories.map(c => c.category).filter(Boolean);

    return {
        props: {
            apis: serializedApis,
            categories: uniqueCategories,
            sort,
            order,
            filterCategory,
            filterStatus,
            pagination: {
                page,
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount,
            },
        },
    };
};
