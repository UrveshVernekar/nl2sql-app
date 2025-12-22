import { Message } from "@/components/chat-messages";

export interface StoredChat {
    id: string;
    createdAt: number;
    title?: string;
    messages: Message[];
}

const CHATS_KEY = "nl2sql_chats";
const ACTIVE_CHAT_KEY = "nl2sql_active_chat_id";

export function loadChats() {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem(CHATS_KEY) || "[]");
}

export function saveChats(chats: StoredChat[]) {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

export function getActiveChatId() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACTIVE_CHAT_KEY);
}

export function setActiveChatId(id: string) {
    localStorage.setItem(ACTIVE_CHAT_KEY, id);
}

export function deleteChat(chatId: string) {
    const chats = loadChats().filter((c: StoredChat) => c.id !== chatId);
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));

    const activeId = getActiveChatId();
    if (activeId === chatId) {
        const nextChat = chats[0]?.id ?? null;
        if (nextChat) {
            setActiveChatId(nextChat);
        } else {
            localStorage.removeItem(ACTIVE_CHAT_KEY);
        }
    }
}

export function renameChat(chatId: string, title: string) {
  const chats = loadChats().map((c: StoredChat) =>
    c.id === chatId ? { ...c, title } : c
  );
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}