import { cn } from "@/lib/utils"
import { UserIcon } from "@heroicons/react/24/solid"

interface UserAvatarProps {
    name: string
    image?: string
    className?: string
    size?: "sm" | "md" | "lg"
}

const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-lg",
}

const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
}

export function UserAvatar({ name, image, className, size = "md" }: UserAvatarProps) {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    if (image) {
        return (
            <div className={cn("overflow-hidden rounded-full", sizeClasses[size], className)}>
                <img src={image} alt={name} className="h-full w-full object-cover" />
            </div>
        )
    }

    return (
        <div
            className={cn(
                "flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary",
                sizeClasses[size],
                className
            )}
        >
            {initials || <UserIcon className={iconSizes[size]} />}
        </div>
    )
}

