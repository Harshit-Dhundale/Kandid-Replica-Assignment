"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CampaignStatusBadge } from "@/components/common/status-badge";
import { SequenceEditor } from "@/components/campaigns/sequence-editor";
import { CampaignSettings } from "@/components/campaigns/campaign-settings";
import { CampaignLeads } from "@/components/campaigns/campaign-leads";
import { BarChart3, Users, Mail, MessageSquare, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { Campaign, CampaignStats } from "@/lib/types";


export default function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next.js 15: params is a Promise
  const { id: campaignId } = use(params);

  const { data: campaign, isLoading: campaignLoading } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${campaignId}`);
      if (!res.ok) throw new Error("Failed to fetch campaign");
      return (await res.json()) as Campaign;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["campaign-stats", campaignId],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${campaignId}/stats`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return (await res.json()) as CampaignStats;
    },
  });

  if (campaignLoading || !campaign) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Campaign Details</h1>
            <p className="text-muted-foreground">Manage and track your campaign performance</p>
          </div>
          <CampaignStatusBadge status={campaign.status} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="sequence" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Sequence
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="overview" className="p-6 space-y-6">
              {statsLoading ? (
                <div className="animate-pulse space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-24 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ) : stats ? (
                <>
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalLeads}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Request Sent</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.requestSent}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Request Accepted</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.requestAccepted}</div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Request Replied</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.requestReplied}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Progress Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Leads Contacted</span>
                            <span>{stats.metrics.contactedRate}%</span>
                          </div>
                          <Progress value={stats.metrics.contactedRate} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Acceptance Rate</span>
                            <span>{stats.metrics.acceptanceRate}%</span>
                          </div>
                          <Progress value={stats.metrics.acceptanceRate} className="h-2" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Reply Rate</span>
                            <span>{stats.metrics.replyRate}%</span>
                          </div>
                          <Progress value={stats.metrics.replyRate} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Campaign Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Start Date:{" "}
                            {campaign.startDate
                              ? format(new Date(campaign.startDate), "dd/MM/yyyy")
                              : "Not set"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Status: </span>
                          <CampaignStatusBadge status={campaign.status} />
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Conversion Rate: {stats.metrics.conversionRate}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : null}
            </TabsContent>

            <TabsContent value="leads" className="p-6">
              <CampaignLeads campaignId={campaignId} />
            </TabsContent>

            <TabsContent value="sequence" className="p-6">
              <SequenceEditor campaignId={campaignId} />
            </TabsContent>

            <TabsContent value="settings" className="p-6">
              <CampaignSettings campaignId={campaignId} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
