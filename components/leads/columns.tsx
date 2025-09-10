"use client";

import { ColumnDef } from "@tanstack/react-table";
import { LeadStatusBadge } from "@/components/common/status-badge";
import { Lead } from "@/lib/types";
import Image from "next/image";

export const columns: ColumnDef<Lead>[] = [
  // ---------------------------
  // NAME + AVATAR COLUMN
  // ---------------------------
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => {
      const lead = row.original;
      return (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full overflow-hidden border bg-gray-100">
            <Image
              src={lead.avatar || "/placeholder-user.jpg"}
              alt={lead.fullName}
              width={36}
              height={36}
              className="object-cover"
            />
          </div>

          {/* Name */}
          <span className="font-medium text-sm truncate max-w-[160px]">
            {lead.fullName}
          </span>
        </div>
      );
    },
  },

  // ---------------------------
  // LEAD DESCRIPTION COLUMN
  // ---------------------------
  {
    accessorKey: "jobTitle",
    header: "Lead Description",
    cell: ({ row }) => {
      const title = row.original.jobTitle;
      return (
        <span className="text-gray-600 text-sm truncate block max-w-xs">
          {title || "—"}
        </span>
      );
    },
  },

  // ---------------------------
  // ACTIVITY COLUMN (||| BARS)
  // ---------------------------
  {
    accessorKey: "activity",
    header: "Activity",
    cell: ({ row }) => {
      const lead = row.original;
      // Calculate activity based on status
      const getActivityLevel = (status: Lead["status"]) => {
        switch (status) {
          case "pending": return 0;
          case "contacted": return 1;
          case "responded": return 3;
          case "converted": return 4;
          case "do_not_contact": return 0;
          default: return 0;
        }
      };
      
      const activeBars = lead.activity ?? getActivityLevel(lead.status);
      
      const getBarColor = (index: number, step: number) => {
        if (index >= step) return "bg-gray-300";
        
        if (step === 1) return "bg-yellow-500";
        if (step === 2) return "bg-blue-500";
        if (step === 3) return "bg-purple-500";
        if (step === 4) return "bg-emerald-500";
        
        return "bg-gray-300";
      };
      
      return (
        <div className="flex gap-1 items-center">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-1 h-6 rounded-sm transition-colors duration-200 ${getBarColor(i, activeBars)}`}
            />
          ))}
        </div>
      );
    },
  },

  // ---------------------------
  // STATUS COLUMN (BADGE)
  // ---------------------------
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <LeadStatusBadge status={row.original.status || "pending"} />
    ),
  },
];
