"use client";

import { useQuery } from "@tanstack/react-query";
import { CampaignsList } from "@/components/dashboard/campaigns-list";
import { LinkedInAccounts } from "@/components/dashboard/linkedin-accounts";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to LinkBird! Manage your LinkedIn campaigns and leads.</p>
      </div>

      {/* Main content area with proper grid layout */}
      <div className="px-6 pb-6">
        {/* Compact metrics strip */}
        <div className="mb-6">
          <DashboardMetrics />
        </div>

        {/* Dashboard content grid */}
        <div className="dashboard-content">
          {/* Center column - Campaigns and LinkedIn Accounts */}
          <div className="left-column-content space-y-6 flex flex-col">
            <CampaignsList />
            <LinkedInAccounts />
          </div>

          {/* Right column - Recent Activity */}
          <div className="flex flex-col">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
