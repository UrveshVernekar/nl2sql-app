import { getToken } from "./auth";

const API_BASE = "http://127.0.0.1:8000";

// export async function sendQuery(query: string, chatId: string) {
//     const res = await fetch(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/query`,
//         {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ query, chat_id: chatId, }),
//         }
//     );

//     if (!res.ok) {
//         throw new Error("Backend error");
//     }

//     return res.json();
// }

export async function apiFetch(
    path: string,
    options: RequestInit = {}
) {
    const token = getToken();

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "API error");
    }

    return res.json();
}

export function fetchChats() {
    return apiFetch("/api/chats");
}

export function createChat() {
    return apiFetch("/api/chats", {
        method: "POST",
    });
}

export function renameChat(chatId: string, title: string) {
    return apiFetch(`/api/chats/${chatId}`, {
        method: "PATCH",
        body: JSON.stringify({ title }),
    });
}

export function deleteChat(chatId: string) {
    return apiFetch(`/api/chats/${chatId}`, {
        method: "DELETE",
    });
}

export function fetchMessages(chatId: string) {
    return apiFetch(`/api/chats/${chatId}/messages`);
}

export function sendQuery(query: string, chatId: string | null) {
    return apiFetch("/api/query", {
        method: "POST",
        body: JSON.stringify({ query, chat_id: chatId }),
    });
}