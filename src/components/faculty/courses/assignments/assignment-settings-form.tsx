"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DateTimePicker } from "@/components/ui/date-time-picker"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "convex/react"
import type { FunctionReturnType } from "convex/server"
import { Loader2Icon, SaveIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

const assignmentSettingsSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    instructions: z.string().optional(),
    submissionType: z.enum(["file", "url", "text"]),
    allowedFileTypes: z.array(z.string()).optional(),
    maxFileSize: z.number().min(1).optional(),
    allowMultipleAttempts: z.boolean(),
    maxAttempts: z.number().min(1).optional(),
    dueDate: z.number().optional(),
    availableFrom: z.number().optional(),
    availableUntil: z.number().optional(),
    allowLateSubmissions: z.boolean(),
    lateSubmissionPenalty: z.number().min(0).max(100).optional(),
    maxPoints: z.number().min(1),
})

type AssignmentSettingsFormData = z.infer<typeof assignmentSettingsSchema>

type Assignment = FunctionReturnType<typeof api.faculty.assignments.getAssignmentById>

interface AssignmentSettingsFormProps {
    assignment: NonNullable<Assignment>
}

export function AssignmentSettingsForm({ assignment }: AssignmentSettingsFormProps) {
    const updateAssignment = useMutation(api.faculty.assignments.updateAssignment)
    const [fileTypeInput, setFileTypeInput] = useState("")

    const form = useForm<AssignmentSettingsFormData>({
        resolver: zodResolver(assignmentSettingsSchema),
        defaultValues: {
            title: assignment.title,
            description: assignment.description || "",
            instructions: assignment.instructions || "",
            submissionType: (assignment.submissionType as "file" | "url" | "text") || "file",
            allowedFileTypes: assignment.allowedFileTypes || [],
            maxFileSize: assignment.maxFileSize,
            allowMultipleAttempts: assignment.allowMultipleAttempts ?? false,
            maxAttempts: assignment.maxAttempts,
            dueDate: assignment.dueDate,
            availableFrom: assignment.availableFrom,
            availableUntil: assignment.availableUntil,
            allowLateSubmissions: assignment.allowLateSubmissions ?? false,
            lateSubmissionPenalty: assignment.lateSubmissionPenalty,
            maxPoints: assignment.maxPoints || 100,
        },
    })

    const submissionType = form.watch("submissionType")
    const allowMultipleAttempts = form.watch("allowMultipleAttempts")
    const allowLateSubmissions = form.watch("allowLateSubmissions")
    const allowedFileTypes = form.watch("allowedFileTypes")

    // Reset conditional fields when toggles change
    useEffect(() => {
        if (!allowMultipleAttempts) {
            form.setValue("maxAttempts", undefined)
        }
    }, [allowMultipleAttempts, form])

    useEffect(() => {
        if (!allowLateSubmissions) {
            form.setValue("lateSubmissionPenalty", undefined)
        }
    }, [allowLateSubmissions, form])

    useEffect(() => {
        if (submissionType !== "file") {
            form.setValue("allowedFileTypes", undefined)
            form.setValue("maxFileSize", undefined)
        }
    }, [submissionType, form])

    const addFileType = () => {
        if (!fileTypeInput.trim()) return

        const current = allowedFileTypes || []
        if (!current.includes(fileTypeInput.trim())) {
            form.setValue("allowedFileTypes", [...current, fileTypeInput.trim()])
        }
        setFileTypeInput("")
    }

    const onSubmit = async (data: AssignmentSettingsFormData) => {
        try {
            await updateAssignment({
                assignmentId: assignment._id as Id<"assignments">,
                title: data.title,
                description: data.description,
                instructions: data.instructions || undefined,
                // Note: submissionType, allowedFileTypes, and maxFileSize cannot be updated after creation
                allowMultipleAttempts: data.allowMultipleAttempts,
                maxAttempts: data.allowMultipleAttempts ? data.maxAttempts : undefined,
                dueDate: data.dueDate,
                availableFrom: data.availableFrom,
                availableUntil: data.availableUntil,
                allowLateSubmissions: data.allowLateSubmissions,
                lateSubmissionPenalty: data.allowLateSubmissions ? data.lateSubmissionPenalty : undefined,
                maxPoints: data.maxPoints,
            })

            toast.success("Assignment settings saved successfully")
        } catch (error) {
            toast.error("Failed to save assignment settings")
            console.error(error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assignment Settings</CardTitle>
                <CardDescription>Configure the settings for your assignment</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Basic Information</h3>

                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Title</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter assignment title" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter assignment description"
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="instructions"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Instructions (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter detailed instructions for students"
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Detailed instructions for completing the assignment</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Submission Settings */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Submission Settings</h3>

                            <FormField
                                control={form.control}
                                name="submissionType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Submission Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select submission type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="file">File Upload</SelectItem>
                                                <SelectItem value="url">URL Submission</SelectItem>
                                                <SelectItem value="text">Text Entry</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Submission type cannot be changed after creation</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {submissionType === "file" && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="allowedFileTypes"
                                        render={() => (
                                            <FormItem>
                                                <FormLabel>Allowed File Types</FormLabel>
                                                <div className="space-y-2">
                                                    <div className="flex gap-2">
                                                        <Input
                                                            placeholder="e.g., .pdf, .docx, .zip"
                                                            value={fileTypeInput}
                                                            onChange={(e) => setFileTypeInput(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") {
                                                                    e.preventDefault()
                                                                    addFileType()
                                                                }
                                                            }}
                                                            disabled
                                                        />
                                                        <Button type="button" variant="outline" onClick={addFileType} disabled>
                                                            Add
                                                        </Button>
                                                    </div>
                                                    {allowedFileTypes && allowedFileTypes.length > 0 && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {allowedFileTypes.map((type) => (
                                                                <div
                                                                    key={type}
                                                                    className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm"
                                                                >
                                                                    <span>{type}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                                <FormDescription>File types cannot be changed after creation</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="maxFileSize"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Max File Size (MB)</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="number"
                                                        min={1}
                                                        placeholder="e.g., 10"
                                                        {...field}
                                                        value={field.value ?? ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value
                                                            field.onChange(value === "" ? undefined : parseInt(value, 10))
                                                        }}
                                                        disabled
                                                    />
                                                </FormControl>
                                                <FormDescription>File size limit cannot be changed after creation</FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            <FormField
                                control={form.control}
                                name="allowMultipleAttempts"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Allow Multiple Attempts</FormLabel>
                                            <FormDescription>Let students resubmit their work</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {allowMultipleAttempts && (
                                <FormField
                                    control={form.control}
                                    name="maxAttempts"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Attempts</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    placeholder="Unlimited"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        field.onChange(value === "" ? undefined : parseInt(value, 10))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Leave empty for unlimited attempts</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Availability & Deadlines */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Availability & Deadlines</h3>

                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date (Optional)</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select due date"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="availableFrom"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available From (Optional)</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select start date"
                                            />
                                        </FormControl>
                                        <FormDescription>Assignment will be available starting from this date</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="availableUntil"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available Until (Optional)</FormLabel>
                                        <FormControl>
                                            <DateTimePicker
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select end date"
                                            />
                                        </FormControl>
                                        <FormDescription>Assignment will no longer be available after this date</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="allowLateSubmissions"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Allow Late Submissions</FormLabel>
                                            <FormDescription>Accept submissions after the due date</FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            {allowLateSubmissions && (
                                <FormField
                                    control={form.control}
                                    name="lateSubmissionPenalty"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Late Submission Penalty (%)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={100}
                                                    placeholder="e.g., 10"
                                                    {...field}
                                                    value={field.value ?? ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value
                                                        field.onChange(value === "" ? undefined : parseInt(value, 10))
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>Percentage deducted from late submissions (0-100)</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        {/* Grading */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg">Grading</h3>

                            <FormField
                                control={form.control}
                                name="maxPoints"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Points</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                                            />
                                        </FormControl>
                                        <FormDescription>Total points for this assignment</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                                <SaveIcon className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
