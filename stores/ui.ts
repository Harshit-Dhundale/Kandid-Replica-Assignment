import { create } from "zustand"
import { persist } from "zustand/middleware"

interface LeadsFilters {
  search: string
  status: string
  sortBy: string
}

interface CampaignsFilters {
  search: string
  status: string
  sortBy: string
}

interface Modals {
  leadSheet: boolean
  campaignSettings: boolean
  campaignCreate: boolean
}

interface UIStore {
  // Sidebar state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleSidebar: () => void
  
  // Selection state
  selectedLeadId: string | null
  setSelectedLeadId: (leadId: string | null) => void
  
  selectedCampaignId: string | null
  setSelectedCampaignId: (campaignId: string | null) => void
  
  // Global filters
  leadsFilters: LeadsFilters
  setLeadsFilters: (filters: Partial<LeadsFilters>) => void
  resetLeadsFilters: () => void
  
  campaignsFilters: CampaignsFilters
  setCampaignsFilters: (filters: Partial<CampaignsFilters>) => void
  resetCampaignsFilters: () => void
  
  // Modal state
  modals: Modals
  setModal: (modal: keyof Modals, open: boolean) => void
  closeAllModals: () => void
  
  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  
  // Theme state (for future dark mode)
  theme: "light" | "dark" | "system"
  setTheme: (theme: "light" | "dark" | "system") => void
}

const defaultLeadsFilters: LeadsFilters = {
  search: "",
  status: "all",
  sortBy: "recent"
}

const defaultCampaignsFilters: CampaignsFilters = {
  search: "",
  status: "all",
  sortBy: "created_desc"
}

const defaultModals: Modals = {
  leadSheet: false,
  campaignSettings: false,
  campaignCreate: false
}

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
      
      selectedCampaignId: null,
      setSelectedCampaignId: (campaignId) => set({ selectedCampaignId: campaignId }),
      
      // Global filters
      leadsFilters: defaultLeadsFilters,
      setLeadsFilters: (filters) => set((state) => ({ 
        leadsFilters: { ...state.leadsFilters, ...filters } 
      })),
      resetLeadsFilters: () => set({ leadsFilters: defaultLeadsFilters }),
      
      campaignsFilters: defaultCampaignsFilters,
      setCampaignsFilters: (filters) => set((state) => ({ 
        campaignsFilters: { ...state.campaignsFilters, ...filters } 
      })),
      resetCampaignsFilters: () => set({ campaignsFilters: defaultCampaignsFilters }),
      
      // Modal state
      modals: defaultModals,
      setModal: (modal, open) => set((state) => ({ 
        modals: { ...state.modals, [modal]: open } 
      })),
      closeAllModals: () => set({ modals: defaultModals }),
      
      // UI state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Theme state
      theme: "system",
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "ui-store",
      // Only persist certain parts of the state
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        leadsFilters: state.leadsFilters,
        campaignsFilters: state.campaignsFilters,
        theme: state.theme,
      }),
    },
  ),
)
