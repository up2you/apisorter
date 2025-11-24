import type { NextApiResponse } from 'next';

export class ApiError extends Error {
    statusCode: number;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApiError';
    }
}

export function handleApiError(error: unknown, res: NextApiResponse) {
    console.error('API Error:', error);

    if (error instanceof ApiError) {
        return res.status(error.statusCode).json({ message: error.message });
    }

    // Handle Zod errors if they bubble up (though usually handled locally)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
        return res.status(400).json({ message: 'Validation Error', errors: (error as any).flatten() });
    }

    return res.status(500).json({ message: 'Internal Server Error' });
}
