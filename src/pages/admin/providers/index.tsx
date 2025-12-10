import { GetServerSideProps } from 'next';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DataGrid } from '@/components/admin/DataGrid';
import prisma from '@/lib/prisma';
import { Provider } from '@prisma/client';
import { useRouter } from 'next/router';

interface ProvidersPageProps {
    providers: Provider[];
    sort: string;
    order: 'asc' | 'desc';
    pagination: {
        page: number;
        totalPages: number;
        totalCount: number;
    };
}

export default function AdminProviders({ providers, sort, order, pagination }: ProvidersPageProps) {
    const router = useRouter();

    const handleDelete = async (item: Provider) => {
        if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;

        try {
            const res = await fetch(`/api/admin/providers/${item.id}`, {
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

    const handleSortChange = (newSort: string) => {
        const newOrder = sort === newSort && order === 'asc' ? 'desc' : 'asc';
        router.push({
            pathname: router.pathname,
            query: { ...router.query, sort: newSort, order: newOrder, page: 1 }, // Reset to page 1 on sort
        });
    };

    const handlePageChange = (newPage: number) => {
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
        });
    };

    return (
        <AdminLayout>
            <div className="mb-6 flex items-center justify-between">
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
                        </select>
                        <button
                            onClick={() => handleSortChange(sort)}
                            className="px-3 py-1 text-sm bg-surface border border-gray-700 rounded hover:bg-surface-light"
                        >
                            {order === 'asc' ? '↑ Asc' : '↓ Desc'}
                        </button>
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
                title="Providers"
                data={providers}
                createUrl="/admin/providers/new"
                editUrl={(item) => `/admin/providers/${item.id}`}
                onDelete={handleDelete}
                columns={[
                    { header: 'Name', accessorKey: 'name' },
                    {
                        header: 'Website', accessorKey: 'website', cell: (item) => (
                            item.website ? <a href={item.website} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline truncate max-w-xs block">{item.website}</a> : '-'
                        )
                    },
                    {
                        header: 'Contact',
                        accessorKey: 'contact',
                        cell: (item) => item.contact || <span className="text-gray-600">-</span>
                    },
                    { header: 'Created At', cell: (item) => new Date(item.createdAt).toLocaleDateString() },
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
    const page = parseInt(context.query.page as string) || 1;
    const pageSize = 50;

    const orderBy = {
        [sort]: order,
    };

    const [providers, totalCount] = await Promise.all([
        prisma.provider.findMany({
            orderBy,
            take: pageSize,
            skip: (page - 1) * pageSize,
        }),
        prisma.provider.count(),
    ]);

    // Serialize dates
    const serialized = JSON.parse(JSON.stringify(providers));

    return {
        props: {
            providers: serialized,
            sort,
            order,
            pagination: {
                page,
                totalPages: Math.ceil(totalCount / pageSize),
                totalCount,
            },
        },
    };
};
