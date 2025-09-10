"use client";

import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/leads/columns";

interface CampaignLeadsProps {
  campaignId: string;
}

export function CampaignLeads({ campaignId }: CampaignLeadsProps) {
  if (!campaignId) {
    return (
      <div className="p-4 border border-red-200 bg-red-50 rounded">
        <p className="text-red-700">Error: No campaign ID provided</p>
      </div>
    );
  }
  
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useInfiniteQuery({
    queryKey: ["campaignLeads", campaignId],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams();
      if (pageParam) searchParams.set("cursor", pageParam);
      searchParams.set("limit", "20");

      const url = `/api/campaigns/${campaignId}/leads?${searchParams.toString()}`;
      
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("API Error:", errorData);
        throw new Error(errorData.error || `Failed to fetch leads: ${res.status}`);
      }
      
      const data = await res.json();
      return data;
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const leads = useMemo(() => data?.pages.flatMap((p: any) => p.leads) ?? [], [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-muted rounded"></div>
                <div className="h-6 w-20 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="text-red-500 mb-2">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">Failed to load leads</h3>
        <p className="text-muted-foreground mb-4">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <div className="text-muted-foreground mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">No leads found</h3>
        <p className="text-muted-foreground">
          This campaign doesn't have any leads yet. Add some leads to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Campaign Leads ({leads.length})</h3>
      </div>
      <DataTable columns={columns} data={leads} />
      
      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button 
            variant="outline" 
            onClick={handleLoadMore} 
            disabled={isFetchingNextPage}
            className="min-w-[120px]"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
}
