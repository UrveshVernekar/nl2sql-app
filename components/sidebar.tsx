"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Pencil } from "lucide-react";
import { loadChats, setActiveChatId, getActiveChatId, deleteChat, renameChat } from "@/lib/chat-storage";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* eslint-disable react-hooks/set-state-in-effect */

interface SidebarChat {
    id: string;
    title: string;
    createdAt: number;
}

export default function Sidebar() {
    const [chats, setChats] = useState<SidebarChat[]>([]);
    const [activeChatId, setActiveChatIdState] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<SidebarChat | null>(null);

    useEffect(() => {
        setChats(loadChats());
        setActiveChatIdState(getActiveChatId());
    }, []);

    const handleNewChat = () => {
        window.dispatchEvent(new CustomEvent("new-chat"));

        setTimeout(() => {
            setChats(loadChats());
            setActiveChatIdState(getActiveChatId());
        }, 0);
    };

    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);
        setActiveChatIdState(chatId);
        window.dispatchEvent(
            new CustomEvent("switch-chat", { detail: chatId })
        );
    };

    return (
        <aside className="w-64 flex-col border-r bg-muted/40 flex">
            <div className="flex items-center justify-between p-4 font-semibold">
                <span>NL2SQL</span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNewChat}
                    aria-label="New chat"
                >
                    <Plus size={16} />
                </Button>
            </div>
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`group flex items-center rounded-md px-1 ${chat.id === activeChatId ? "bg-muted" : ""
                                }`}
                        >
                            {/* TITLE / EDIT INPUT */}
                            {editingId === chat.id ? (
                                <input
                                    autoFocus
                                    value={draftTitle}
                                    onChange={(e) => setDraftTitle(e.target.value)}
                                    onBlur={() => {
                                        renameChat(chat.id, draftTitle || "New chat");
                                        setChats(loadChats());
                                        setEditingId(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            renameChat(chat.id, draftTitle || "New chat");
                                            setChats(loadChats());
                                            setEditingId(null);
                                        }
                                        if (e.key === "Escape") {
                                            setEditingId(null);
                                        }
                                    }}
                                    className="flex-1 rounded bg-background px-2 py-1 text-sm outline-none"
                                />
                            ) : (
                                <Button
                                    variant="ghost"
                                    className={`flex-1 justify-start text-sm ${chat.id === activeChatId ? "font-semibold" : ""
                                        }`}
                                    onClick={() => handleSelectChat(chat.id)}
                                >
                                    {chat.title ?? "New chat"}
                                </Button>
                            )}

                            {/* EDIT BUTTON */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-blue-600 dark:text-blue-400"
                                onClick={() => {
                                    setEditingId(chat.id);
                                    setDraftTitle(chat.title ?? "");
                                }}
                            >
                                <Pencil size={14} />
                            </Button>

                            {/* DELETE BUTTON */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-destructive"
                                onClick={() => setDeleteTarget(chat)}
                            >
                                <Trash2 size={14} />
                            </Button>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => {
                    if (!open) setDeleteTarget(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold">
                                {deleteTarget?.title || "this chat"}
                            </span>
                            . This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>

                        <AlertDialogAction
                            className="bg-red-500 text-white hover:bg-red-600 dark:text-destructive-foreground"
                            onClick={() => {
                                if (!deleteTarget) return;

                                deleteChat(deleteTarget.id);
                                setChats(loadChats());
                                setActiveChatIdState(getActiveChatId());
                                window.dispatchEvent(new CustomEvent("switch-chat"));
                                setDeleteTarget(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    );
}