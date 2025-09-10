"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNowStrict } from "date-fns";
import { X, ChevronDown, ChevronUp, Building2, Mail, ExternalLink, Trash2 } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LeadStatusBadge } from "@/components/common/status-badge";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface LeadSheetProps {
  leadId: string | null;
  open: boolean;
  onClose: () => void;
}

interface Lead {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  status: "pending" | "contacted" | "responded" | "converted" | "do_not_contact";
  lastContactAt: string | null;
  campaignName: string;
  interactions: Array<{
    id: number;
    type:
      | "invitation_request"
      | "connection_status"
      | "acceptance_msg"
      | "followup_1"
      | "followup_2"
      | "replied"
      | "note";
    message: string;
    createdAt: string;
  }>;
}

const interactionLabels: Record<Lead["interactions"][number]["type"], string> = {
  invitation_request: "Invitation Request",
  connection_status: "Connection Status",
  acceptance_msg: "Connection Acceptance Message",
  followup_1: "Follow-up 1",
  followup_2: "Follow-up 2",
  replied: "Replied",
  note: "Note",
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "NA";
}

export function LeadSheet({ leadId, open, onClose }: LeadSheetProps) {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const queryClient = useQueryClient();

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId) return null;
      const response = await fetch(`/api/leads/${leadId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch lead");
      return (await response.json()) as Lead;
    },
    enabled: !!leadId && open,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      if (!leadId) throw new Error("No lead ID");
      const response = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast({ title: "Status updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  if (!open || !leadId) return null;

  const name =
    lead?.fullName ||
    [lead?.firstName, lead?.lastName].filter(Boolean).join(" ") ||
    lead?.email ||
    "Lead";

  const sentAgo =
    lead?.status === "contacted" && lead.lastContactAt
      ? formatDistanceToNowStrict(new Date(lead.lastContactAt), { addSuffix: true })
      : undefined;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[420px] sm:w-[520px] p-0 h-full flex flex-col" showClose={false}>
        {/* Header fixed at top */}
        <div className="shrink-0 p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle>Lead Profile</SheetTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {isLoading || !lead ? (
          <div className="flex-1 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-16 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        ) : (
          <>
            {/* Scrollable timeline section */}
            <div className="flex-1 overflow-y-auto">
              {/* Lead Header Card */}
              <div className="p-6 border-b">
                <div className="rounded-lg border bg-card shadow-sm p-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <Avatar className="h-14 w-14">
                      <AvatarFallback className="bg-blue-600 text-white">
                        {initials(name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg truncate">{name}</h3>
                        {/* Optional actions */}
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Open profile">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground" aria-label="Delete lead">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lead.jobTitle} {lead.company ? `• ${lead.company}` : ""}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {lead.company && (
                          <Badge className="rounded-full font-normal bg-secondary text-secondary-foreground border-0">
                            <span className="inline-flex items-center gap-1"><Building2 className="h-3 w-3" />{lead.company}</span>
                          </Badge>
                        )}
                        <LeadStatusBadge status={lead.status} sentAgo={sentAgo} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Profile Info */}
              <div className="p-6 border-b">
                <div className="border rounded-md">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-3 py-2 text-left"
                    aria-expanded={showAdditionalInfo}
                    onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
                  >
                    <span className="font-medium">Additional Profile Info</span>
                    {showAdditionalInfo ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                  {showAdditionalInfo && (
                    <div className="px-3 pb-3 pt-0 space-y-2 text-sm">
                      {lead.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{lead.email}</span>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">No additional info</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6">
                <div className="relative pl-8">
                  {/* Vertical line */}
                  <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
                  {(
                    [
                      "invitation_request",
                      "connection_status",
                      "acceptance_msg",
                      "followup_1",
                      "followup_2",
                      "replied",
                    ] as Lead["interactions"][number]["type"][]
                  ).map((typeKey) => {
                    const interaction = lead.interactions.find((i) => i.type === typeKey);
                    const done = !!interaction;
                    return (
                      <div key={typeKey} className="relative mb-6">
                        {/* Marker */}
                        <div
                          className={
                            "absolute left-2 top-1 w-3 h-3 rounded-full border " +
                            (done ? "bg-emerald-600 border-emerald-600" : "bg-background border-border")
                          }
                          aria-hidden
                        />
                        <div className="ml-6">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm">{interactionLabels[typeKey]}</h4>
                            {interaction?.createdAt && (
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(interaction.createdAt), "MMM d, h:mm a")}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {interaction?.message || (typeKey === "invitation_request" ? "Message: Hi, I'm building consultative..." : "")}
                          </p>
                          {interaction?.message && (
                            <Button variant="link" className="p-0 h-auto text-xs text-blue-600">See More</Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer fixed at bottom */}
            <div className="shrink-0 border-t bg-muted/50 px-6 py-4">
              <div className="flex gap-3">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">Contact</Button>
                <Select value={lead.status} onValueChange={(value) => updateStatusMutation.mutate(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Update Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
