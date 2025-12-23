"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import SqlMessage from "./sql-message";
import TypingIndicator from "./type-indicator";
import QueryResults from "./query-results";
import { sendQuery, fetchMessages, createChat } from "@/lib/api";

export interface Message {
    role: "user" | "assistant";
    content: string;
    sql?: string;
    results?: {
        columns: string[];
        rows: (string | number | boolean | null)[][];
    };
}

export default function ChatMessages() {
    const activeChatRef = useRef<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    function mergeMessages(
        local: Message[],
        remote: Message[]
    ): Message[] {
        const seen = new Set(
            local.map(m => `${m.role}:${m.content}`)
        );

        return [
            ...local,
            ...remote.filter(
                m => !seen.has(`${m.role}:${m.content}`)
            ),
        ];
    }

    useEffect(() => {
        const init = async () => {
            try {
                // fetch chats list from backend
                const res = await fetch("http://127.0.0.1:8000/api/chats", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const chats = await res.json();

                if (chats.length > 0) {
                    const firstChatId = chats[0].id;
                    setActiveChatId(firstChatId);

                    const msgs = await fetchMessages(firstChatId);
                    setMessages(msgs);
                }
            } catch (err) {
                console.error("Failed to init chat", err);
            }
        };

        init();
    }, []);

    // 🔄 Load messages when chat changes
    useEffect(() => {
        const switchHandler = async (e: Event) => {
            const chatId = (e as CustomEvent<string | null>).detail;
            if (!chatId) {
                setActiveChatId(null);
                setMessages([]);
                return;
            }

            // 🔒 Prevent cross-chat bleed
            activeChatRef.current = chatId;
            setActiveChatId(chatId);
            setMessages([]);          // ✅ RESET messages
            setIsTyping(true);

            try {
                const remoteMessages = await fetchMessages(chatId);

                // ⚠️ Guard against race conditions
                if (activeChatRef.current !== chatId) return;

                setMessages(remoteMessages);
            } catch (err) {
                console.error(err);
            } finally {
                setIsTyping(false);
            }
        };

        window.addEventListener("switch-chat", switchHandler);
        return () => window.removeEventListener("switch-chat", switchHandler);
    }, []);

    useEffect(() => {
        const newChatHandler = async (e: Event) => {
            const chatId = (e as CustomEvent<string>).detail;

            setActiveChatId(chatId);
            setMessages([]);
        };

        window.addEventListener("new-chat", newChatHandler);
        return () => window.removeEventListener("new-chat", newChatHandler);
    }, []);

    // 📤 Handle user message
    useEffect(() => {
        const sendHandler = async (e: Event) => {
            const content = (e as CustomEvent<string>).detail;

            // 🚫 If no chat yet, create one first
            let chatId = activeChatId;

            if (!chatId) {
                const res = await createChat();
                chatId = res.id;
                setActiveChatId(chatId);

                // Notify sidebar
                window.dispatchEvent(new Event("chats-updated"));

                // Switch to new chat
                window.dispatchEvent(
                    new CustomEvent("switch-chat", { detail: chatId })
                );
            }

            if (!chatId) return;

            // ✅ 1️⃣ Optimistically add USER message
            setMessages((prev) => [
                ...prev,
                { role: "user", content }
            ]);

            setIsTyping(true);

            try {
                const data = await sendQuery(content, chatId);

                // ✅ 2️⃣ Append ASSISTANT response
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
                } else {
                    setMessages((prev) => [
                        ...prev,
                        {
                            role: "assistant",
                            content: "I couldn’t generate SQL for that query.",
                        },
                    ]);
                }
            } catch (err) {
                console.error(err);
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        content: "Error connecting to backend.",
                    },
                ]);
            } finally {
                setIsTyping(false);
            }
        };

        window.addEventListener("send-message", sendHandler);
        return () => window.removeEventListener("send-message", sendHandler);
    }, [activeChatId]);

    if (!activeChatId) {
        return (
            <div className="mx-auto max-w-3xl text-center text-muted-foreground">
                Select or create a chat to begin.
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
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                    <div
                        className={`max-w-[80%] rounded-lg px-4 py-3 text-sm whitespace-pre-wrap ${msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                            }`}
                    >
                        {msg.content}

                        {msg.sql && <SqlMessage sql={msg.sql} />}
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
                    <div className="rounded-lg bg-muted px-4 py-3">
                        <TypingIndicator />
                    </div>
                </div>
            )}
        </div>
    );
}
