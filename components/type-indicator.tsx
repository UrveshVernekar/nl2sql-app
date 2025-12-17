export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 text-muted-foreground">
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-150" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground delay-300" />
        </div>
    );
}