import React from 'react';
import { PlaygroundRequest } from './types';

interface RequestPanelProps {
    request: PlaygroundRequest;
    onChange: (req: PlaygroundRequest) => void;
    onRun: () => void;
    isLoading: boolean;
}

export const RequestPanel: React.FC<RequestPanelProps> = ({ request, onChange, onRun, isLoading }) => {

    const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
        const newHeaders = [...request.headers];
        newHeaders[index][field] = value;
        onChange({ ...request, headers: newHeaders });
    };

    const addHeader = () => {
        onChange({ ...request, headers: [...request.headers, { key: '', value: '' }] });
    };

    const removeHeader = (index: number) => {
        const newHeaders = request.headers.filter((_, i) => i !== index);
        onChange({ ...request, headers: newHeaders });
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex flex-col h-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                🎮 Request
            </h3>

            {/* URL Bar */}
            <div className="flex gap-2 mb-4">
                <select
                    value={request.method}
                    onChange={(e) => onChange({ ...request, method: e.target.value as any })}
                    className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm"
                >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
                <input
                    type="text"
                    value={request.url}
                    onChange={(e) => onChange({ ...request, url: e.target.value })}
                    placeholder="https://api.example.com/v1/endpoint"
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md font-mono text-sm text-gray-900 dark:text-gray-100"
                />
                <button
                    onClick={onRun}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-md font-medium text-white transition-colors flex items-center gap-2
                        ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                    `}
                >
                    {isLoading ? 'Running...' : 'Run ▶'}
                </button>
            </div>

            {/* Tabs (Simple implementation) */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="mb-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-500 pb-2 inline-block mr-4">Headers</span>
                    {request.method !== 'GET' && <span className="text-sm font-medium text-gray-500 pb-2 inline-block">Body</span>}
                </div>

                {/* Headers Section */}
                <div className="space-y-2 mb-4 overflow-y-auto max-h-40">
                    {request.headers.map((header, idx) => (
                        <div key={idx} className="flex gap-2">
                            <input
                                placeholder="Key (e.g. Authorization)"
                                value={header.key}
                                onChange={(e) => handleHeaderChange(idx, 'key', e.target.value)}
                                className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono"
                            />
                            <input
                                placeholder="Value"
                                value={header.value}
                                onChange={(e) => handleHeaderChange(idx, 'value', e.target.value)}
                                className="flex-1 px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded text-sm font-mono"
                            />
                            <button onClick={() => removeHeader(idx)} className="text-red-500 hover:bg-red-50 rounded px-2">×</button>
                        </div>
                    ))}
                    <button onClick={addHeader} className="text-xs text-blue-500 hover:underline">+ Add Header</button>
                </div>

                {/* Body Section */}
                {request.method !== 'GET' && (
                    <div className="flex-1 flex flex-col">
                        <label className="text-xs text-gray-500 mb-1">JSON Body</label>
                        <textarea
                            value={request.body}
                            onChange={(e) => onChange({ ...request, body: e.target.value })}
                            className="flex-1 w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 font-mono text-sm resize-none"
                            placeholder='{"key": "value"}'
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
