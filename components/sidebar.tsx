import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Sidebar() {
    return (
        <aside className="w-64 flex-col border-r bg-muted/40 flex">
            <div className="p-4 font-semibold">NL2SQL</div>

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