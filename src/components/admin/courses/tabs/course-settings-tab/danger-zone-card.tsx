"use client";

import { TrashIcon } from "@heroicons/react/24/outline";

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

interface DangerZoneCardProps {
  course: Course;
  onDelete: () => void;
}

export function DangerZoneCard({ course, onDelete }: DangerZoneCardProps) {
  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>Irreversible actions for this course</CardDescription>
      </CardHeader>
      <CardContent>
        <Item variant="outline" className="border-destructive">
          <ItemContent>
            <ItemTitle>Delete this course</ItemTitle>
            <ItemDescription>
              Once deleted, it cannot be recovered
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="destructive" onClick={onDelete} size="sm">
              <TrashIcon className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
}

