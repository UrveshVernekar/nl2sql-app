"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export default function SqlMessage({ sql }: { sql: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="rounded-lg border bg-muted p-4 text-sm font-mono">
            <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                    Generated SQL
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    className="cursor-pointer"
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                </Button>
            </div>

            <pre className="overflow-x-auto whitespace-pre-wrap">
                {sql}
            </pre>
        </div>
    );
}