import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { method, url, headers, body } = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL is required' });
    }

    // SSRF Check (Basic)
    try {
        const parsedUrl = new URL(url);
        const forbiddenHosts = ['localhost', '127.0.0.1', '::1', '0.0.0.0'];
        if (forbiddenHosts.includes(parsedUrl.hostname) || parsedUrl.hostname.startsWith('192.168.')) {
            return res.status(403).json({ error: 'Local network access forbidden' });
        }
    } catch (e) {
        return res.status(400).json({ error: 'Invalid URL' });
    }

    try {
        const fetchOptions: RequestInit = {
            method: method || 'GET',
            headers: headers || {},
        };

        if (body && ['POST', 'PUT', 'PATCH'].includes(fetchOptions.method || '')) {
            // Forward body if valid JSON or string
            fetchOptions.body = typeof body === 'object' ? JSON.stringify(body) : body;
        }

        const start = Date.now();
        const response = await fetch(url, fetchOptions);
        const duration = Date.now() - start;

        let responseBody: any;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            try {
                responseBody = await response.json();
            } catch {
                responseBody = await response.text();
            }
        } else {
            responseBody = await response.text();
        }

        // Return standardized response object
        res.status(200).json({
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            data: responseBody,
            duration,
        });

    } catch (error: any) {
        console.error('Proxy Error:', error);
        res.status(500).json({
            error: 'Request Failed',
            details: error.message,
            status: 500
        });
    }
}
