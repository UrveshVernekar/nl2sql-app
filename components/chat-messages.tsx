"use client";

import { useEffect, useState } from "react";
import SqlMessage from "./sql-message";
import TypingIndicator from "./type-indicator";
// import ChatSkeleton from "./chat-skeleton";
import { motion } from "framer-motion";
import { sendQuery } from "@/lib/api";
import QueryResults from "./query-results";
import { v4 as uuidv4 } from "uuid";
import {
    loadChats,
    saveChats,
    getActiveChatId,
    setActiveChatId,
    StoredChat,
} from "@/lib/chat-storage";

export interface Message {
    role: "user" | "assistant";
    content: string;
    sql?: string;
    results?: {
        columns: string[];
        rows: (string | number | boolean | null)[][];
    };
}

function generateTitleFromMessage(text: string) {
    return text.length > 40 ? text.slice(0, 40) + "…" : text;
}

export default function ChatMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const chats = loadChats();
        const activeId = getActiveChatId();

        if (chats.length > 0 && activeId) {
            const activeChat = chats.find((c: StoredChat) => c.id === activeId);
            if (activeChat) {
                setMessages(activeChat.messages);
                return;
            }
        }

        // No chat exists → create first chat
        const newChatId = uuidv4();
        const newChat: StoredChat = {
            id: newChatId,
            createdAt: Date.now(),
            messages: [],
        };

        saveChats([newChat]);
        setActiveChatId(newChatId);
    }, []);

    useEffect(() => {
        const chats = loadChats();
        const activeId = getActiveChatId();
        if (!activeId) return;

        const updatedChats = chats.map((chat: StoredChat) =>
            chat.id === activeId ? { ...chat, messages } : chat
        );

        saveChats(updatedChats);
    }, [messages]);

    useEffect(() => {
        const sendHandler = async (e: Event) => {
            const detail = (e as CustomEvent<string>).detail;

            const userMessage: Message = {
                role: "user",
                content: detail,
            };

            const chats = loadChats();
            const activeId = getActiveChatId();

            if (activeId) {
                const chat = chats.find((c: StoredChat) => c.id === activeId);

                // Auto-title only if not already titled
                if (chat && !chat.title) {
                    chat.title = generateTitleFromMessage(detail);
                    saveChats([...chats]);
                }
            }

            // 1️⃣ Show user message immediately
            setMessages((prev) => [...prev, userMessage]);
            setIsTyping(true);

            try {
                // 2️⃣ Call backend
                const data = await sendQuery(detail);

                // 3️⃣ Handle backend response
                if (data.sql) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "Here is the SQL generated for your query:",
                            sql: data.sql,
                            results: data.results,
                        },
                    ]);
                } else if (data.clarification_required) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: data.questions.join(" "),
                        },
                    ]);
                } else if (data.error) {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "I couldn’t generate SQL for that query.",
                        },
                    ]);
                } else {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "Unexpected response from backend.",
                        },
                    ]);
                }
            } catch (err) {
                console.error(err);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Error connecting to the backend.",
                    },
                ]);
            } finally {
                setIsTyping(false);
            }
        };

        const newChatHandler = () => {
            const chats = loadChats();

            const newChatId = uuidv4();
            const newChat: StoredChat = {
                id: newChatId,
                createdAt: Date.now(),
                messages: [],
            };

            saveChats([...chats, newChat]);
            setActiveChatId(newChatId);

            setMessages([]);
            setIsTyping(false);
        };

        const switchChatHandler = (e: Event) => {
            const chatId = (e as CustomEvent<string>).detail;
            const chats = loadChats();

            const chat = chats.find((c: StoredChat) => c.id === chatId);
            if (!chat) return;

            setMessages(chat.messages);
            setIsTyping(false);
        };

        window.addEventListener("send-message", sendHandler);
        window.addEventListener("new-chat", newChatHandler);
        window.addEventListener("switch-chat", switchChatHandler);

        return () => {
            window.removeEventListener("send-message", sendHandler);
            window.removeEventListener("new-chat", newChatHandler);
            window.removeEventListener("switch-chat", switchChatHandler);
        };
    }, []);

    if (messages.length === 0) {
        return (
            <div className="mx-auto max-w-3xl text-center text-muted-foreground">
                Start a new chat by asking a question about your data.
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((msg, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                    <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                            }`}
                    >
                        {msg.content}

                        {msg.sql && (
                            <div className="mt-3">
                                <SqlMessage sql={msg.sql} />
                            </div>
                        )}

                        {msg.results && (
                            <QueryResults
                                columns={msg.results.columns}
                                rows={msg.results.rows}
                            />
                        )}
                    </div>
                </motion.div>
            ))}

            {isTyping && (
                <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-lg bg-muted px-4 py-3">
                        <TypingIndicator />
                        {/* <ChatSkeleton /> */}
                    </div>
                </div>
            )}
        </div>
    );
}