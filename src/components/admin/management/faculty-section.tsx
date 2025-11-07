"use client"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    ComboBox,
    ComboBoxContent,
    ComboBoxInput,
    ComboBoxItem,
    ComboBoxLabel,
} from "@/components/ui/combo-box"
import { Label } from "@/components/ui/field"
import { Loader } from "@/components/ui/loader"
import {
    Modal,
    ModalBody,
    ModalClose,
    ModalContent,
    ModalDescription,
    ModalFooter,
    ModalHeader,
    ModalTitle,
} from "@/components/ui/modal"
import { Separator } from "@/components/ui/separator"
import { Text } from "@/components/ui/text"
import { TextField } from "@/components/ui/text-field"
import { UserIcon } from "@heroicons/react/24/outline"
import { api } from "api"
import { useQuery } from "convex/react"
import { useState } from "react"
import { toast } from "sonner"

interface FacultySectionProps {
    currentTeacherId?: string
    currentTeacherName?: string
    onAssign: (userId: string) => Promise<void>
    onUnassign: () => Promise<void>
}

type FacultyMember = {
    userId: string
    name: string
    email: string
}

export function FacultySection({
    currentTeacherId,
    currentTeacherName,
    onAssign,
    onUnassign,
}: FacultySectionProps) {
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
    const [isUnassignModalOpen, setIsUnassignModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
    const [isPending, setIsPending] = useState(false)

    const facultyList = useQuery(api.admin.users.listUsersByRole, { role: "FACULTY" })

    const handleAssign = async () => {
        if (!selectedUserId) {
            toast.error("Please select a faculty member")
            return
        }

        setIsPending(true)
        try {
            await onAssign(selectedUserId)
            toast.success("Faculty assigned successfully")
            setIsAssignModalOpen(false)
            setSelectedUserId(null)
        } catch {
            toast.error("Failed to assign faculty")
        } finally {
            setIsPending(false)
        }
    }

    const handleUnassign = async () => {
        setIsPending(true)
        try {
            await onUnassign()
            toast.success("Faculty unassigned")
            setIsUnassignModalOpen(false)
        } catch (_error) {
            toast.error("Failed to unassign faculty")
        } finally {
            setIsPending(false)
        }
    }

    const selectedFaculty = facultyList?.find((f) => f.userId === currentTeacherId)

    return (
        <div className="space-y-6">
            {currentTeacherName ? (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <Avatar
                                src={selectedFaculty?.email}
                                alt={currentTeacherName}
                                fallback={<UserIcon className="size-5" />}
                                className="size-12"
                            />
                            <div className="flex-1">
                                <Text className="text-muted-foreground text-sm">
                                    Current Instructor
                                </Text>
                                <Text className="mt-1 font-semibold">{currentTeacherName}</Text>
                                {selectedFaculty?.email && (
                                    <Text className="mt-0.5 text-muted-foreground text-sm">
                                        {selectedFaculty.email}
                                    </Text>
                                )}
                            </div>
                            <Badge intent="success">Assigned</Badge>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                <UserIcon className="size-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                                <Text className="text-muted-foreground text-sm">
                                    No instructor assigned
                                </Text>
                                <Text className="mt-1 font-medium">Assign a faculty member</Text>
                            </div>
                            <Badge intent="secondary">Unassigned</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Separator />

            <div className="flex flex-wrap gap-3">
                <Button
                    intent="secondary"
                    onPress={() => setIsAssignModalOpen(true)}
                >
                    {currentTeacherId ? "Reassign" : "Assign"} Faculty
                </Button>
                {currentTeacherId && (
                    <Button
                        intent="outline"
                        onPress={() => setIsUnassignModalOpen(true)}
                    >
                        Unassign Faculty
                    </Button>
                )}
            </div>

            {/* Assign Modal */}
            <Modal isOpen={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
                <ModalContent>
                    <ModalHeader>
                        <ModalTitle>Assign Faculty</ModalTitle>
                        <ModalDescription>
                            Select a faculty member to assign to this course.
                        </ModalDescription>
                    </ModalHeader>
                    <ModalBody>
                        {facultyList === undefined ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader variant="spin" className="size-6" />
                            </div>
                        ) : facultyList.length === 0 ? (
                            <div className="py-8 text-center">
                                <Text className="text-muted-foreground">
                                    No faculty members available.
                                </Text>
                            </div>
                        ) : (
                            <TextField isRequired>
                                <Label>Faculty Member</Label>
                                <ComboBox<FacultyMember>
                                    selectedKey={selectedUserId}
                                    onSelectionChange={(key) => setSelectedUserId(key as string)}
                                    items={facultyList}
                                >
                                    <ComboBoxInput placeholder="Search faculty members..." />
                                    <ComboBoxContent>
                                        {(faculty: FacultyMember) => (
                                            <ComboBoxItem id={faculty.userId} textValue={faculty.name}>
                                                <div className="flex items-center gap-3">
                                                    <Avatar
                                                        src={faculty.email}
                                                        alt={faculty.name}
                                                        fallback={<UserIcon className="size-4" />}
                                                        className="size-8"
                                                    />
                                                    <div className="flex-1">
                                                        <ComboBoxLabel>{faculty.name}</ComboBoxLabel>
                                                        <Text className="text-muted-foreground text-xs">
                                                            {faculty.email}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </ComboBoxItem>
                                        )}
                                    </ComboBoxContent>
                                </ComboBox>
                            </TextField>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <ModalClose>Cancel</ModalClose>
                        <Button
                            intent="primary"
                            onPress={handleAssign}
                            isPending={isPending}
                            isDisabled={!selectedUserId}
                        >
                            Assign Faculty
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Unassign Modal */}
            <Modal isOpen={isUnassignModalOpen} onOpenChange={setIsUnassignModalOpen}>
                <ModalContent role="alertdialog">
                    <ModalHeader>
                        <ModalTitle>Unassign Faculty</ModalTitle>
                        <ModalDescription>
                            Are you sure you want to unassign {currentTeacherName} from this course?
                        </ModalDescription>
                    </ModalHeader>
                    <ModalFooter>
                        <ModalClose>Cancel</ModalClose>
                        <Button
                            intent="danger"
                            onPress={handleUnassign}
                            isPending={isPending}
                        >
                            Unassign
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
