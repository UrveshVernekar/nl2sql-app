"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import MobileSidebar from "./mobile-sidebar";


export default function Topbar() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    // 👇 CRITICAL: prevent hydration mismatch
    if (!mounted) {
        return (
            <header className="flex h-14 items-center justify-between border-b px-6">
                <h1 className="text-sm font-medium text-muted-foreground">
                    Natural Language → SQL
                </h1>
            </header>
        );
    }

    return (
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
            <div className="flex items-center gap-2">
                <MobileSidebar />
                <h1 className="text-sm font-medium text-muted-foreground">
                    Natural Language → SQL
                </h1>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
        </header>
    );
}
