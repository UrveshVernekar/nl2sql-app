"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

export default function Sidebar() {
    const handleNewChat = () => {
        window.dispatchEvent(new CustomEvent("new-chat"));
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
                <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start">
                        Show sales last month
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                        Top 10 materials by cost
                    </Button>
                </div>
            </ScrollArea>
        </aside>
    );
}