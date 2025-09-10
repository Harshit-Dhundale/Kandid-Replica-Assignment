"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Edit, Play, Pause, Trash2, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import { useUIStore } from "@/stores/ui"

interface CampaignActionsProps {
  campaign: {
    id: string
    name: string
    status: "draft" | "active" | "paused" | "completed"
  }
}

export function CampaignActions({ campaign }: CampaignActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const queryClient = useQueryClient()
  const { setModal } = useUIStore()

  const toggleStatusMutation = useMutation({
    mutationFn: async (newStatus: "active" | "paused") => {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update campaign")
      }
      return response.json()
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      toast({ 
        title: "Campaign updated", 
        description: `Campaign ${newStatus === "active" ? "resumed" : "paused"} successfully` 
      })
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update campaign", 
        description: error.message,
        variant: "destructive" 
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete campaign")
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
      toast({ 
        title: "Campaign deleted", 
        description: `"${campaign.name}" has been deleted successfully` 
      })
      setShowDeleteDialog(false)
    },
    onError: (error) => {
      toast({ 
        title: "Failed to delete campaign", 
        description: error.message,
        variant: "destructive" 
      })
    },
  })

  const handleToggleStatus = () => {
    const newStatus = campaign.status === "active" ? "paused" : "active"
    toggleStatusMutation.mutate(newStatus)
  }

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  const handleOpenSettings = () => {
    setModal("campaignSettings", true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/campaigns/${campaign.id}`} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenSettings}>
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus} disabled={toggleStatusMutation.isPending}>
            {campaign.status === "active" ? (
              <>
                <Pause className="h-4 w-4" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Resume
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{campaign.name}"? This action cannot be undone and will also delete all
              associated leads and interactions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
