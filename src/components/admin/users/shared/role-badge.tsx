import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AcademicCapIcon, ShieldCheckIcon, UserIcon } from "@heroicons/react/24/outline"

interface RoleBadgeProps {
    role: "ADMIN" | "FACULTY" | "LEARNER"
    className?: string
}

const ROLE_CONFIG = {
    ADMIN: {
        label: "Admin",
        icon: ShieldCheckIcon,
        variant: "default" as const,
        description: "Full system access and management capabilities",
    },
    FACULTY: {
        label: "Faculty",
        icon: AcademicCapIcon,
        variant: "secondary" as const,
        description: "Can create and manage courses",
    },
    LEARNER: {
        label: "Learner",
        icon: UserIcon,
        variant: "outline" as const,
        description: "Can enroll in and take courses",
    },
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    const config = ROLE_CONFIG[role]
    const Icon = config.icon

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Badge variant={config.variant} className={className}>
                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                        {config.label}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs">{config.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

