// app/(app)/campaigns/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CampaignStatusBadge } from "@/components/common/status-badge";
import { CampaignActions } from "@/components/campaigns/campaign-actions";
import {
  Search,
  Plus,
  Users,
  TrendingUp,
  UserPlus,
  Clock,
  XCircle,
  Link2,
  MessageSquare,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { useUIStore } from "@/stores/ui";

type CampaignRow = {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  createdAt: string;
  totalLeads: number;
  requestSent: number;
  requestAccepted: number;
  requestReplied: number;
};


export default function CampaignsPage() {
  const {
    campaignsFilters,
    setCampaignsFilters,
    setModal,
  } = useUIStore();

  const [statusFilter, setStatusFilter] = useState<string>(campaignsFilters.status);
  const [sortBy, setSortBy] = useState(campaignsFilters.sortBy);
  const [searchQuery, setSearchQuery] = useState(campaignsFilters.search);
  const q = useDebounce(searchQuery, 300);

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaigns", q, statusFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("sort", sortBy);

      const response = await fetch(`/api/campaigns?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch campaigns");
      return (await response.json()) as { items: CampaignRow[] };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const campaigns: CampaignRow[] = data?.items ?? [];

  // Client-side name filter (kept, in addition to server q, to mirror your current UX)
  const filteredCampaigns = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();
    if (!search) return campaigns;
    return campaigns.filter((c) => c.name.toLowerCase().includes(search));
  }, [campaigns, searchQuery]);

  // Summary cards
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const pausedCampaigns = campaigns.filter((c) => c.status === "paused").length;

  // Update global state when local state changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCampaignsFilters({ search: value });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCampaignsFilters({ status: value });
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setCampaignsFilters({ sortBy: value });
  };

  const handleCreateCampaign = () => {
    setModal("campaignCreate", true);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaigns</h1>
            <p className="text-muted-foreground">
              Manage your campaigns and track their performance.
            </p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleCreateCampaign}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Campaigns
                </p>
                <p className="text-2xl font-bold">{totalCampaigns}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active
                </p>
                <p className="text-2xl font-bold">{activeCampaigns}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Paused
                </p>
                <p className="text-2xl font-bold">{pausedCampaigns}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
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

          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_desc">Newest First</SelectItem>
              <SelectItem value="name_asc">Name A–Z</SelectItem>
              <SelectItem value="name_desc">Name Z–A</SelectItem>
              <SelectItem value="response_desc">Response Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-background border-b">
              <tr className="text-left">
                <th className="p-4 font-medium text-muted-foreground">
                  Campaign Name
                </th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">
                  Total Leads
                </th>
                <th className="p-4 font-medium text-muted-foreground">
                  Request Status
                </th>
                <th className="p-4 font-medium text-muted-foreground">
                  Connection Status
                </th>
                <th className="p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-4">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-10 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-4 w-28 bg-muted rounded animate-pulse" />
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    Error loading campaigns. Please try again.
                  </td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">
                    No campaigns found.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  // Derive counts similar to the reference UI
                  const sent = c.requestSent;
                  const pendingFromTotal = Math.max(c.totalLeads - sent, 0);
                  const pendingFromFlow = Math.max(sent - c.requestAccepted, 0);
                  const pending = Math.max(pendingFromTotal, pendingFromFlow);
                  const failed = 0; // not tracked — keep 0
                  const connected = c.requestAccepted;
                  const replied = c.requestReplied;

                  return (
                    <tr key={c.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {c.name}
                        </Link>
                      </td>
                      <td className="p-4">
                        <CampaignStatusBadge status={c.status} />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{c.totalLeads}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-4 text-sm">
                          <span className="inline-flex items-center gap-1 text-emerald-600">
                            <UserPlus className="h-4 w-4" />
                            {sent}
                          </span>
                          <span className="inline-flex items-center gap-1 text-amber-600">
                            <Clock className="h-4 w-4" />
                            {pending}
                          </span>
                          <span className="inline-flex items-center gap-1 text-rose-600">
                            <XCircle className="h-4 w-4" />
                            {failed}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-6 text-sm">
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Link2 className="h-4 w-4" />
                            {connected}
                          </span>
                          <span className="inline-flex items-center gap-1 text-purple-600">
                            <MessageSquare className="h-4 w-4" />
                            {replied}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <CampaignActions
                          campaign={{
                            id: c.id,
                            name: c.name,
                            status: c.status,
                            createdAt: c.createdAt,
                            // Pass through the new metrics in case your actions want them later
                            totalLeads: c.totalLeads,
                            requestSent: sent,
                            requestAccepted: connected,
                            requestReplied: replied,
                          } as any}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
