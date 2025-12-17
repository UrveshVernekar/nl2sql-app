"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ChatInput() {
    const [value, setValue] = useState("");

    const handleSend = () => {
        if (!value.trim()) return;
        window.dispatchEvent(new CustomEvent("send-message", { detail: value }));
        setValue("");
    };

    return (
        <div className="border-t bg-background p-4">
            <div className="mx-auto flex max-w-3xl gap-2">
                <Textarea
                    placeholder="Ask a question in natural language..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    rows={2}
                    className="flex-1 resize-none text-base"
                />
                <Button
                    className=" cursor-pointer transition-transform active:scale-95"
                    onClick={handleSend}
                >
                    Send
                </Button>
            </div>
        </div>
    );
}