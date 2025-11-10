import { Badge } from "@/components/ui/badge";
import { STATUS_CONFIG, type ContentStatus } from "@/lib/constants/content-status";
import { StatusIcon } from "./status-icon";

interface StatusBadgeProps {
  status: ContentStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = false, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={className}>
      {showIcon && <StatusIcon status={status} className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
}

