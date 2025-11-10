"use client";

import { UserMinusIcon } from "@heroicons/react/24/outline";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { useCourseMutations } from "@/hooks/use-course-mutations";
import type { Course } from "@/lib/types/course";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from "@/components/ui/item";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface FacultyAssignmentCardProps {
    course: Course;
}

export function FacultyAssignmentCard({ course }: FacultyAssignmentCardProps) {
    const mutations = useCourseMutations(course._id);
    const faculty = useQuery(api.admin.users.listUsersByRole, {
        role: "FACULTY",
    });

    const handleAssign = async (teacherId: string) => {
        await mutations.assignTeacher(teacherId);
    };

    const handleUnassign = async () => {
        await mutations.unassignTeacher();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Faculty Assignment</CardTitle>
                <CardDescription>Assign a teacher to this course</CardDescription>
            </CardHeader>
            <CardContent>
                <Item variant="outline">
                    {course.teacherId ? (
                        <>
                            <ItemContent>
                                <ItemTitle>{course.teacherName}</ItemTitle>
                                <ItemDescription>Currently assigned</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Button variant="outline" size="sm" onClick={handleUnassign}>
                                    <UserMinusIcon className="mr-2 h-4 w-4" />
                                    Unassign
                                </Button>
                            </ItemActions>
                        </>
                    ) : (
                        <>
                            <ItemContent>
                                <ItemTitle>Faculty Assignment</ItemTitle>
                                <ItemDescription>No faculty member assigned</ItemDescription>
                            </ItemContent>
                            <ItemActions>
                                <Select onValueChange={handleAssign}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select a faculty member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {faculty?.map((teacher) => (
                                            <SelectItem key={teacher.userId} value={teacher.userId}>
                                                {teacher.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </ItemActions>
                        </>
                    )}
                </Item>
            </CardContent>
        </Card>
    );
}

