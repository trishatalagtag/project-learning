"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Text } from "@/components/ui/text"
import { TextField } from "@/components/ui/text-field"
import {
    AcademicCapIcon,
    ChartBarIcon,
    PencilIcon,
} from "@heroicons/react/24/outline"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface GradingConfig {
    passingScore: number
    gradingMethod: "numerical" | "competency" | "weighted"
    components?: Array<{
        name: string
        weight: number
    }>
}

const GRADING_METHODS = [
    { value: "numerical", label: "Numerical (0-100 scores)" },
    { value: "competency", label: "Competency (Competent/Not Competent)" },
    { value: "weighted", label: "Weighted (Custom weighted components)" },
] as const

interface GradingSectionProps {
    currentConfig: GradingConfig
    onUpdate: (config: {
        gradingMethod: string
        passingScore?: number
        weightedComponents?: Array<{ name: string; weight: number }>
    }) => Promise<void>
}

export function GradingSection({
    currentConfig,
    onUpdate,
}: GradingSectionProps) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isPending, setIsPending] = useState(false)

    const [gradingMethod, setGradingMethod] = useState<"numerical" | "competency" | "weighted">(
        currentConfig.gradingMethod
    )
    const [passingScore, setPassingScore] = useState(currentConfig.passingScore.toString())
    const [components, setComponents] = useState<Array<{ name: string; weight: number }>>(
        currentConfig.components ?? []
    )

    useEffect(() => {
        if (isModalOpen) {
            setGradingMethod(currentConfig.gradingMethod)
            setPassingScore(currentConfig.passingScore.toString())
            setComponents(currentConfig.components ?? [])
        }
    }, [isModalOpen, currentConfig])

    const handleAddComponent = () => {
        setComponents([...components, { name: "", weight: 0 }])
    }

    const handleRemoveComponent = (index: number) => {
        setComponents(components.filter((_, i) => i !== index))
    }

    const handleComponentChange = (
        index: number,
        field: "name" | "weight",
        value: string
    ) => {
        const updated = [...components]
        if (field === "name") {
            updated[index] = { ...updated[index], name: value }
        } else {
            updated[index] = { ...updated[index], weight: Number(value) || 0 }
        }
        setComponents(updated)
    }

    const handleSave = async () => {
        const score = Number(passingScore)
        if (Number.isNaN(score) || score < 0 || score > 100) {
            toast.error("Passing score must be between 0 and 100")
            return
        }

        if (gradingMethod === "weighted") {
            if (components.length === 0) {
                toast.error("Weighted grading requires at least one component")
                return
            }

            const totalWeight = components.reduce((sum, c) => sum + c.weight, 0)
            if (Math.abs(totalWeight - 100) > 0.01) {
                toast.error("Component weights must sum to 100%")
                return
            }

            for (const component of components) {
                if (!component.name.trim()) {
                    toast.error("All components must have a name")
                    return
                }
                if (component.weight <= 0) {
                    toast.error("Component weights must be positive numbers")
                    return
                }
            }
        }

        setIsPending(true)
        try {
            await onUpdate({
                gradingMethod,
                passingScore: score,
                weightedComponents:
                    gradingMethod === "weighted" && components.length > 0 ? components : undefined,
            })
            toast.success("Grading configuration updated")
            setIsModalOpen(false)
        } catch {
            toast.error("Failed to update grading configuration")
        } finally {
            setIsPending(false)
        }
    }

    const totalWeight = components.reduce((sum, c) => sum + c.weight, 0)

    const getGradingMethodLabel = (method: string) => {
        return GRADING_METHODS.find((m) => m.value === method)?.label ?? method
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="py-4">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                                <ChartBarIcon className="size-5 text-primary" />
                            </div>
                            <div className="flex-1">
                                <Text className="text-muted-foreground text-sm">Grading Method</Text>
                                <Text className="mt-0.5 font-semibold">
                                    {getGradingMethodLabel(currentConfig.gradingMethod)}
                                </Text>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-success/10">
                                <AcademicCapIcon className="size-5 text-success" />
                            </div>
                            <div className="flex-1">
                                <Text className="text-muted-foreground text-sm">Passing Score</Text>
                                <Text className="mt-0.5 font-semibold">
                                    {currentConfig.passingScore}%
                                </Text>
                            </div>
                        </div>

                        {currentConfig.components && currentConfig.components.length > 0 && (
                            <>
                                <Separator />
                                <div>
                                    <Text className="mb-3 font-medium text-muted-foreground text-sm">
                                        Weighted Components
                                    </Text>
                                    <div className="space-y-2">
                                        {currentConfig.components.map((component, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                                            >
                                                <Text className="font-medium">{component.name}</Text>
                                                <Badge intent="secondary">{component.weight}%</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Button intent="secondary" onPress={() => setIsModalOpen(true)}>
                <PencilIcon className="size-4" data-slot="icon" />
                Edit Grading Configuration
            </Button>

            <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
                <ModalContent size="xl">
                    <ModalHeader>
                        <ModalTitle>Edit Grading Configuration</ModalTitle>
                        <ModalDescription>
                            Configure how grades are calculated for this course.
                        </ModalDescription>
                    </ModalHeader>
                    <ModalBody>
                        <div className="space-y-4">
                            <TextField isRequired>
                                <Label>Grading Method</Label>
                                <Select
                                    selectedKey={gradingMethod}
                                    onSelectionChange={(key) => {
                                        const newMethod = key as "numerical" | "competency" | "weighted"
                                        setGradingMethod(newMethod)
                                        if (newMethod !== "weighted") {
                                            setComponents([])
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        {GRADING_METHODS.find((m) => m.value === gradingMethod)?.label ??
                                            "Select grading method"}
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GRADING_METHODS.map((method) => (
                                            <SelectItem key={method.value} id={method.value}>
                                                {method.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </TextField>

                            <TextField isRequired>
                                <Label>Passing Score (%)</Label>
                                <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={passingScore}
                                    onChange={(e) => setPassingScore(e.target.value)}
                                />
                            </TextField>

                            {gradingMethod === "weighted" && (
                                <>
                                    <Separator />

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Text className="font-medium">Weighted Components</Text>
                                            <Button size="sm" intent="outline" onPress={handleAddComponent}>
                                                Add Component
                                            </Button>
                                        </div>

                                        {components.length > 0 && (
                                            <div className="space-y-2">
                                                {components.map((component, index) => (
                                                    <div key={index} className="flex gap-2">
                                                        <TextField className="flex-1">
                                                            <Input
                                                                value={component.name}
                                                                onChange={(e) =>
                                                                    handleComponentChange(index, "name", e.target.value)
                                                                }
                                                                placeholder="Component name"
                                                            />
                                                        </TextField>
                                                        <TextField className="w-24">
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={component.weight.toString()}
                                                                onChange={(e) =>
                                                                    handleComponentChange(index, "weight", e.target.value)
                                                                }
                                                                placeholder="Weight"
                                                            />
                                                        </TextField>
                                                        <Button
                                                            size="sm"
                                                            intent="danger"
                                                            onPress={() => handleRemoveComponent(index)}
                                                        >
                                                            Remove
                                                        </Button>
                                                    </div>
                                                ))}
                                                <Text
                                                    className={`text-sm ${Math.abs(totalWeight - 100) < 0.01
                                                        ? "text-success"
                                                        : "text-danger"
                                                        }`}
                                                >
                                                    Total Weight: {totalWeight.toFixed(1)}%
                                                    {Math.abs(totalWeight - 100) > 0.01 && " (must equal 100%)"}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <ModalClose>Cancel</ModalClose>
                        <Button intent="primary" onPress={handleSave} isPending={isPending}>
                            Save Configuration
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
