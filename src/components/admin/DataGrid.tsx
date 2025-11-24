import Link from 'next/link';
import { Edit, Trash2, Plus } from 'lucide-react';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
}

interface DataGridProps<T> {
    data: T[];
    columns: Column<T>[];
    onDelete?: (item: T) => void;
    editUrl?: (item: T) => string;
    createUrl?: string;
    title: string;
}

export function DataGrid<T extends { id: string }>({
    data,
    columns,
    onDelete,
    editUrl,
    createUrl,
    title
}: DataGridProps<T>) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{title}</h2>
                {createUrl && (
                    <Link
                        href={createUrl}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        <Plus size={18} />
                        <span>Create New</span>
                    </Link>
                )}
            </div>

            <div className="bg-surface border border-gray-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-light border-b border-gray-800">
                            {columns.map((col, i) => (
                                <th key={i} className="p-4 font-medium text-gray-400">
                                    {col.header}
                                </th>
                            ))}
                            {(editUrl || onDelete) && <th className="p-4 text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="p-8 text-center text-gray-500">
                                    No data found.
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="border-b border-gray-800 hover:bg-surface-light/50">
                                    {columns.map((col, i) => (
                                        <td key={i} className="p-4">
                                            {col.cell
                                                ? col.cell(item)
                                                : col.accessorKey
                                                    ? String(item[col.accessorKey])
                                                    : null}
                                        </td>
                                    ))}
                                    {(editUrl || onDelete) && (
                                        <td className="p-4 text-right space-x-2">
                                            {editUrl && (
                                                <Link
                                                    href={editUrl(item)}
                                                    className="inline-block p-2 text-blue-400 hover:bg-blue-400/10 rounded"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="inline-block p-2 text-red-400 hover:bg-red-400/10 rounded"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
