"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface MessageTemplates {
  requestMessage: string
  connectionMessage: string
  followup1: string
  followup1DelayDays: number
  followup2: string
  followup2DelayDays: number
}

interface SequenceEditorProps {
  campaignId: string
}

const availableFields = [
  { key: "{{fullName}}", label: "{{fullName}} - Full Name" },
  { key: "{{firstName}}", label: "{{firstName}} - First Name" },
  { key: "{{lastName}}", label: "{{lastName}} - Last Name" },
  { key: "{{jobTitle}}", label: "{{jobTitle}} - Job Title" },
]

const sampleLead = {
  fullName: "John Smith",
  firstName: "John",
  lastName: "Smith",
  jobTitle: "Marketing Manager",
}

function renderTemplate(template: string, lead: typeof sampleLead): string {
  return template
    .replace(/\{\{fullName\}\}/g, lead.fullName)
    .replace(/\{\{firstName\}\}/g, lead.firstName)
    .replace(/\{\{lastName\}\}/g, lead.lastName)
    .replace(/\{\{jobTitle\}\}/g, lead.jobTitle)
}

export function SequenceEditor({ campaignId }: SequenceEditorProps) {
  const [templates, setTemplates] = useState<MessageTemplates>({
    requestMessage: "",
    connectionMessage: "",
    followup1: "",
    followup1DelayDays: 1,
    followup2: "",
    followup2DelayDays: 1,
  })

  const queryClient = useQueryClient()

  const { isLoading } = useQuery({
    queryKey: ["campaign-templates", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/templates`)
      if (!response.ok) throw new Error("Failed to fetch templates")
      const data = await response.json()
      setTemplates(data)
      return data
    },
  })

  const saveMutation = useMutation({
    mutationFn: async (data: MessageTemplates) => {
      const response = await fetch(`/api/campaigns/${campaignId}/templates`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to save templates")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-templates", campaignId] })
      toast({ title: "Templates saved successfully" })
    },
    onError: () => {
      toast({ title: "Failed to save templates", variant: "destructive" })
    },
  })

  const handleSave = () => {
    saveMutation.mutate(templates)
  }

  const updateTemplate = (field: keyof MessageTemplates, value: string | number) => {
    setTemplates((prev) => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-6 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Message Sequence</h2>
        <Button onClick={handleSave} disabled={saveMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
          {saveMutation.isPending ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Request Message */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Request Message</CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Request Message Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {renderTemplate(templates.requestMessage, sampleLead)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Preview shown with sample data: {sampleLead.fullName}, {sampleLead.jobTitle}
                  </p>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium mb-2">Available fields:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {availableFields.map((field) => (
                  <div key={field.key}>{field.label}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Message Template</p>
              <p className="text-xs text-muted-foreground mb-2">
                Design your message template using the available fields
              </p>
              <div className="relative">
                <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-background px-2 py-1 rounded border">
                  Use {"{field_name}"} to insert mapped fields from your Data.
                </div>
                <Textarea
                  value={templates.requestMessage}
                  onChange={(e) => updateTemplate("requestMessage", e.target.value)}
                  placeholder="Enter your request message here..."
                  className="min-h-[120px] pt-8"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Message */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Connection Message</CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Connection Message Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {renderTemplate(templates.connectionMessage, sampleLead)}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Edit your connection message here.</p>
          <Textarea
            value={templates.connectionMessage}
            onChange={(e) => updateTemplate("connectionMessage", e.target.value)}
            placeholder="Enter your connection message here..."
            className="min-h-[100px]"
          />
        </CardContent>
      </Card>

      {/* First Follow-up Message */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">First Follow-up Message</CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>First Follow-up Message Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{renderTemplate(templates.followup1, sampleLead)}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Edit your first follow-up message here.</p>
          <Textarea
            value={templates.followup1}
            onChange={(e) => updateTemplate("followup1", e.target.value)}
            placeholder="Enter your first follow-up message here..."
            className="min-h-[100px]"
          />
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm">Send</span>
            <Select
              value={templates.followup1DelayDays.toString()}
              onValueChange={(value) => updateTemplate("followup1DelayDays", Number.parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm">day After Welcome Message</span>
          </div>
        </CardContent>
      </Card>

      {/* Second Follow-up Message */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Second Follow-up Message</CardTitle>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Preview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Second Follow-up Message Preview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{renderTemplate(templates.followup2, sampleLead)}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Edit your second follow-up message here.</p>
          <Textarea
            value={templates.followup2}
            onChange={(e) => updateTemplate("followup2", e.target.value)}
            placeholder="Enter your second follow-up message here..."
            className="min-h-[100px]"
          />
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm">Send</span>
            <Select
              value={templates.followup2DelayDays.toString()}
              onValueChange={(value) => updateTemplate("followup2DelayDays", Number.parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm">day After First Follow-up</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
