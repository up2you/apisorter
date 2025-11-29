import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    baseUrl: string;
    searchParams?: Record<string, string | number | boolean | undefined>;
}

export default function Pagination({
    currentPage,
    totalPages,
    baseUrl,
    searchParams = {},
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                params.set(key, String(value));
            }
        });
        params.set('page', page.toString());
        return `${baseUrl}?${params.toString()}`;
    };

    // Generate page numbers to show
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            range.unshift(-1); // Ellipsis
        }
        if (currentPage + delta < totalPages - 1) {
            range.push(-1); // Ellipsis
        }

        range.unshift(1);
        if (totalPages > 1) {
            range.push(totalPages);
        }

        return range;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 py-8">
            {/* First Page */}
            <Link
                href={createPageUrl(1)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                aria-label="First page"
            >
                <ChevronsLeft className="h-5 w-5 text-gray-400" />
            </Link>

            {/* Previous Page */}
            <Link
                href={createPageUrl(Math.max(1, currentPage - 1))}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10 ${currentPage === 1 ? 'pointer-events-none opacity-50' : ''
                    }`}
                aria-label="Previous page"
            >
                <ChevronLeft className="h-5 w-5 text-gray-400" />
            </Link>

            {/* Page Numbers */}
            <div className="hidden items-center gap-2 sm:flex">
                {pages.map((page, index) => {
                    if (page === -1) {
                        return (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={page}
                            href={createPageUrl(page)}
                            className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${currentPage === page
                                    ? 'border-accent bg-accent/10 text-accent'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            {page}
                        </Link>
                    );
                })}
            </div>

            {/* Next Page */}
            <Link
                href={createPageUrl(Math.min(totalPages, currentPage + 1))}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                aria-label="Next page"
            >
                <ChevronRight className="h-5 w-5 text-gray-400" />
            </Link>

            {/* Last Page */}
            <Link
                href={createPageUrl(totalPages)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10 ${currentPage === totalPages ? 'pointer-events-none opacity-50' : ''
                    }`}
                aria-label="Last page"
            >
                <ChevronsRight className="h-5 w-5 text-gray-400" />
            </Link>
        </div>
    );
}
