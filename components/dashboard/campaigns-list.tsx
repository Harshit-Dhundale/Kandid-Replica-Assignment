"use client";

import { useState, useMemo } from "react";
import { CampaignStatusBadge } from "@/components/common/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  createdAt: string;
  totalLeads: number;
  requestSent: number;
  requestAccepted: number;
  requestReplied: number;
}

export function CampaignsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Mock data matching the reference image exactly
  const mockCampaigns: Campaign[] = [
    {
      id: "1",
      name: "Just Herbs",
      status: "active",
      createdAt: new Date().toISOString(),
      totalLeads: 25,
      requestSent: 20,
      requestAccepted: 15,
      requestReplied: 8,
    },
    {
      id: "2",
      name: "Juicy chemistry",
      status: "active",
      createdAt: new Date().toISOString(),
      totalLeads: 30,
      requestSent: 25,
      requestAccepted: 18,
      requestReplied: 12,
    },
    {
      id: "3",
      name: "Hyugalife 2",
      status: "paused",
      createdAt: new Date().toISOString(),
      totalLeads: 20,
      requestSent: 18,
      requestAccepted: 12,
      requestReplied: 6,
    },
    {
      id: "4",
      name: "Honeyveda",
      status: "active",
      createdAt: new Date().toISOString(),
      totalLeads: 35,
      requestSent: 30,
      requestAccepted: 22,
      requestReplied: 15,
    },
    {
      id: "5",
      name: "HempStreet",
      status: "draft",
      createdAt: new Date().toISOString(),
      totalLeads: 28,
      requestSent: 24,
      requestAccepted: 16,
      requestReplied: 9,
    },
    {
      id: "6",
      name: "HealthyHey 2",
      status: "completed",
      createdAt: new Date().toISOString(),
      totalLeads: 22,
      requestSent: 19,
      requestAccepted: 14,
      requestReplied: 7,
    },
  ];

  // Filter campaigns based on selected status
  const filteredCampaigns = useMemo(() => {
    if (statusFilter === "all") {
      return mockCampaigns;
    }
    return mockCampaigns.filter(campaign => campaign.status === statusFilter);
  }, [statusFilter]);

  const campaigns = filteredCampaigns;

  return (
    <div className="dashboard-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-base">Campaigns</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 h-8 text-xs">
            <SelectValue placeholder="All Campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="campaign-row flex items-center justify-between cursor-pointer"
          >
            <div className="text-sm font-medium text-gray-900 truncate">
              {campaign.name}
            </div>
            <CampaignStatusBadge status={campaign.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
