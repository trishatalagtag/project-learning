<!-- 4dfad44b-edb2-4a37-83b8-723d5e106d76 a88133f3-577a-4802-85de-c282cd23218b -->
# Drag Confirm Fix Plan

1. Update drop target detection in `src/components/admin/content-approval/components/kanban-board.tsx` so `handleDragEnd` resolves the destination status from the sortable container (use `over.data.current.sortable.containerId` with a fallback) instead of casting `over.id` to a status key.
2. Guard the confirmation logic in the same file: only open the confirmation modal when the resolved status is one of the known `StatusType` values; otherwise skip it.
3. Manually verify in the Kanban UI that dragging to Approved/Draft triggers the confirmation modal and that Confirm now calls the correct approval/rejection handlers.