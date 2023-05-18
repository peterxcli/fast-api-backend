import { useAppStore } from "@/store/store";

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
}

export async function fetchApi<T>(
    url: string,
    options?: RequestInit
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.message || response.statusText,
                code: response.status,
            };
        }

        const data = await response.json();
        return {
            success: true,
            data,
            code: response.status,
        };
    } catch (error) {
        return {
            success: false,
            error: (error instanceof Error ? error.message : "Something went wrong"),
        };
    }
}

export async function secureFetchApi<T>(
    url: string,
    options?: RequestInit,
    csrf_token?: string
): Promise<ApiResponse<T>> {
    options = {
        ...options,
        headers: {
            ...options?.headers,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            csrf_token: csrf_token || "",
        },
        credentials: "include",
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const data = await response.json();
            return {
                success: false,
                error: data.message || response.statusText,
                code: response.status,
            };
        }

        const data = await response.json();
        return {
            success: true,
            data,
            code: response.status,
        };
    } catch (error) {
        return {
            success: false,
            error: (error instanceof Error ? error.message : "Something went wrong"),
        };
    }
}