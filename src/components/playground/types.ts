export interface PlaygroundRequest {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    headers: { key: string; value: string; }[];
    body: string; // JSON string
}

export interface PlaygroundResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    duration: number;
    error?: string;
}
