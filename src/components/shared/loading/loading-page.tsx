import { Loader2 } from "lucide-react";

interface LoadingPageProps {
    message?: string;
}

export function LoadingPage({ message = "Loading..." }: LoadingPageProps) {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{message}</p>
            </div>
        </div>
    );
}

