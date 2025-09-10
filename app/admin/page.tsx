"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Activity, AlertTriangle, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Mock data for admin dashboard
const mockStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalActivity: 15420,
  todayActivity: 234,
  systemHealth: "healthy",
  lastBackup: "2024-01-15T06:00:00Z",
  errorCount: 3,
  warningCount: 12,
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockStats;
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-muted rounded" />
            <div className="h-4 w-96 bg-muted rounded" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and administration tools.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers} active users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Activity</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalActivity.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.todayActivity} events today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize text-green-600">
                {stats?.systemHealth}
              </div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.errorCount}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.warningCount} warnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">User login successful</p>
                    <p className="text-xs text-muted-foreground">john@example.com - 2 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Campaign created</p>
                    <p className="text-xs text-muted-foreground">Q1 Marketing Push - 5 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Rate limit warning</p>
                    <p className="text-xs text-muted-foreground">API endpoint /campaigns - 10 minutes ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Database backup completed</p>
                    <p className="text-xs text-muted-foreground">2.5GB backup - 1 hour ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>Current system status and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                  <span className="text-sm font-medium">
                    {stats?.lastBackup ? new Date(stats.lastBackup).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Database Status</span>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">API Status</span>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Storage Usage</span>
                  <span className="text-sm font-medium">2.5GB / 10GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium">99.9%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

