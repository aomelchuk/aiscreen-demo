// src/utils/api.ts
export interface ApiOptions extends RequestInit {
}

export async function apiFetch(
    input: string,
    options: ApiOptions = {}
): Promise<Response> {
    const token = localStorage.getItem('auth_token')
    const defaultHeaders: Record<string,string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    const res = await fetch(input, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...(options.headers as Record<string,string>),
        },
    })

    return res
}
