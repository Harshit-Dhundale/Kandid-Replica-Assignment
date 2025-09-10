"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, Filter, Send, Reply, Archive, Trash2, MoreHorizontal, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-debounce";

interface Message {
  id: string;
  leadName: string;
  leadEmail: string;
  leadRole: string;
  campaignName: string;
  subject: string;
  content: string;
  status: "sent" | "delivered" | "read" | "replied" | "failed";
  direction: "outbound" | "inbound";
  sentAt: string;
  readAt?: string;
  repliedAt?: string;
  threadId: string;
  isArchived: boolean;
}

// Mock data for demonstration
const mockMessages: Message[] = [
  {
    id: "1",
    leadName: "Sarah Wilson",
    leadEmail: "sarah@example.com",
    leadRole: "Marketing Director",
    campaignName: "Q1 Marketing Push",
    subject: "Re: Partnership Opportunity",
    content: "Hi Sarah, I hope this message finds you well. I wanted to follow up on our previous conversation about the partnership opportunity we discussed. I believe there's great potential for collaboration between our companies...",
    status: "replied",
    direction: "outbound",
    sentAt: "2024-01-15T10:30:00Z",
    readAt: "2024-01-15T10:35:00Z",
    repliedAt: "2024-01-15T14:20:00Z",
    threadId: "thread_1",
    isArchived: false,
  },
  {
    id: "2",
    leadName: "Mike Johnson",
    leadEmail: "mike@example.com",
    leadRole: "CEO",
    campaignName: "Tech Startup Outreach",
    subject: "Introduction - AI Solutions",
    content: "Hello Mike, I hope you're doing well. I wanted to reach out regarding the AI solutions we discussed. Our team has been working on some innovative approaches that could significantly benefit your startup...",
    status: "read",
    direction: "outbound",
    sentAt: "2024-01-14T15:20:00Z",
    readAt: "2024-01-14T16:45:00Z",
    threadId: "thread_2",
    isArchived: false,
  },
  {
    id: "3",
    leadName: "Emily Chen",
    leadEmail: "emily@example.com",
    leadRole: "CTO",
    campaignName: "Enterprise Solutions",
    subject: "Thank you for your interest",
    content: "Hi Emily, thank you for your interest in our enterprise solutions. I'm excited to share more details about how our platform can help streamline your operations and improve efficiency...",
    status: "delivered",
    direction: "outbound",
    sentAt: "2024-01-14T09:15:00Z",
    threadId: "thread_3",
    isArchived: false,
  },
  {
    id: "4",
    leadName: "David Brown",
    leadEmail: "david@example.com",
    leadRole: "VP Sales",
    campaignName: "Sales Enablement",
    subject: "Re: Sales Training Program",
    content: "Hi David, I wanted to follow up on our conversation about the sales training program. I've prepared a detailed proposal that I think will address all the key points we discussed...",
    status: "sent",
    direction: "outbound",
    sentAt: "2024-01-13T14:30:00Z",
    threadId: "thread_4",
    isArchived: false,
  },
  {
    id: "5",
    leadName: "Lisa Anderson",
    leadEmail: "lisa@example.com",
    leadRole: "Marketing Manager",
    campaignName: "Content Marketing",
    subject: "Partnership Proposal",
    content: "Hello Lisa, I hope this message finds you well. I wanted to discuss a potential partnership opportunity that I believe could be mutually beneficial for both our organizations...",
    status: "failed",
    direction: "outbound",
    sentAt: "2024-01-13T11:00:00Z",
    threadId: "thread_5",
    isArchived: true,
  },
  {
    id: "6",
    leadName: "John Smith",
    leadEmail: "john@example.com",
    leadRole: "Founder",
    campaignName: "Startup Accelerator",
    subject: "Thank you for connecting",
    content: "Hi John, thank you for connecting with me. I'm excited to learn more about your startup and see how we might be able to collaborate. I've been following your company's progress and I'm impressed with what you've built...",
    status: "replied",
    direction: "inbound",
    sentAt: "2024-01-12T16:45:00Z",
    readAt: "2024-01-12T17:00:00Z",
    repliedAt: "2024-01-12T18:30:00Z",
    threadId: "thread_6",
    isArchived: false,
  },
];

