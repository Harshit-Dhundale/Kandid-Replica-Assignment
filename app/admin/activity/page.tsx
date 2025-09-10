"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, Filter, Download, RefreshCw, Eye, User, Activity, AlertCircle, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDebounce } from "@/hooks/use-debounce";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  description: string;
  type: "login" | "campaign" | "lead" | "system" | "error";
  status: "success" | "warning" | "error";
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
}

// Mock data for demonstration
const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    userId: "1",
    userName: "John Doe",
    userEmail: "john@example.com",
    action: "User Login",
    description: "Successfully logged in via email",
    type: "login",
    status: "success",
    timestamp: "2024-01-15T10:30:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  },
  {
    id: "2",
    userId: "2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    action: "Campaign Created",
    description: "Created new campaign 'Q1 Marketing Push'",
    type: "campaign",
    status: "success",
    timestamp: "2024-01-15T09:45:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    metadata: { campaignId: "camp_123", campaignName: "Q1 Marketing Push" },
  },
  {
    id: "3",
    userId: "1",
    userName: "John Doe",
    userEmail: "john@example.com",
    action: "Lead Status Updated",
    description: "Updated lead 'Sarah Wilson' status to 'Contacted'",
    type: "lead",
    status: "success",
    timestamp: "2024-01-15T09:20:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    metadata: { leadId: "lead_456", leadName: "Sarah Wilson", oldStatus: "pending", newStatus: "contacted" },
  },
  {
    id: "4",
    userId: "3",
    userName: "Mike Johnson",
    userEmail: "mike@example.com",
    action: "API Error",
    description: "Failed to fetch campaign data - Rate limit exceeded",
    type: "error",
    status: "error",
    timestamp: "2024-01-15T08:15:00Z",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    metadata: { errorCode: "RATE_LIMIT_EXCEEDED", endpoint: "/api/campaigns" },
  },
  {
    id: "5",
    userId: "2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    action: "Bulk Lead Import",
    description: "Imported 150 leads from CSV file",
    type: "lead",
    status: "success",
    timestamp: "2024-01-15T07:30:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    metadata: { importCount: 150, fileName: "leads_jan_2024.csv" },
  },
  {
    id: "6",
    userId: "1",
    userName: "John Doe",
    userEmail: "john@example.com",
    action: "System Maintenance",
    description: "Database backup completed successfully",
    type: "system",
    status: "success",
    timestamp: "2024-01-15T06:00:00Z",
    ipAddress: "192.168.1.100",
    userAgent: "System/Backup",
    metadata: { backupSize: "2.5GB", duration: "15 minutes" },
  },
  {
    id: "7",
    userId: "4",
    userName: "Sarah Wilson",
    userEmail: "sarah@example.com",
    action: "Account Suspended",
    description: "Account suspended due to policy violation",
    type: "system",
    status: "warning",
    timestamp: "2024-01-14T16:45:00Z",
    ipAddress: "192.168.1.103",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    metadata: { reason: "policy_violation", suspendedBy: "admin_1" },
  },
  {
    id: "8",
    userId: "2",
    userName: "Jane Smith",
    userEmail: "jane@example.com",
    action: "Campaign Paused",
    description: "Paused campaign 'Holiday Campaign 2024'",
    type: "campaign",
    status: "success",
    timestamp: "2024-01-14T14:20:00Z",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    metadata: { campaignId: "camp_789", campaignName: "Holiday Campaign 2024" },
  },
];

function getTypeIcon(type: ActivityLog["type"]) {
  switch (type) {
    case "login":
      return <User className="h-4 w-4" />;
    case "campaign":
      return <Activity className="h-4 w-4" />;
    case "lead":
      return <User className="h-4 w-4" />;
    case "system":
      return <RefreshCw className="h-4 w-4" />;
    case "error":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
}

function getStatusIcon(status: ActivityLog["status"]) {
  switch (status) {
    case "success":
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case "warning":
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case "error":
      return <XCircle className="h-4 w-4 text-red-600" />;
    default:
      return <Activity className="h-4 w-4 text-gray-600" />;
  }
}

function getStatusColor(status: ActivityLog["status"]) {
  switch (status) {
    case "success":
      return "bg-green-100 text-green-800";
    case "warning":
      return "bg-yellow-100 text-yellow-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getTypeColor(type: ActivityLog["type"]) {
  switch (type) {
    case "login":
      return "bg-blue-100 text-blue-800";
    case "campaign":
      return "bg-purple-100 text-purple-800";
    case "lead":
      return "bg-green-100 text-green-800";
    case "system":
      return "bg-gray-100 text-gray-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function AdminActivityPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("timestamp_desc");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Mock API call
  const { data: activityLogs, isLoading, refetch } = useQuery({
    queryKey: ["admin-activity", debouncedSearch, typeFilter, statusFilter, sortBy],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      let filteredLogs = [...mockActivityLogs];

      // Search filter
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase();
        filteredLogs = filteredLogs.filter(
          (log) =>
            log.userName.toLowerCase().includes(search) ||
            log.userEmail.toLowerCase().includes(search) ||
            log.action.toLowerCase().includes(search) ||
            log.description.toLowerCase().includes(search)
        );
      }

      // Type filter
      if (typeFilter !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.type === typeFilter);
      }

      // Status filter
      if (statusFilter !== "all") {
        filteredLogs = filteredLogs.filter((log) => log.status === statusFilter);
      }

      // Sort
      filteredLogs.sort((a, b) => {
        switch (sortBy) {
          case "timestamp_desc":
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          case "timestamp_asc":
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          case "user_asc":
            return a.userName.localeCompare(b.userName);
          case "action_asc":
            return a.action.localeCompare(b.action);
          default:
            return 0;
        }
      });

      return filteredLogs;
    },
    staleTime: 30_000,
  });

  const totalLogs = activityLogs?.length || 0;
  const successLogs = activityLogs?.filter((log) => log.status === "success").length || 0;
  const errorLogs = activityLogs?.filter((log) => log.status === "error").length || 0;
  const warningLogs = activityLogs?.filter((log) => log.status === "warning").length || 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground">Monitor system activity and user actions.</p>
          </div>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{successLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningLogs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{errorLogs}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activity logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="login">Login</SelectItem>
              <SelectItem value="campaign">Campaign</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="timestamp_desc">Newest First</SelectItem>
              <SelectItem value="timestamp_asc">Oldest First</SelectItem>
              <SelectItem value="user_asc">User A-Z</SelectItem>
              <SelectItem value="action_asc">Action A-Z</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Activity Logs */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-6 mt-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
          <div className="overflow-auto max-h-[70vh]">
            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
                        <div className="h-3 w-1/4 bg-muted rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activityLogs?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No activity logs found.
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {activityLogs?.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {initials(log.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {getTypeIcon(log.type)}
                              <span className="font-medium">{log.action}</span>
                            </div>
                            <Badge className={getTypeColor(log.type)}>
                              {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                            </Badge>
                            <Badge className={getStatusColor(log.status)}>
                              {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            {getStatusIcon(log.status)}
                            <span>{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span className="font-medium">{log.userName}</span>
                          <span>•</span>
                          <span>{log.userEmail}</span>
                          <span>•</span>
                          <span>{log.ipAddress}</span>
                        </div>
                        {log.metadata && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                            <pre className="whitespace-pre-wrap">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

