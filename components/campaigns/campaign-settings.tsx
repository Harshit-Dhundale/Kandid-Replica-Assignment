"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CampaignSettingsProps {
  campaignId: string
}

interface CampaignSettings {
  name: string
  status: "draft" | "active" | "paused" | "completed"
  requestWithoutPersonalization: boolean
  autopilot: boolean
  associatedAccounts: Array<{
    accountId: string
    displayName: string
    email: string
    autopilot: boolean
  }>
  availableAccounts: Array<{
    id: string
    displayName: string
    email: string
  }>
}

export function CampaignSettings({ campaignId }: CampaignSettingsProps) {
  const [settings, setSettings] = useState<CampaignSettings>({
    name: "",
    status: "draft",
    requestWithoutPersonalization: false,
    autopilot: false,
    associatedAccounts: [],
    availableAccounts: [],
  })
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([])

  const queryClient = useQueryClient()
  const router = useRouter()

  const { isLoading } = useQuery({
    queryKey: ["campaign-settings", campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}/settings`)
      if (!response.ok) throw new Error("Failed to fetch settings")
      const data = await response.json()
      setSettings(data)
      setSelectedAccountIds(data.associatedAccounts.map((acc: any) => acc.accountId))
      return data
    },
  })

  const saveSettingsMutation = useMutation({
    mutationFn: async (data: Partial<CampaignSettings>) => {
      const response = await fetch(`/api/campaigns/${campaignId}/settings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          accountIds: selectedAccountIds,
        }),
      })
      if (!response.ok) throw new Error("Failed to save settings")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaign-settings", campaignId] })
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      toast({ title: "Settings saved successfully" })
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" })
    },
  })

  const deleteCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete campaign")
      return response.json()
    },
    onSuccess: () => {
      toast({ title: "Campaign deleted successfully" })
      router.push("/campaigns")
    },
    onError: () => {
      toast({ title: "Failed to delete campaign", variant: "destructive" })
    },
  })

  const handleSaveAllChanges = () => {
    saveSettingsMutation.mutate({
      name: settings.name,
      status: settings.status,
      requestWithoutPersonalization: settings.requestWithoutPersonalization,
      autopilot: settings.autopilot,
    })
  }

  const handleDeleteCampaign = () => {
    deleteCampaignMutation.mutate()
  }

  const updateSetting = <K extends keyof CampaignSettings>(key: K, value: CampaignSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Campaign Settings</h2>
        <Button
          onClick={handleSaveAllChanges}
          disabled={saveSettingsMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {saveSettingsMutation.isPending ? "Saving..." : "Save All Changes"}
        </Button>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaign-name">Campaign Name</Label>
            <Input
              id="campaign-name"
              value={settings.name}
              onChange={(e) => updateSetting("name", e.target.value)}
              placeholder="Enter campaign name"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Campaign Status</Label>
              <p className="text-sm text-muted-foreground">Enable or disable this campaign</p>
            </div>
            <Switch
              checked={settings.status === "active"}
              onCheckedChange={(checked) => updateSetting("status", checked ? "active" : "paused")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Request without personalization</Label>
              <p className="text-sm text-muted-foreground">Send requests without personalizing the message</p>
            </div>
            <Switch
              checked={settings.requestWithoutPersonalization}
              onCheckedChange={(checked) => updateSetting("requestWithoutPersonalization", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* AutoPilot Mode */}
      <Card>
        <CardHeader>
          <CardTitle>AutoPilot Mode</CardTitle>
          <p className="text-sm text-muted-foreground">
            Let the system automatically manage LinkedIn account assignments
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Enable AutoPilot</Label>
            <Switch checked={settings.autopilot} onCheckedChange={(checked) => updateSetting("autopilot", checked)} />
          </div>

          <div className="space-y-2">
            <Label>Select Accounts</Label>
            <Select
              value={selectedAccountIds.length > 0 ? "selected" : "none"}
              onValueChange={(value) => {
                if (value === "none") {
                  setSelectedAccountIds([])
                }
              }}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    selectedAccountIds.length > 0 ? `${selectedAccountIds.length} account selected` : "Select accounts"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No accounts</SelectItem>
                {settings.availableAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedAccountIds.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Accounts:</Label>
              <div className="space-y-2">
                {settings.availableAccounts
                  .filter((acc) => selectedAccountIds.includes(acc.id))
                  .map((account) => (
                    <div key={account.id} className="flex items-center gap-3 p-2 border rounded">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {account.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{account.displayName}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <p className="text-sm text-muted-foreground">
            Permanently delete this campaign and all associated data. This action cannot be undone.
          </p>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Campaign</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this campaign? This action cannot be undone and will permanently
                  delete all leads, interactions, and templates associated with this campaign.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCampaign}
                  disabled={deleteCampaignMutation.isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteCampaignMutation.isPending ? "Deleting..." : "Delete Campaign"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