function getStatusColor(status: Message["status"]) {
  switch (status) {
    case "sent":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "read":
      return "bg-purple-100 text-purple-800";
    case "replied":
      return "bg-emerald-100 text-emerald-800";
    case "failed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getDirectionIcon(direction: Message["direction"]) {
  return direction === "outbound" ? <Send className="h-4 w-4" /> : <Reply className="h-4 w-4" />;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function MessagesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Mock API call
  const { data: messages, isLoading } = useQuery({
    queryKey: ["messages", debouncedSearch, statusFilter, directionFilter, showArchived],
    queryFn: async () => {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      let filteredMessages = [...mockMessages];

      // Search filter
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase();
        filteredMessages = filteredMessages.filter(
          (message) =>
            message.leadName.toLowerCase().includes(search) ||
            message.leadEmail.toLowerCase().includes(search) ||
            message.subject.toLowerCase().includes(search) ||
            message.content.toLowerCase().includes(search)
        );
      }

      // Status filter
      if (statusFilter !== "all") {
        filteredMessages = filteredMessages.filter((message) => message.status === statusFilter);
      }

      // Direction filter
      if (directionFilter !== "all") {
        filteredMessages = filteredMessages.filter((message) => message.direction === directionFilter);
      }

      // Archive filter
      if (!showArchived) {
        filteredMessages = filteredMessages.filter((message) => !message.isArchived);
      }

      // Sort by most recent
      filteredMessages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

      return filteredMessages;
    },
    staleTime: 30_000,
  });

  const totalMessages = messages?.length || 0;
  const unreadMessages = messages?.filter((m) => m.status === "delivered" || m.status === "sent").length || 0;
  const repliedMessages = messages?.filter((m) => m.status === "replied").length || 0;
  const failedMessages = messages?.filter((m) => m.status === "failed").length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
            <p className="text-muted-foreground">Manage your LinkedIn messages and conversations.</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Send className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{unreadMessages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Replied</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{repliedMessages}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedMessages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="read">Read</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={directionFilter} onValueChange={setDirectionFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Directions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Directions</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="inbound">Inbound</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
        </div>
      </div>

      {/* Messages List */}
      <div className="p-6">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-lg">
          <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
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
            ) : messages?.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No messages found.
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {messages?.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedMessage(message)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-600 text-white text-sm">
                          {initials(message.leadName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-sm truncate">{message.leadName}</h4>
                            <Badge className={getStatusColor(message.status)}>
                              {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                            </Badge>
                            <div className="flex items-center text-muted-foreground">
                              {getDirectionIcon(message.direction)}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.subject}</p>
                        <p className="text-xs text-gray-500 line-clamp-2">{message.content}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-muted-foreground">{message.leadRole}</span>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">{message.campaignName}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Reply className="mr-2 h-4 w-4" />
                            Reply
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Archive className="mr-2 h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Message Details</h3>
              <Button variant="ghost" onClick={() => setSelectedMessage(null)}>
                ×
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {initials(selectedMessage.leadName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedMessage.leadName}</h4>
                  <p className="text-sm text-muted-foreground">{selectedMessage.leadEmail}</p>
                  <p className="text-xs text-muted-foreground">{selectedMessage.leadRole}</p>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">{selectedMessage.subject}</h5>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedMessage.content}
                </p>
              </div>
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <span>Sent: {formatDistanceToNow(new Date(selectedMessage.sentAt), { addSuffix: true })}</span>
                {selectedMessage.readAt && (
                  <span>Read: {formatDistanceToNow(new Date(selectedMessage.readAt), { addSuffix: true })}</span>
                )}
                {selectedMessage.repliedAt && (
                  <span>Replied: {formatDistanceToNow(new Date(selectedMessage.repliedAt), { addSuffix: true })}</span>
                )}
              </div>
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
