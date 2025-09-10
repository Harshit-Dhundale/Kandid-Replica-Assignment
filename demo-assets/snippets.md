# LinkBird Clone - Annotated Code Snippets

## Authentication System

### Better Auth Configuration
```typescript
// lib/auth.ts (lines 24-48)
export const auth = betterAuth({
  database: drizzleAdapter(
    db,
    { provider: "pg", ...(resolvedSchema ? { schema: resolvedSchema } : {}) }
  ),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
});
```

### Google OAuth Integration
```typescript
// app/login/page.tsx (lines 52-65)
const handleGoogleSignIn = async () => {
  setIsLoading(true)
  try {
    await signInWithGoogle("/dashboard")
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to sign in with Google",
      variant: "destructive",
    })
  } finally {
    setIsLoading(false)
  }
}
```

### Protected Routes Middleware
```typescript
// middleware.ts (lines 1-57)
export default async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (!session && request.nextUrl.pathname.startsWith("/app")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}
```

## Database Schema

### Campaigns Table
```typescript
// drizzle/schema.ts (lines 18-33)
export const campaigns = pgTable(
  "campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    status: campaignStatusEnum("status").notNull().default("active"),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    startDate: timestamp("start_date", { withTimezone: true }),
    archived: boolean("archived").default(false),
  },
  (t) => ({
    status_idx: index("campaigns_status_idx").on(t.status),
  }),
)
```

### Leads Table
```typescript
// drizzle/schema.ts (lines 35-57)
export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fullName: text("full_name").notNull(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    company: text("company"),
    jobTitle: text("job_title"),
    campaignId: uuid("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    status: leadStatusEnum("status").notNull().default("pending"),
    lastContactAt: timestamp("last_contact_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    campaign_idx: index("leads_campaign_idx").on(t.campaignId),
    status_idx: index("leads_status_idx").on(t.status),
    last_contact_idx: index("leads_last_contact_idx").on(t.lastContactAt),
  }),
)
```

## Leads Management

