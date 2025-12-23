"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Pencil } from "lucide-react";
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

import {
    fetchChats,
    createChat,
    deleteChat,
    renameChat,
} from "@/lib/api";

interface SidebarChat {
    id: string;
    title: string;
    createdAt: number;
}

export default function Sidebar() {
    const [chats, setChats] = useState<SidebarChat[]>([]);
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftTitle, setDraftTitle] = useState("");

    const [deleteTarget, setDeleteTarget] = useState<SidebarChat | null>(null);

    /* ---------------------------
       Load chats on mount
    ---------------------------- */
    useEffect(() => {
        fetchChats()
            .then((data) => {
                setChats(data);

                if (data.length > 0) {
                    setActiveChatId(data[0].id);
                    window.dispatchEvent(
                        new CustomEvent("switch-chat", { detail: data[0].id })
                    );
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        const refreshChats = async () => {
            const data = await fetchChats();
            setChats(data);
        };

        window.addEventListener("chats-updated", refreshChats);

        return () => {
            window.removeEventListener("chats-updated", refreshChats);
        };
    }, []);

    /* ---------------------------
       Create new chat
    ---------------------------- */
    const handleNewChat = async () => {
        const res = await createChat();

        const updated = await fetchChats();
        setChats(updated);
        setActiveChatId(res.id);

        window.dispatchEvent(new Event("chats-updated"));

        window.dispatchEvent(
            new CustomEvent("switch-chat", { detail: res.id })
        );
    };

    /* ---------------------------
       Select chat
    ---------------------------- */
    const handleSelectChat = (chatId: string) => {
        setActiveChatId(chatId);

        window.dispatchEvent(
            new CustomEvent("switch-chat", { detail: chatId })
        );
    };

    /* ---------------------------
       Rename chat
    ---------------------------- */
    const handleRename = async (chatId: string) => {
        await renameChat(chatId, draftTitle || "New chat");

        const updated = await fetchChats();
        setChats(updated);

        setEditingId(null);
    };

    /* ---------------------------
       Delete chat
    ---------------------------- */
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        await deleteChat(deleteTarget.id);

        const updated = await fetchChats();
        setChats(updated);

        if (updated.length > 0) {
            setActiveChatId(updated[0].id);
            window.dispatchEvent(
                new CustomEvent("switch-chat", { detail: updated[0].id })
            );
        } else {
            setActiveChatId(null);
            window.dispatchEvent(
                new CustomEvent("switch-chat", { detail: null })
            );
        }

        setDeleteTarget(null);
    };

    return (
        <aside className="w-64 flex-col border-r bg-muted/40 flex">
            {/* Header */}
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

            {/* Chat list */}
            <ScrollArea className="flex-1 px-2">
                <div className="space-y-1">
                    {chats.map((chat) => (
                        <div
                            key={chat.id}
                            className={`group flex items-center rounded-md px-1 ${chat.id === activeChatId ? "bg-muted" : ""
                                }`}
                        >
                            {/* Title / Edit */}
                            {editingId === chat.id ? (
                                <input
                                    autoFocus
                                    value={draftTitle}
                                    onChange={(e) => setDraftTitle(e.target.value)}
                                    onBlur={() => handleRename(chat.id)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleRename(chat.id);
                                        if (e.key === "Escape") setEditingId(null);
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
                                    {chat.title || "New chat"}
                                </Button>
                            )}

                            {/* Edit */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-blue-600"
                                onClick={() => {
                                    setEditingId(chat.id);
                                    setDraftTitle(chat.title || "");
                                }}
                            >
                                <Pencil size={14} />
                            </Button>

                            {/* Delete */}
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

            {/* Delete confirmation */}
            <AlertDialog
                open={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete chat?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete{" "}
                            <span className="font-semibold">
                                {deleteTarget?.title || "this chat"}
                            </span>
                            .
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-500 text-white hover:bg-red-600"
                            onClick={confirmDelete}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </aside>
    );
}
