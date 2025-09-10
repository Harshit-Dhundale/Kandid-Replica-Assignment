import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Send, Clock, XCircle, MessageSquare } from "lucide-react";

export function LeadStatusBadge({
  status,
  sentAgo,
}: {
  status: "pending" | "contacted" | "responded" | "converted" | "do_not_contact";
  /** When status === "contacted", show "Sent 7 mins ago" */
  sentAgo?: string;
}) {
  const statusLabel = (status: string) => {
    switch (status) {
      case "pending": return "Pending Approval";
      case "contacted": return sentAgo ? `Sent ${sentAgo}` : "Sent";
      case "responded": return "Follow-up";
      case "converted": return "Converted";
      case "do_not_contact": return "Do Not Contact";
      default: return status;
    }
  };

  const mapping = {
    converted: { icon: <CheckCircle className="w-4 h-4" />, class: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    contacted: { icon: <Send className="w-4 h-4" />, class: "bg-amber-100 text-amber-800 border-amber-200" },
    pending: { icon: <Clock className="w-4 h-4" />, class: "bg-purple-100 text-purple-800 border-purple-200" },
    "do_not_contact": { icon: <XCircle className="w-4 h-4" />, class: "bg-gray-100 text-gray-800 border-gray-200"},
    responded: { icon: <MessageSquare className="w-4 h-4" />, class: "bg-blue-100 text-blue-800 border-blue-200"}
  };
  
  const meta = mapping[status as keyof typeof mapping] ?? mapping.contacted;
  
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${meta.class}`}>
      {meta.icon}
      <span className="text-sm">{statusLabel(status)}</span>
    </span>
  );
}

export function CampaignStatusBadge({
  status,
}: {
  status: "draft" | "active" | "paused" | "completed";
}) {
  const variants = {
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    active: "bg-emerald-100 text-emerald-800 border-emerald-200",
    paused: "bg-amber-100 text-amber-800 border-amber-200", 
    completed: "bg-purple-100 text-purple-800 border-purple-200",
  } as const;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${variants[status]}`}>
      {status}
    </span>
  );
}
