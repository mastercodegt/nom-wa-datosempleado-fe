const defaultApiUrl = "https://192.168.64.3:7080/api";

export const API_BASE_URL = (
    import.meta.env.DEV
        ? "/api"
        : import.meta.env.VITE_API_URL?.trim() || defaultApiUrl
).replace(/\/+$/, "");

export class ApiError extends Error {
    readonly status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
        this.name = "ApiError";
    }
}

export async function apiRequest<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);

    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    const response = await fetch(`${API_BASE_URL}/${path.replace(/^\/+/, "")}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const responseMessage = await response.text();
        throw new ApiError(
            responseMessage || `Error HTTP ${response.status}`,
            response.status,
        );
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}
