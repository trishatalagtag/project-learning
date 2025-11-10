import type { api } from "@/convex/_generated/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { FunctionReturnType } from "convex/server";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { StatusBadge } from "@/components/shared/status/status-badge";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
import { useCan } from "@/lib/hooks/use-can";
import { canViewUnpublishedContent, type UserRole } from "@/lib/rbac/permissions";

type Module = NonNullable<FunctionReturnType<typeof api.faculty.modules.getModuleById>>;

interface ModuleHeaderProps {
    module: Module;
    userRole: UserRole;
    onEdit?: () => void;
    onDelete?: () => void;
}

export function ModuleHeader({ module, userRole, onEdit, onDelete }: ModuleHeaderProps) {
    const showStatus = userRole ? canViewUnpublishedContent(userRole) : false;
    const canEdit = useCan("edit", "module", { status: module.status });
    const canDelete = useCan("delete", "module", { status: module.status });

    return (
        <div className="border-b bg-background px-8 py-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-4xl font-bold mb-2">{module.title}</h1>
                        <p className="text-lg text-muted-foreground">{module.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {showStatus && module.status !== CONTENT_STATUS.PUBLISHED && (
                            <StatusBadge status={module.status} className="capitalize" />
                        )}

                        {(canEdit || canDelete) && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        Actions
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={onEdit}>
                                        <PencilIcon className="mr-2 h-4 w-4" />
                                        Edit Module
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                                        <TrashIcon className="mr-2 h-4 w-4" />
                                        Delete Module
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

