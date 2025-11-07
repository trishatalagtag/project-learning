"use client"

import type { ContentItem, ContentType } from "@/components/admin/content-approval"
import {
  ContentTypeTab,
  OverviewTab,
  PreviewSheet,
  RejectDialog,
  TYPE_CONFIG,
  useContentApproval,
} from "@/components/admin/content-approval"
import { Tab, TabList, TabPanel, Tabs } from "@/components/ui/tabs"
import { Squares2X2Icon } from "@heroicons/react/24/outline"
import { createFileRoute } from "@tanstack/react-router"
import { useCallback, useState } from "react"

export const Route = createFileRoute("/_authenticated/_admin/a/content-approval")({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedTab, setSelectedTab] = useState<string>("overview")
  const [previewItem, setPreviewItem] = useState<ContentItem | null>(null)
  const [rejectItem, setRejectItem] = useState<ContentItem | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [processing, setProcessing] = useState<string | null>(null)

  // Use the hook for approval/rejection logic
  // Note: We'll use a default contentType, but the actual item type will be used in handlers
  const { handleApprove, handleReject } = useContentApproval({
    contentType: "course", // Default, will be overridden by actual item type
    status: "pending",
  })

  const onApprove = useCallback(
    async (item: ContentItem) => {
      setProcessing(item._id)
      try {
        await handleApprove(item)
        setPreviewItem(null)
      } catch (_error) {
        // Error already handled in hook
      } finally {
        setProcessing(null)
      }
    },
    [handleApprove],
  )

  const onReject = useCallback(
    async (item: ContentItem) => {
      setRejectItem(item)
      setPreviewItem(null)
    },
    [],
  )

  const onConfirmReject = useCallback(async () => {
    if (!rejectItem) return

    setProcessing(rejectItem._id)
    try {
      await handleReject(rejectItem, rejectReason)
      setRejectItem(null)
      setRejectReason("")
    } catch (_error) {
      // Error already handled in hook
    } finally {
      setProcessing(null)
    }
  }, [rejectItem, rejectReason, handleReject])

  return (
    <div className="h-full p-6">
      <div className="mb-6">
        <h1 className="font-semibold text-2xl">Content Approval Queue</h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Review and approve pending content submissions
        </p>
      </div>
      <Tabs selectedKey={selectedTab} onSelectionChange={(key) => setSelectedTab(key as string)}>
        <TabList>
          <Tab id="overview">
            <Squares2X2Icon className="size-4" />
            Overview
          </Tab>
          {Object.entries(TYPE_CONFIG).map(([type, config]) => {
            const Icon = config.icon
            return (
              <Tab key={type} id={type}>
                <Icon className="size-4" />
                {config.pluralLabel}
              </Tab>
            )
          }
          )}
        </TabList>
        <TabPanel id="overview">
          <OverviewTab
            onPreview={setPreviewItem}
            onReject={onReject}
            onApprove={onApprove}
            processing={processing}
          />
        </TabPanel>
        {Object.keys(TYPE_CONFIG).map((type) => (
          <TabPanel key={type} id={type}>
            <ContentTypeTab
              contentType={type as ContentType}
              onPreview={setPreviewItem}
              onReject={onReject}
              onApprove={onApprove}
              processing={processing}
            />
          </TabPanel>
        ))}
      </Tabs>
      <PreviewSheet
        item={previewItem}
        isOpen={!!previewItem}
        onClose={() => setPreviewItem(null)}
        onApprove={() => previewItem && onApprove(previewItem)}
        onReject={() => previewItem && onReject(previewItem)}
        isProcessing={processing === previewItem?._id}
      />
      <RejectDialog
        item={rejectItem}
        isOpen={!!rejectItem}
        onClose={() => {
          setRejectItem(null)
          setRejectReason("")
        }}
        onConfirm={onConfirmReject}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        isProcessing={processing === rejectItem?._id}
      />
    </div>
  )
}
