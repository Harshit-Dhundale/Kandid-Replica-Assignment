"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDebounce } from "@/hooks/use-debounce";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive" | "suspended";
  lastLoginAt: string;
  createdAt: string;
  loginCount: number;
  campaignsCount: number;
  leadsCount: number;
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    lastLoginAt: "2024-01-15T10:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    loginCount: 45,
    campaignsCount: 12,
    leadsCount: 234,
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    lastLoginAt: "2024-01-14T15:20:00Z",
    createdAt: "2024-01-05T00:00:00Z",
    loginCount: 23,
    campaignsCount: 8,
    leadsCount: 156,
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "moderator",
    status: "inactive",
    lastLoginAt: "2024-01-10T09:15:00Z",
    createdAt: "2024-01-03T00:00:00Z",
    loginCount: 12,
    campaignsCount: 5,
    leadsCount: 89,
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "user",
    status: "suspended",
    lastLoginAt: "2024-01-08T14:45:00Z",
    createdAt: "2024-01-07T00:00:00Z",
    loginCount: 8,
    campaignsCount: 3,
    leadsCount: 45,
  },
  {
    id: "5",
    name: "David Brown",
    email: "david@example.com",
    role: "user",
    status: "active",
    lastLoginAt: "2024-01-15T08:30:00Z",
    createdAt: "2024-01-12T00:00:00Z",
    loginCount: 15,
    campaignsCount: 6,
    leadsCount: 78,
  },
];

function getRoleColor(role: User["role"]) {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-800";
    case "moderator":
      return "bg-blue-100 text-blue-800";
    case "user":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusColor(status: User["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-yellow-100 text-yellow-800";
    case "suspended":
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

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState("name_asc");

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Mock API call
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedSearch, roleFilter, statusFilter, sortBy],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      let filteredUsers = [...mockUsers];

      // Search filter
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase();
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.name.toLowerCase().includes(search) ||
            user.email.toLowerCase().includes(search)
        );
      }

      // Role filter
      if (roleFilter !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.role === roleFilter);
      }

      // Status filter
      if (statusFilter !== "all") {
        filteredUsers = filteredUsers.filter((user) => user.status === statusFilter);
      }

      // Sort
      filteredUsers.sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "last_login_desc":
            return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
          case "created_desc":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          default:
            return 0;
        }
      });

      return filteredUsers;
    },
    staleTime: 30_000,
  });

  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter((u) => u.status === "active").length || 0;
  const adminUsers = users?.filter((u) => u.role === "admin").length || 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">Manage user accounts and permissions.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{adminUsers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name A-Z</SelectItem>
              <SelectItem value="name_desc">Name Z-A</SelectItem>
              <SelectItem value="last_login_desc">Last Login</SelectItem>
              <SelectItem value="created_desc">Created Date</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="flex-1 overflow-hidden">
        <div className="mx-6 mt-6 rounded-2xl bg-white border border-gray-200 shadow-lg">
          <div className="overflow-auto max-h-[70vh]">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr className="text-left">
                  <th className="px-6 py-4 font-medium text-muted-foreground">User</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Role</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Last Login</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Activity</th>
                  <th className="px-6 py-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
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
                        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-8 bg-muted rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : users?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users?.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-600 text-white text-sm">
                              {initials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(user.lastLoginAt), { addSuffix: true })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="space-y-1">
                          <div>{user.campaignsCount} campaigns</div>
                          <div>{user.leadsCount} leads</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

