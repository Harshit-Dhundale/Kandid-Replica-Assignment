"use client";

import { useQuery } from "@tanstack/react-query";

interface DashboardMetrics {
  totalCampaigns: number;
  activeLeads: number;
  responseRate: number;
  connections: number;
}

export function DashboardMetrics() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // For now, return mock data. In a real app, this would aggregate from multiple APIs
      return {
        totalCampaigns: 3,
        activeLeads: 59,
        responseRate: 12.5,
        connections: 24,
      } as DashboardMetrics;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const metrics = data ?? {
    totalCampaigns: 3,
    activeLeads: 59,
    responseRate: 12.5,
    connections: 24,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="dashboard-card metric-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Campaigns</p>
            <p className="text-xl font-bold mt-1">{metrics.totalCampaigns}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-card metric-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Leads</p>
            <p className="text-xl font-bold mt-1">{metrics.activeLeads}</p>
          </div>
        </div>
      </div>
      <div className="dashboard-card metric-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Response Rate</p>
            <p className="text-xl font-bold mt-1">{metrics.responseRate}%</p>
          </div>
        </div>
      </div>
      <div className="dashboard-card metric-card">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <svg className="h-4 w-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Connections</p>
            <p className="text-xl font-bold mt-1">{metrics.connections}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
