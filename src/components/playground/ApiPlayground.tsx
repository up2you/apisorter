import React, { useState } from 'react';
import { RequestPanel } from './RequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { PlaygroundRequest, PlaygroundResponse } from './types';

interface ApiPlaygroundProps {
    initialUrl?: string; // Optional: Pre-fill URL from API details
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({ initialUrl }) => {
    const [request, setRequest] = useState<PlaygroundRequest>({
        method: 'GET',
        url: initialUrl || '',
        headers: [{ key: 'Accept', value: 'application/json' }],
        body: '{}'
    });
    const [response, setResponse] = useState<PlaygroundResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const runRequest = async () => {
        setIsLoading(true);
        setResponse(null);
        try {
            // Prepare payload
            const headersObj = request.headers.reduce((acc, curr) => {
                if (curr.key) acc[curr.key] = curr.value;
                return acc;
            }, {} as Record<string, string>);

            let parsedBody = undefined;
            if (request.method !== 'GET' && request.body.trim()) {
                try {
                    parsedBody = JSON.parse(request.body);
                } catch (e) {
                    // If simple string, pass as is? Usually APIs expect JSON. 
                    // Let's assume JSON for now or pass as string if failed parse but Content-Type is text?
                    // Safe default: try JSON, fallback to null/error if malformed JSON and header says JSON
                    console.warn("Invalid JSON body");
                }
            }

            const res = await fetch('/api/playground/proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    method: request.method,
                    url: request.url,
                    headers: headersObj,
                    body: parsedBody
                }),
            });

            const data = await res.json();
            setResponse(data);
        } catch (error: any) {
            setResponse({
                status: 0,
                statusText: 'Client Error',
                headers: {},
                data: null,
                duration: 0,
                error: error.message || 'Failed to connect to proxy'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full my-8">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                ⚡ Interactive Playground
                <span className="text-xs font-normal px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900 dark:text-blue-300">Beta</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
                <RequestPanel
                    request={request}
                    onChange={setRequest}
                    onRun={runRequest}
                    isLoading={isLoading}
                />
                <ResponsePanel response={response} />
            </div>
        </div>
    );
};
