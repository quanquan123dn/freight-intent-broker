const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
    private accessToken: string | null = null;

    setAccessToken(token: string | null) {
        this.accessToken = token;
    }

    private async request<T>(method: string, path: string, data?: any): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        const response = await fetch(`${API_BASE}${path}`, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
            credentials: 'include', // Include cookies for refresh token
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Unknown error' }));
            throw new Error(error.message || `Request failed: ${response.status}`);
        }

        return response.json();
    }

    get<T>(path: string) {
        return this.request<T>('GET', path);
    }

    post<T>(path: string, data?: any) {
        return this.request<T>('POST', path, data);
    }

    put<T>(path: string, data?: any) {
        return this.request<T>('PUT', path, data);
    }

    delete<T>(path: string) {
        return this.request<T>('DELETE', path);
    }
}

export const api = new ApiClient();
