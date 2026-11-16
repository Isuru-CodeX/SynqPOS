import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Branch } from "@/types/branch";

export const INITIAL_BRANCHES: Branch[] = [
  {
    id: "demo-branch-main",
    tenant_id: "demo-tenant-synqpos",
    name: "Main Flagship Store",
    address: "742 Evergreen Terrace, Suite 100",
    phone: "+1 (555) 234-5678",
    status: "active",
    table_view_mode: "cards",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-branch-downtown",
    tenant_id: "demo-tenant-synqpos",
    name: "Downtown Express",
    address: "100 Broadway Ave, Floor 1",
    phone: "+1 (555) 987-6543",
    status: "active",
    table_view_mode: "board_16_9",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-branch-airport",
    tenant_id: "demo-tenant-synqpos",
    name: "Airport Terminal 2",
    address: "International Departures, Concourse B",
    phone: "+1 (555) 456-7890",
    status: "active",
    table_view_mode: "cards",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-branch-uptown",
    tenant_id: "demo-tenant-synqpos",
    name: "Uptown Bistro & Lounge",
    address: "784 5th Avenue & 42nd St",
    phone: "+1 (555) 321-9876",
    status: "active",
    table_view_mode: "board_9_16",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface BranchesState {
  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
  addBranch: (branch: Omit<Branch, "id" | "created_at" | "updated_at">) => Branch;
  updateBranch: (id: string, updates: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;
  toggleBranchStatus: (id: string) => void;
  resetBranches: () => void;
}

export const useBranchesStore = create<BranchesState>()(
  persist(
    (set, get) => ({
      branches: INITIAL_BRANCHES,

      setBranches: (branches) => set({ branches }),

      addBranch: (b) => {
        const id = `branch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const now = new Date().toISOString();
        const newBranch: Branch = {
          ...b,
          id,
          created_at: now,
          updated_at: now,
          status: b.status || "active",
        };
        set({ branches: [...get().branches, newBranch] });
        return newBranch;
      },

      updateBranch: (id, updates) => {
        set({
          branches: get().branches.map((b) =>
            b.id === id ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
          ),
        });
      },

      deleteBranch: (id) => {
        set({ branches: get().branches.filter((b) => b.id !== id) });
      },

      toggleBranchStatus: (id) => {
        set({
          branches: get().branches.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: b.status === "active" ? "inactive" : "active",
                  updated_at: new Date().toISOString(),
                }
              : b
          ),
        });
      },

      resetBranches: () => set({ branches: INITIAL_BRANCHES }),
    }),
    {
      name: "synqpos-branches-store",
    }
  )
);
