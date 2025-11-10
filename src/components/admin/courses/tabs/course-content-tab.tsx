"use client";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

import { ContentStats } from "./course-content-tab/content-stats";
import { ModuleItem } from "./course-content-tab/module-item";

interface CourseContentTabProps {
  courseId: Id<"courses">;
}

/**
 * Course Content Tab - Admin View
 *
 * Displays course modules and lessons with:
 * - Read-only overview of course structure
 * - Approval/rejection actions for pending content
 * - Statistics dashboard
 * - Expand/collapse controls
 */
export function CourseContentTab({ courseId }: CourseContentTabProps) {
  const modules = useQuery(api.faculty.modules.listModulesByCourse, {
    courseId,
  });

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (modules) {
      setExpandedModules(new Set(modules.map((m) => m._id)));
    }
  };

  const collapseAll = () => {
    setExpandedModules(new Set());
  };

  const allExpanded = useMemo(() => {
    return modules && expandedModules.size === modules.length;
  }, [modules, expandedModules]);

  // Loading state
  if (modules === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading course content...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (modules.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <BookOpenIcon className="h-12 w-12 text-muted-foreground" />
              </EmptyMedia>
              <EmptyTitle>No modules yet</EmptyTitle>
              <EmptyDescription>
                This course doesn't have any modules. Faculty can create modules in
                the faculty dashboard.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Course Content</CardTitle>
            <CardDescription className="mt-1.5">
              Review and approve course modules and lessons
            </CardDescription>
          </div>
          {modules.length > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={allExpanded ? collapseAll : expandAll}
              >
                {allExpanded ? (
                  <>
                    <ChevronRightIcon className="mr-2 h-4 w-4" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="mr-2 h-4 w-4" />
                    Expand All
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Statistics Bar */}
        <ContentStats modules={modules} />
      </CardHeader>

      <CardContent className="space-y-3">
        {modules.map((module, index) => (
          <ModuleItem
            key={module._id}
            module={module}
            courseId={courseId}
            moduleNumber={index + 1}
            isExpanded={expandedModules.has(module._id)}
            onToggle={() => toggleModule(module._id)}
          />
        ))}
      </CardContent>
    </Card>
  );
}
