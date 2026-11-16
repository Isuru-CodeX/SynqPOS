import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

export interface TeamMember {
  id: string;
  user_id: string;
  role: AppRole;
  branch_id: string | null;
  profile: {
    email: string | null;
    full_name: string | null;
  };
  created_at: string;
}

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "mem-owner",
    user_id: "user-owner-isuru",
    role: "owner",
    branch_id: null,
    profile: {
      email: "isururathnayaka999@gmail.com",
      full_name: "Isuru Rathnayaka",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "mem-admin",
    user_id: "user-admin-alex",
    role: "admin",
    branch_id: null,
    profile: {
      email: "admin@synqpos.com",
      full_name: "Alex Rivera",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "mem-manager",
    user_id: "user-manager-sarah",
    role: "manager",
    branch_id: "demo-branch-main",
    profile: {
      email: "manager@synqpos.com",
      full_name: "Sarah Chen",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "mem-cashier",
    user_id: "user-cashier-david",
    role: "cashier",
    branch_id: "demo-branch-main",
    profile: {
      email: "cashier@synqpos.com",
      full_name: "David Miller",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "mem-waiter",
    user_id: "user-waiter-emma",
    role: "waiter",
    branch_id: "demo-branch-main",
    profile: {
      email: "waiter@synqpos.com",
      full_name: "Emma Watson",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "mem-kitchen",
    user_id: "user-kitchen-marco",
    role: "kitchen",
    branch_id: "demo-branch-main",
    profile: {
      email: "kitchen@synqpos.com",
      full_name: "Marco Rossi",
    },
    created_at: new Date().toISOString(),
  },
  {
    id: "mem-courier",
    user_id: "user-courier-lucas",
    role: "courier",
    branch_id: "demo-branch-downtown",
    profile: {
      email: "courier@synqpos.com",
      full_name: "Lucas Silva",
    },
    created_at: new Date().toISOString(),
  },
];

interface UsersState {
  members: TeamMember[];
  setMembers: (members: TeamMember[]) => void;
  addMember: (member: Omit<TeamMember, "id" | "created_at">) => TeamMember;
  updateMemberRole: (id: string, role: AppRole) => void;
  updateMemberBranch: (id: string, branchId: string | null) => void;
  removeMember: (id: string) => void;
  resetMembers: () => void;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      members: INITIAL_TEAM_MEMBERS,

      setMembers: (members) => set({ members }),

      addMember: (m) => {
        const id = `mem-${Date.now()}`;
        const newMember: TeamMember = {
          ...m,
          id,
          created_at: new Date().toISOString(),
        };
        set({ members: [...get().members, newMember] });
        return newMember;
      },

      updateMemberRole: (id, role) => {
        set({
          members: get().members.map((m) => (m.id === id ? { ...m, role } : m)),
        });
      },

      updateMemberBranch: (id, branch_id) => {
        set({
          members: get().members.map((m) => (m.id === id ? { ...m, branch_id } : m)),
        });
      },

      removeMember: (id) => {
        set({
          members: get().members.filter((m) => m.id !== id),
        });
      },

      resetMembers: () => set({ members: INITIAL_TEAM_MEMBERS }),
    }),
    {
      name: "synqpos-team-users",
    }
  )
);
