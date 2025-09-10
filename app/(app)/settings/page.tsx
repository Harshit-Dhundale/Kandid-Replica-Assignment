"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Save, CreditCard, Bell, Shield, User, Upload, Download, Key, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role: string;
  timezone: string;
  language: string;
  createdAt: string;
}

interface BillingInfo {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "past_due";
  nextBillingDate: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  usage: {
    campaigns: number;
    leads: number;
    messages: number;
    apiCalls: number;
  };
  limits: {
    campaigns: number;
    leads: number;
    messages: number;
    apiCalls: number;
  };
}

// Mock data
const mockProfile: UserProfile = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  company: "Acme Corp",
  role: "Marketing Manager",
  timezone: "America/New_York",
  language: "en",
  createdAt: "2024-01-01T00:00:00Z",
};

const mockBilling: BillingInfo = {
  plan: "pro",
  status: "active",
  nextBillingDate: "2024-02-15T00:00:00Z",
  amount: 29.99,
  currency: "USD",
  paymentMethod: "**** **** **** 1234",
  usage: {
    campaigns: 8,
    leads: 1250,
    messages: 450,
    apiCalls: 12500,
  },
  limits: {
    campaigns: 50,
    leads: 10000,
    messages: 5000,
    apiCalls: 100000,
  },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function getPlanColor(plan: BillingInfo["plan"]) {
  switch (plan) {
    case "free":
      return "bg-gray-100 text-gray-800";
    case "pro":
      return "bg-blue-100 text-blue-800";
    case "enterprise":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusColor(status: BillingInfo["status"]) {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "past_due":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function SettingsPage() {
  const [profile, setProfile] = useState(mockProfile);
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: true,
    security: true,
    weekly: true,
  });
  const [security, setSecurity] = useState({
    twoFactor: false,
    sessionTimeout: 30,
    loginAlerts: true,
    apiAccess: true,
  });

  const { data: billing, isLoading: billingLoading } = useQuery({
    queryKey: ["billing-info"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockBilling;
    },
    staleTime: 30_000,
  });

  const handleProfileUpdate = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 border-b bg-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings & Billing</h1>
          <p className="text-muted-foreground">Manage your account settings, preferences, and billing information.</p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal information and account details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-blue-600 text-white text-xl">
                      {initials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => handleProfileUpdate("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleProfileUpdate("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profile.phone || ""}
                      onChange={(e) => handleProfileUpdate("phone", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profile.company || ""}
                      onChange={(e) => handleProfileUpdate("company", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={profile.role}
                      onChange={(e) => handleProfileUpdate("role", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={profile.timezone} onValueChange={(value) => handleProfileUpdate("timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Billing Information
                </CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {billingLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                  </div>
                ) : billing ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Current Plan</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPlanColor(billing.plan)}>
                            {billing.plan.charAt(0).toUpperCase() + billing.plan.slice(1)}
                          </Badge>
                          <Badge className={getStatusColor(billing.status)}>
                            {billing.status.charAt(0).toUpperCase() + billing.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${billing.amount}</p>
                        <p className="text-sm text-muted-foreground">per month</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Payment Method</h4>
                        <p className="text-sm text-muted-foreground">{billing.paymentMethod}</p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Next Billing Date</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(billing.nextBillingDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-medium">Usage This Month</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Campaigns</span>
                            <span>{billing.usage.campaigns}/{billing.limits.campaigns}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(billing.usage.campaigns / billing.limits.campaigns) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Leads</span>
                            <span>{billing.usage.leads.toLocaleString()}/{billing.limits.leads.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(billing.usage.leads / billing.limits.leads) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Messages</span>
                            <span>{billing.usage.messages.toLocaleString()}/{billing.limits.messages.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${(billing.usage.messages / billing.limits.messages) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>API Calls</span>
                            <span>{billing.usage.apiCalls.toLocaleString()}/{billing.limits.apiCalls.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${(billing.usage.apiCalls / billing.limits.apiCalls) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button className="flex-1">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Update Payment Method
                      </Button>
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Invoice
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to be notified about important updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={() => handleNotificationToggle("email")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={() => handleNotificationToggle("push")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">SMS Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={() => handleNotificationToggle("sms")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-muted-foreground">Receive marketing and promotional emails</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={() => handleNotificationToggle("marketing")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Security Alerts</h4>
                      <p className="text-sm text-muted-foreground">Receive security-related notifications</p>
                    </div>
                    <Switch
                      checked={notifications.security}
                      onCheckedChange={() => handleNotificationToggle("security")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Weekly Reports</h4>
                      <p className="text-sm text-muted-foreground">Receive weekly performance reports</p>
                    </div>
                    <Switch
                      checked={notifications.weekly}
                      onCheckedChange={() => handleNotificationToggle("weekly")}
                    />
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={security.twoFactor}
                      onCheckedChange={() => handleSecurityToggle("twoFactor")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login Alerts</h4>
                      <p className="text-sm text-muted-foreground">Get notified when someone logs into your account</p>
                    </div>
                    <Switch
                      checked={security.loginAlerts}
                      onCheckedChange={() => handleSecurityToggle("loginAlerts")}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">API Access</h4>
                      <p className="text-sm text-muted-foreground">Allow third-party applications to access your account</p>
                    </div>
                    <Switch
                      checked={security.apiAccess}
                      onCheckedChange={() => handleSecurityToggle("apiAccess")}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Select value={security.sessionTimeout.toString()} onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: parseInt(value) }))}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Danger Zone</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </div>
                </div>

                <Button className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

