import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ShieldExclamationIcon } from "@heroicons/react/24/outline";

interface AccessDeniedProps {
    message?: string;
}

export function AccessDenied({ message = "You don't have permission to view this content" }: AccessDeniedProps) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <ShieldExclamationIcon className="h-12 w-12 text-muted-foreground" />
                    </EmptyMedia>
                    <EmptyTitle>Access Denied</EmptyTitle>
                    <EmptyDescription>{message}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        </div>
    );
}

