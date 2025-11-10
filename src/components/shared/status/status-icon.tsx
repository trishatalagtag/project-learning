import { STATUS_ICONS, type ContentStatus } from "@/lib/constants/content-status";

interface StatusIconProps {
    status: ContentStatus;
    className?: string;
}

export function StatusIcon({ status, className }: StatusIconProps) {
    const Icon = STATUS_ICONS[status];
    return <Icon className={className} />;
}

