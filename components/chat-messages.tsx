"use client";

import { useEffect, useState } from "react";
import SqlMessage from "./sql-message";
import TypingIndicator from "./type-indicator";

interface Message {
    role: "user" | "assistant";
    content: string;
    sql?: string;
}

export default function ChatMessages() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        const handler = (e: CustomEvent<string>) => {
            const userMessage: Message = {
                role: "user",
                content: e.detail,
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsTyping(true);

            // 🔹 Mock assistant response
            setTimeout(() => {
                const botMessage: Message = {
                    role: "assistant",
                    content: "Here is the SQL generated for your query:",
                    sql: `
                            SELECT *
                            FROM users
                            WHERE created_at >= '2024-01-01';
                        `,
                };

                setMessages((prev) => [...prev, botMessage]);
                setIsTyping(false);
            }, 1200);
        };

        window.addEventListener("send-message", handler as EventListener);
        return () =>
            window.removeEventListener("send-message", handler as EventListener);
    }, []);

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
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
                    </div>
                </div>
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
