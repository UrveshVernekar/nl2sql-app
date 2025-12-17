"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Sidebar from "./sidebar";

export default function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open sidebar"
                >
                    <Menu size={18} />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="p-0 w-64">
                {/* ✅ REQUIRED for accessibility */}
                <VisuallyHidden>
                    <SheetTitle>Navigation</SheetTitle>
                </VisuallyHidden>

                <Sidebar />
            </SheetContent>
        </Sheet>
    );
}