### Infinite Scroll with TanStack Query
```typescript
// app/(app)/leads/page.tsx (lines 91-108)
const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, error } = useInfiniteQuery({
  queryKey: ["leads", debouncedSearch, statusFilter, sortBy],
  queryFn: async ({ pageParam }) => {
    const params = new URLSearchParams();
    if (pageParam) params.set("cursor", pageParam);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (statusFilter !== "all") params.append("status", statusFilter);
    params.set("sort", sortBy);

    const response = await fetch(`/api/leads?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("Failed to fetch leads");
    return response.json();
  },
  initialPageParam: "",
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  staleTime: 30_000,
  refetchOnWindowFocus: false,
});
```

### Lead Side Sheet with Optimistic Updates
```typescript
// components/leads/lead-sheet.tsx (lines 78-97)
const updateStatusMutation = useMutation({
  mutationFn: async (status: string) => {
    if (!leadId) throw new Error("No lead ID");
    const response = await fetch(`/api/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update status");
    return response.json();
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["leads"] });
    queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
    toast({ title: "Status updated successfully" });
  },
  onError: () => {
    toast({ title: "Failed to update status", variant: "destructive" });
  },
});
```

## Campaigns Management

### Campaign Actions with Mutations
```typescript
// components/campaigns/campaign-actions.tsx (lines 35-62)
const toggleStatusMutation = useMutation({
  mutationFn: async (newStatus: "active" | "paused") => {
    const response = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || "Failed to update campaign")
    }
    return response.json()
  },
  onSuccess: (_, newStatus) => {
    queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    toast({ 
      title: "Campaign updated", 
      description: `Campaign ${newStatus === "active" ? "resumed" : "paused"} successfully` 
    })
  },
  onError: (error) => {
    toast({ 
      title: "Failed to update campaign", 
      description: error.message,
      variant: "destructive" 
    })
  },
})
```

## State Management

### Zustand Store with Persistence
```typescript
// stores/ui.ts (lines 76-130)
export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Sidebar state
      sidebarCollapsed: false,
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      
      // Selection state
      selectedLeadId: null,
      setSelectedLeadId: (leadId) => set({ selectedLeadId: leadId }),
      
      // Global filters
      leadsFilters: defaultLeadsFilters,
      setLeadsFilters: (filters) => set((state) => ({ 
        leadsFilters: { ...state.leadsFilters, ...filters } 
      })),
      
      // Modal state
      modals: defaultModals,
      setModal: (modal, open) => set((state) => ({ 
        modals: { ...state.modals, [modal]: open } 
      })),
    }),
    {
      name: "ui-store",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        leadsFilters: state.leadsFilters,
        campaignsFilters: state.campaignsFilters,
        theme: state.theme,
      }),
    },
  ),
)
```

## API Implementation

### Cursor-Based Pagination
```typescript
// app/api/leads/route.ts (lines 27-131)
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = LeadsListQuerySchema.parse({
      cursor: searchParams.get("cursor") || undefined,
      q: searchParams.get("q") || undefined,
      status: searchParams.getAll("status"),
      campaignId: searchParams.get("campaignId") || undefined,
      sort: searchParams.get("sort") || "recent",
    });

    const limit = 20;
    const whereConditions: any[] = [];

    // Search filter
    if (parsed.q) {
      const like = `%${parsed.q}%`;
      whereConditions.push(
        sql`(${leads.fullName} ILIKE ${like} OR ${leads.email} ILIKE ${like} OR ${leads.company} ILIKE ${like})`,
      );
    }

    // Cursor keyset on (createdAt, id)
    const cursor = decodeCursor(parsed.cursor ?? null);
    if (cursor) {
      whereConditions.push(
        or(
          lt(leads.createdAt, cursor.ts),
          and(eq(leads.createdAt, cursor.ts), lt(leads.id, cursor.id)),
        ),
      );
    }

    // Build query with pagination
    const query = db
      .select({
        id: leads.id,
        fullName: leads.fullName,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        company: leads.company,
        jobTitle: leads.jobTitle,
        status: leads.status,
        lastContactAt: leads.lastContactAt,
        createdAt: leads.createdAt,
        campaignName: campaigns.name,
        campaignId: leads.campaignId,
      })
      .from(leads)
      .innerJoin(campaigns, eq(leads.campaignId, campaigns.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(limit + 1);

    const results = await query;
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, -1) : results;

    const nextCursor = hasMore && items.length
      ? encodeCursor(new Date(items[items.length - 1].createdAt), items[items.length - 1].id)
      : undefined;

    return NextResponse.json({
      items: items.map((item) => ({
        ...item,
        createdAt: item.createdAt.toISOString(),
        lastContactAt: item.lastContactAt?.toISOString() ?? null,
      })),
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## Performance Optimizations

### Debounced Search
```typescript
// hooks/use-debounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

### Memoized Data Processing
```typescript
// app/(app)/leads/page.tsx (lines 110-111)
const leads: Lead[] = useMemo(() => data?.pages.flatMap((p: any) => p.items) ?? [], [data]);
```

## Error Handling

### API Error Handling
```typescript
// app/api/leads/[id]/route.ts (lines 67-104)
export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: leadId } = await ctx.params;
    const body = await req.json();
    const validatedData = LeadPatchSchema.parse(body);

    const [updatedLead] = await db
      .update(leads)
      .set({
        ...validatedData,
        lastContactAt: validatedData.status === "contacted" ? new Date() : undefined,
      })
      .where(eq(leads.id, leadId))
      .returning();

    if (!updatedLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...updatedLead,
      createdAt: updatedLead.createdAt.toISOString(),
      lastContactAt: updatedLead.lastContactAt?.toISOString() ?? null,
    });
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

## UI Components

### Status Badge Component
```typescript
// components/common/status-badge.tsx
export function LeadStatusBadge({ status, sentAgo }: LeadStatusBadgeProps) {
  const statusConfig = {
    pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
    contacted: { label: "Contacted", className: "bg-blue-100 text-blue-800" },
    responded: { label: "Responded", className: "bg-green-100 text-green-800" },
    converted: { label: "Converted", className: "bg-emerald-100 text-emerald-800" },
    do_not_contact: { label: "Do Not Contact", className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <div className="flex items-center gap-2">
      <Badge className={cn("text-xs", config.className)}>
        {config.label}
      </Badge>
      {sentAgo && (
        <span className="text-xs text-muted-foreground">{sentAgo}</span>
      )}
    </div>
  );
}
```

## Key Technical Decisions

1. **Cursor-based pagination** for infinite scroll performance
2. **Optimistic updates** for better user experience
3. **Debounced search** to reduce API calls
4. **Zustand with persistence** for client state management
5. **TanStack Query** for server state with caching
6. **Better Auth** for authentication with multiple providers
7. **Drizzle ORM** for type-safe database operations
8. **shadcn/ui** for consistent component library
9. **TypeScript throughout** for type safety
10. **Proper error handling** with user-friendly messages