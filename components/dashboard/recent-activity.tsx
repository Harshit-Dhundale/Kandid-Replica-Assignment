"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LeadStatusBadge } from "@/components/common/status-badge";
import { ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMatchHeight } from "@/hooks/use-match-height";

interface RecentActivity {
  id: string;
  leadName: string;
  leadRole: string;
  campaignName: string;
  status: "pending" | "contacted" | "responded" | "converted" | "do_not_contact";
  sentAgo?: string;
  avatar?: string;
}

// API response interface (matches actual API structure)
interface LeadFromAPI {
  id: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  company: string | null;
  jobTitle: string | null;
  status: "pending" | "contacted" | "responded" | "converted" | "do_not_contact";
  lastContactAt: string | null;
  createdAt: string;
  campaignName: string;
}

// Helper function to generate avatar initials safely
function getInitials(name: string | undefined | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  return parts.map(part => part[0]?.toUpperCase() || '').join('').slice(0, 2) || 'U';
}

export function RecentActivity() {
  const [statusFilter, setStatusFilter] = useState<string>("recent");

  // Use the hook to match the height of the left column content
  const { height } = useMatchHeight({
    targetSelector: '.recent-activity-card',
    sourceSelector: '.left-column-content',
    enabled: true
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["recent-activity"],
    queryFn: async () => {
      const response = await fetch("/api/leads?sort=recent&limit=8");
      if (!response.ok) throw new Error("Failed to fetch recent activity");
      const apiData = (await response.json()) as { items: LeadFromAPI[] };
      
      // Transform API data to component interface
      const transformedActivities: RecentActivity[] = apiData.items.map((lead) => ({
        id: lead.id,
        leadName: lead.fullName || [lead.firstName, lead.lastName].filter(Boolean).join(' ') || lead.email || 'Unknown',
        leadRole: lead.jobTitle || 'No role specified',
        campaignName: lead.campaignName,
        status: lead.status,
        sentAgo: lead.status === "contacted" && lead.lastContactAt 
          ? (() => {
              const now = new Date();
              const contactDate = new Date(lead.lastContactAt);
              const diffMs = now.getTime() - contactDate.getTime();
              const diffMins = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              
              if (diffMins < 60) return `${diffMins} mins ago`;
              if (diffHours < 24) return `${diffHours} hours ago`;
              return `${diffDays} days ago`;
            })()
          : undefined,
      }));
      
      return { items: transformedActivities };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const activities = data?.items ?? [];

  // Mock data for now since we need to transform leads data
  const mockActivities: RecentActivity[] = [
    {
      id: "1",
      leadName: "Om Satyarthy",
      leadRole: "Regional Head",
      campaignName: "Gynoveda",
      status: "pending",
    },
    {
      id: "2",
      leadName: "Dr. Bhuvaneshwari.",
      leadRole: "Fertility & Women's Health + A...",
      campaignName: "Gynoveda", 
      status: "contacted",
      sentAgo: "7 mins ago",
    },
    {
      id: "3",
      leadName: "Surdeep Singh",
      leadRole: "Manager",
      campaignName: "Gynoveda",
      status: "contacted", 
      sentAgo: "7 mins ago",
    },
    {
      id: "4",
      leadName: "Dilbag Singh",
      leadRole: "Director",
      campaignName: "Gynoveda",
      status: "contacted",
      sentAgo: "7 mins ago", 
    },
    {
      id: "5",
      leadName: "Vanshy Jain",
      leadRole: "CEO",
      campaignName: "Gynoveda",
      status: "contacted",
      sentAgo: "7 mins ago",
    },
    {
      id: "6", 
      leadName: "Sunil Pal",
      leadRole: "Founder",
      campaignName: "Digi Sidekick",
      status: "pending",
    },
    {
      id: "7",
      leadName: "Utkarsh K.",
      leadRole: "CTO", 
      campaignName: "The skin story",
      status: "do_not_contact",
    },
    {
      id: "8",
      leadName: "Shreya Ramakrishna",
      leadRole: "Marketing Head",
      campaignName: "Pokonut",
      status: "responded",
      sentAgo: "10 mins ago",
    },
    {
      id: "9",
      leadName: "Akshay Maheshwari",
      leadRole: "Founder",
      campaignName: "HealthyHey 2",
      status: "contacted",
      sentAgo: "13 days ago",
    },
    {
      id: "10",
      leadName: "Akshay Verma",
      leadRole: "VP - Sales",
      campaignName: "Just Herbs",
      status: "converted",
    },
    {
      id: "11",
      leadName: "Deepak Chopra",
      leadRole: "Regional Head",
      campaignName: "Digi Sidekick",
      status: "contacted",
      sentAgo: "11 days ago",
    },
    {
      id: "12",
      leadName: "Karan Mehta",
      leadRole: "Deputy Manager",
      campaignName: "Juicy chemistry",
      status: "responded",
      sentAgo: "9 days ago",
    },
    {
      id: "13",
      leadName: "Shreya Maheshwari",
      leadRole: "Brand Manager",
      campaignName: "HempStreet",
      status: "converted",
    },
    {
      id: "14",
      leadName: "Rohit Mehta",
      leadRole: "Marketing Head",
      campaignName: "Honeyveda",
      status: "contacted",
      sentAgo: "9 days ago",
    },
    {
      id: "15",
      leadName: "Deepak Kumar",
      leadRole: "CTO",
      campaignName: "Reaquil",
      status: "responded",
      sentAgo: "3 days ago",
    },
    {
      id: "16",
      leadName: "Suresh Chand",
      leadRole: "Founder",
      campaignName: "HealthyHey 2",
      status: "contacted",
      sentAgo: "10 days ago",
    },
  ];

  // Filter activities based on selected status
  const filteredActivities = useMemo(() => {
    const dataToFilter = activities.length > 0 ? activities : mockActivities;
    
    if (statusFilter === "recent") {
      return dataToFilter;
    }
    
    return dataToFilter.filter(activity => activity.status === statusFilter);
  }, [activities, statusFilter]);

  const displayActivities = filteredActivities;

  return (
    <div className="dashboard-card recent-activity-card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="font-semibold text-base">Recent Activity</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue placeholder="Most Recent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Most Recent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="responded">Responded</SelectItem>
            <SelectItem value="converted">Converted</SelectItem>
            <SelectItem value="do_not_contact">Do Not Contact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="activity-list flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 relative">
        <div className="space-y-3 pr-2">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="activity-row flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-blue-600 text-white text-xs">
                  {getInitials(activity.leadName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {activity.leadName || 'Unknown Lead'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {activity.leadRole || 'No role specified'}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {activity.campaignName || 'No campaign'}
                </div>
              </div>

              <div className="flex-shrink-0">
                <LeadStatusBadge
                  status={activity.status}
                  sentAgo={activity.sentAgo}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Scroll indicator */}
        {displayActivities.length > 6 && (
          <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
    </div>
  );
}
