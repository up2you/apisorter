import React from 'react';
import { PlaygroundResponse } from './types';

interface ResponsePanelProps {
    response: PlaygroundResponse | null;
}

export const ResponsePanel: React.FC<ResponsePanelProps> = ({ response }) => {
    if (!response) {
        return (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 h-full flex items-center justify-center p-8">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <p className="mb-2">🏁 Ready to run</p>
                    <p className="text-sm">Click "Run" to test the API endpoint.</p>
                </div>
            </div>
        );
    }

    const isError = response.status >= 400 || response.error;
    const statusColor = isError ? 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' : 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    📦 Response
                </h3>
                {response.status && (
                    <div className="flex gap-3 text-sm">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold ${statusColor}`}>
                            {response.status} {response.statusText}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-mono flex items-center">
                            ⏱️ {response.duration}ms
                        </span>
                    </div>
                )}
            </div>

            {response.error && (
                <div className="mb-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded border border-red-200 dark:border-red-800">
                    <strong>Error:</strong> {response.error}
                </div>
            )}

            <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700 p-2">
                <pre className="font-mono text-xs md:text-sm text-gray-800 dark:text-gray-300 whitespace-pre-wrap break-all">
                    {typeof response.data === 'object'
                        ? JSON.stringify(response.data, null, 2)
                        : response.data}
                </pre>
            </div>
        </div>
    );
};
