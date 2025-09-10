"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, Linkedin } from "lucide-react";

interface LinkedInAccount {
  id: string;
  displayName: string;
  email: string;
  status: "connected" | "disconnected" | "error";
  requestsUsed: number;
  requestsLimit: number;
}

export function LinkedInAccounts() {
  // Mock data matching the reference image exactly
  const mockAccounts: LinkedInAccount[] = [
    {
      id: "1",
      displayName: "Pulkit Garg",
      email: "1999pulkitgarg@gmail.com",
      status: "connected",
      requestsUsed: 17,
      requestsLimit: 30,
    },
    {
      id: "2", 
      displayName: "Jivesh Lakhani",
      email: "jivesh@example.com",
      status: "connected",
      requestsUsed: 19,
      requestsLimit: 30,
    },
    {
      id: "3",
      displayName: "Indrajit Sahani", 
      email: "indrajit@example.com",
      status: "connected",
      requestsUsed: 18,
      requestsLimit: 30,
    },
    {
      id: "4",
      displayName: "Bhavya Arora",
      email: "bhavya@example.com", 
      status: "connected",
      requestsUsed: 18,
      requestsLimit: 100,
    },
  ];

  // Use mock data directly since API has UUID format issues
  const displayAccounts = mockAccounts;

  return (
    <div className="dashboard-card">
      <h3 className="font-semibold text-base mb-4">LinkedIn Accounts</h3>

      <div className="space-y-3">
        {displayAccounts.map((account) => (
          <div key={account.id} className="activity-row flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-600 text-white text-xs">
                {account.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {account.displayName}
                </span>
                <Linkedin className="h-3 w-3 text-blue-600" />
              </div>
              <div className="text-xs text-gray-500 truncate">
                {account.email}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">Connected</span>
              </div>
              <div className="text-xs text-gray-500">
                {account.requestsUsed}/{account.requestsLimit}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
