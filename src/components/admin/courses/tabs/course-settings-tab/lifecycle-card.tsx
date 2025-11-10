"use client";

import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { useCourseMutations } from "@/hooks/use-course-mutations";
import { CONTENT_STATUS } from "@/lib/constants/content-status";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@/components/ui/item";
import { Textarea } from "@/components/ui/textarea";

interface LifecycleCardProps {
  course: Course;
}

export function LifecycleCard({ course }: LifecycleCardProps) {
  const mutations = useCourseMutations(course._id);

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const handleReject = async () => {
    if (!rejectReason.trim()) return;

    setIsRejecting(true);
    const result = await mutations.reject(rejectReason);
    if (result.success) {
      setShowRejectDialog(false);
      setRejectReason("");
    }
    setIsRejecting(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Course Lifecycle</CardTitle>
          <CardDescription>Manage course approval and publication</CardDescription>
        </CardHeader>
        <CardContent>
          <ItemGroup className="space-y-2">
            {course.status === CONTENT_STATUS.PENDING && (
              <>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>Approve Course</ItemTitle>
                    <ItemDescription>
                      Approve this course for publication
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button onClick={mutations.approve} variant="default" size="sm">
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </ItemActions>
                </Item>
                <Item variant="outline">
                  <ItemContent>
                    <ItemTitle>Reject Course</ItemTitle>
                    <ItemDescription>
                      Reject this course and provide feedback
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <Button
                      onClick={() => setShowRejectDialog(true)}
                      variant="destructive"
                      size="sm"
                    >
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </ItemActions>
                </Item>
              </>
            )}

            {course.status === CONTENT_STATUS.APPROVED && (
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>Publish Course</ItemTitle>
                  <ItemDescription>
                    Make this course available to students
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button onClick={mutations.publish} size="sm">
                    <RocketLaunchIcon className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </ItemActions>
              </Item>
            )}

            {course.status === CONTENT_STATUS.PUBLISHED && (
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>Unpublish Course</ItemTitle>
                  <ItemDescription>
                    Hide this course from students
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Button onClick={mutations.unpublish} variant="outline" size="sm">
                    <ArchiveBoxIcon className="mr-2 h-4 w-4" />
                    Unpublish
                  </Button>
                </ItemActions>
              </Item>
            )}
          </ItemGroup>
        </CardContent>
      </Card>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Course</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this course. This will be sent to
              the course creator.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Course"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

