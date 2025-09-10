"use client";

import { useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { formatDistanceToNowStrict } from "date-fns";
import { Search, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadStatusBadge } from "@/components/common/status-badge";
import { LeadSheet } from "@/components/leads/lead-sheet";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";

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
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "NA";
}

function stepFromStatus(status: Lead["status"]) {
  // How many of the 4 slim bars are filled
  switch (status) {
    case "pending":
      return 0;
    case "contacted":
      return 1;
    case "responded":
      return 3;
    case "converted":
      return 4;
    case "do_not_contact":
      return 0;
    default:
      return 0;
  }
}

function ActivitySpark({ step }: { step: number }) {
  const activity = step || 0;
  
  const getBarColor = (index: number, activity: number) => {
    if (index >= activity) return "bg-gray-300";
    
    if (activity === 1) return "bg-yellow-500";
    if (activity === 2) return "bg-blue-500";
    if (activity === 3) return "bg-purple-500";
    if (activity === 4) return "bg-emerald-500";
    
    return "bg-gray-300";
  };
  
  return (
    <div className="flex gap-1 items-center">
      {[0,1,2,3].map(i => (
        <div key={i} className={`w-1.5 h-5 rounded ${getBarColor(i, activity)}`} />
      ))}
    </div>
  );
}

export default function LeadsPage() {
  const {
    leadsFilters,
    setLeadsFilters,
    selectedLeadId,
    setSelectedLeadId,
  } = useUIStore();

  const [searchQuery, setSearchQuery] = useState(leadsFilters.search);
  const [statusFilter, setStatusFilter] = useState<string>(leadsFilters.status);
  const [sortBy, setSortBy] = useState(leadsFilters.sortBy);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
    queryKey: ["leads", debouncedSearch, statusFilter, sortBy],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (pageParam) params.set("cursor", pageParam);
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.set("sort", sortBy);

      const response = await fetch(`/api/leads?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to fetch leads");
      return response.json();
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const leads: Lead[] = useMemo(() => data?.pages.flatMap((p: any) => p.items) ?? [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  // Update global state when local state changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setLeadsFilters({ search: value });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setLeadsFilters({ status: value });
  };

  const handleSortByChange = (value: string) => {
    setSortBy(value);
    setLeadsFilters({ sortBy: value });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground">Manage and track your LinkedIn leads across all campaigns.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={handleSortByChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="name_asc">Name A-Z</SelectItem>
              <SelectItem value="name_desc">Name Z-A</SelectItem>
              <SelectItem value="last_contact_desc">Last Contact</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-6 mt-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
          {/* top padding / optional toolbar */}
          <div className="px-6 py-4 border-b border-gray-200">
            {/* you can keep any filter controls / header here */}
          </div>

          {/* scroll wrapper for table */}
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr className="text-left">
                  <th className="px-6 py-4 font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      Name
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      Campaign Name
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Activity</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">
                    <div className="flex items-center gap-2">
                      Status
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      Error loading leads. Please try again.
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                      No leads found.
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => {
                    const name = lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email;
                    const subtitle = [lead.jobTitle, lead.company].filter(Boolean).join(" • ");
                    const sentAgo =
                      lead.status === "contacted" && lead.lastContactAt
                        ? formatDistanceToNowStrict(new Date(lead.lastContactAt), { addSuffix: true })
                        : undefined;

                    return (
                      <tr
                        key={lead.id}
                        className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-blue-600 text-white text-sm">
                                {initials(name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{name}</div>
                              <div className="text-sm text-muted-foreground truncate">{subtitle}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm">{lead.campaignName}</td>

                        <td className="px-6 py-4">
                          <ActivitySpark step={stepFromStatus(lead.status)} />
                        </td>

                        <td className="px-6 py-4">
                          <LeadStatusBadge status={lead.status} sentAgo={sentAgo} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Load More */}
            {hasNextPage && (
              <div className="px-6 py-4 text-center border-t border-gray-200 bg-gray-50">
                <Button variant="outline" onClick={handleLoadMore} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lead Sheet */}
      <LeadSheet leadId={selectedLeadId} open={!!selectedLeadId} onClose={() => setSelectedLeadId(null)} />
    </div>
  );
}
