"use client"

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface CategoryMoveDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    categoryName: string
    currentLevel: number
    newLevel: number
    childrenCount: number
    onConfirm: () => void
}

export function CategoryMoveDialog({
    open,
    onOpenChange,
    categoryName,
    currentLevel,
    newLevel,
    childrenCount,
    onConfirm,
}: CategoryMoveDialogProps) {
    const levelChange = currentLevel !== newLevel
    const willAffectChildren = childrenCount > 0 && levelChange

    const getLevelChangeText = () => {
        if (currentLevel < newLevel) {
            return `promoted from Level ${currentLevel} to Level ${newLevel}`
        } else {
            return `demoted from Level ${currentLevel} to Level ${newLevel}`
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Move Category</AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                        <p>
                            Are you sure you want to move <strong>{categoryName}</strong>?
                        </p>
                        {levelChange && (
                            <p>
                                This category will be {getLevelChangeText()}.
                            </p>
                        )}
                        {willAffectChildren && (
                            <p className="font-medium text-destructive">
                                Warning: This will also affect {childrenCount}{" "}
                                {childrenCount === 1 ? "child category" : "child categories"}.
                                {currentLevel > newLevel && (
                                    <span>
                                        {" "}
                                        Child categories will be automatically adjusted to maintain the hierarchy.
                                    </span>
                                )}
                            </p>
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm}>Move Category</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

