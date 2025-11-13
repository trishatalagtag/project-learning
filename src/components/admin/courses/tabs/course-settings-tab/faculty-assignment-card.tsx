"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { api } from "@/convex/_generated/api"
import { useCourseMutations } from "@/hooks/use-course-mutations"
import type { Course } from "@/lib/types/course"
import { CheckIcon, UserIcon, UserMinusIcon } from "@heroicons/react/24/solid"
import { useQuery } from "convex/react"
import { Loader2, Search } from "lucide-react"
import { useMemo, useState } from "react"

interface FacultyAssignmentCardProps {
  course: Course
}

export function FacultyAssignmentCard({ course }: FacultyAssignmentCardProps) {
  const mutations = useCourseMutations(course._id)
  const [teacherDialogOpen, setTeacherDialogOpen] = useState(false)
  const [search, setSearch] = useState("")

  const faculty = useQuery(api.admin.users.listUsersByRole, {
    role: "FACULTY",
  })

  const filteredTeachers = useMemo(() => {
    if (!faculty) return []
    const sorted = [...faculty].sort((a, b) => a.name.localeCompare(b.name))
    if (!search) return sorted
    return sorted.filter(
      (teacher) =>
        teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.email.toLowerCase().includes(search.toLowerCase()),
    )
  }, [faculty, search])

  const handleAssign = async (teacherId: string) => {
    await mutations.assignTeacher(teacherId)
    setTeacherDialogOpen(false)
    setSearch("")
  }

  const handleUnassign = async () => {
    await mutations.unassignTeacher()
  }

  const selectedTeacher = faculty?.find(
    (t) => t._id === course.teacherId,
  ) as { _id: string; userId: string; name: string; email: string; image?: string } | undefined

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Faculty Assignment</CardTitle>
          <CardDescription>Assign a teacher to this course</CardDescription>
        </CardHeader>
        <CardContent>
          <Item variant="outline">
            {course.teacherId && selectedTeacher ? (
              <>
                <ItemMedia variant="icon">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedTeacher.image ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedTeacher.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{selectedTeacher.name}</ItemTitle>
                  <ItemDescription>{selectedTeacher.email}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button variant="outline" size="sm" onClick={() => setTeacherDialogOpen(true)}>
                    Change
                  </Button>
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
                  <Button variant="outline" size="sm" onClick={() => setTeacherDialogOpen(true)}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    Select Teacher
                  </Button>
                </ItemActions>
              </>
            )}
          </Item>
        </CardContent>
      </Card>

      {/* Teacher Selection Dialog */}
      <Dialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen}>
        <DialogContent className="max-w-[650px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              Select Teacher
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {faculty === undefined ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTeachers && filteredTeachers.length > 0 ? (
                <ItemGroup>
                  {filteredTeachers.map((teacher) => {
                    const isSelected = course.teacherId === teacher._id
                    return (
                      <Item
                        key={teacher._id}
                        variant={isSelected ? "muted" : "default"}
                        className="cursor-pointer transition-colors hover:bg-muted/50"
                        onClick={() => handleAssign(teacher._id)}
                      >
                        <ItemMedia variant="icon">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={teacher.image ?? undefined} />
                            <AvatarFallback
                              className={isSelected ? "bg-primary text-primary-foreground" : ""}
                            >
                              {teacher.name
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </ItemMedia>
                        <ItemContent>
                          <ItemTitle className="font-medium">{teacher.name}</ItemTitle>
                          <ItemDescription>{teacher.email}</ItemDescription>
                        </ItemContent>
                        {isSelected && (
                          <ItemActions>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                              <CheckIcon className="h-4 w-4 text-primary-foreground" />
                            </div>
                          </ItemActions>
                        )}
                      </Item>
                    )
                  })}
                </ItemGroup>
              ) : (
                <div className="py-12 text-center">
                  <UserIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 font-medium">No teachers found</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {search ? "Try adjusting your search" : "No faculty members available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}