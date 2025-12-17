import { Skeleton } from "@/components/ui/skeleton";

export default function ChatSkeleton() {
    return (
        <div className="space-x-3">
            <Skeleton className="h-4 w-[60%]" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-4 w-[40%]" />
        </div>
    );
}