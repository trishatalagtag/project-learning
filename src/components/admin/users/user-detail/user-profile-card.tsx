import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Item,
    ItemContent,
    ItemDescription,
    ItemGroup,
    ItemTitle
} from "@/components/ui/item"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    CheckCircleIcon,
    EnvelopeIcon,
    ExclamationCircleIcon,
    PencilIcon,
} from "@heroicons/react/24/solid"
import { useState } from "react"

import type { User } from "../columns"
import { RoleBadge } from "../shared/role-badge"
import { UserAvatar } from "../shared/user-avatar"
import { DeactivateUserDialog } from "./deactivate-user-dialog"
import { EditUserDialog } from "./edit-user-dialog"

interface UserProfileCardProps {
    user: User
}

export function UserProfileCard({ user }: UserProfileCardProps) {
    const [showEditDialog, setShowEditDialog] = useState(false)
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <CardTitle>Profile Information</CardTitle>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                                <PencilIcon className="mr-2 h-4 w-4" />
                                Edit Profile
                            </Button>
                            {!user.isDeactivated && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setShowDeactivateDialog(true)}
                                >
                                    <ExclamationCircleIcon className="mr-2 h-4 w-4" />
                                    Deactivate
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* User Header */}
                    <div className="mb-6 flex items-center gap-4">
                        <UserAvatar name={user.name} image={user.image} size="lg" />
                        <div className="flex-1">
                            <h2 className="font-bold text-2xl">{user.name}</h2>
                            <div className="mt-1 flex items-center gap-2">
                                <p className="text-muted-foreground">{user.email}</p>
                                {user.emailVerified ? (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <CheckCircleIcon className="h-4 w-4 text-primary" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Email verified</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                ) : (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <ExclamationCircleIcon className="h-4 w-4 text-destructive" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p className="text-xs">Email not verified</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Details */}
                    <ItemGroup className="space-y-2">
                        <Item variant="outline">
                            <ItemContent>
                                <ItemTitle>Role</ItemTitle>
                                <ItemDescription className="mt-1">
                                    <RoleBadge role={user.role} />
                                </ItemDescription>
                            </ItemContent>
                        </Item>

                        <Item variant="outline">
                            <ItemContent>
                                <ItemTitle>Email Address</ItemTitle>
                                <ItemDescription className="mt-1 flex items-center gap-2">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    {user.email}
                                </ItemDescription>
                            </ItemContent>
                        </Item>

                        {user.institution && (
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>Institution</ItemTitle>
                                    <ItemDescription className="mt-1">{user.institution}</ItemDescription>
                                </ItemContent>
                            </Item>
                        )}

                        {user.bio && (
                            <Item variant="outline">
                                <ItemContent>
                                    <ItemTitle>Bio</ItemTitle>
                                    <ItemDescription className="mt-1 whitespace-pre-wrap">{user.bio}</ItemDescription>
                                </ItemContent>
                            </Item>
                        )}

                        <Item variant="outline">
                            <ItemContent>
                                <ItemTitle>Account Status</ItemTitle>
                                <ItemDescription className="mt-1">
                                    {user.isDeactivated ? (
                                        <span className="text-destructive">Deactivated</span>
                                    ) : (
                                        <span className="text-primary">Active</span>
                                    )}
                                </ItemDescription>
                            </ItemContent>
                        </Item>
                    </ItemGroup>
                </CardContent>
            </Card>

            {/* Dialogs */}
            <EditUserDialog open={showEditDialog} onOpenChange={setShowEditDialog} user={user} />
            <DeactivateUserDialog
                open={showDeactivateDialog}
                onOpenChange={setShowDeactivateDialog}
                user={user}
            />
        </>
    )
}

