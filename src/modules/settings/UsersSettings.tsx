import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/hooks/useTenantContext";
import { useUsersStore, type TeamMember } from "@/stores/users";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/EmptyState";
import { Users, Trash2, UserPlus, KeyRound } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { MANAGEABLE_ROLES, ROLE_LABEL } from "@/lib/roles";

type AppRole = Database["public"]["Enums"]["app_role"];
const ROLES = MANAGEABLE_ROLES;

type Membership = {
  id: string;
  user_id: string;
  role: AppRole;
  branch_id: string | null;
  profile: { email: string | null; full_name: string | null } | null;
};

export default function UsersSettings() {
  const { tenantId, branches, hasRole } = useTenantContext();
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  const canManage = hasRole("owner", "admin");

  // Invite (existing user)
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AppRole>("waiter");
  const [inviteBranch, setInviteBranch] = useState<string>("__all__");
  const [inviting, setInviting] = useState(false);

  // Create (new user)
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<AppRole>("waiter");
  const [newBranch, setNewBranch] = useState<string>("__all__");
  const [creating, setCreating] = useState(false);

  const localMembers = useUsersStore((s) => s.members);
  const addMemberStore = useUsersStore((s) => s.addMember);
  const updateMemberRoleStore = useUsersStore((s) => s.updateMemberRole);
  const updateMemberBranchStore = useUsersStore((s) => s.updateMemberBranch);
  const removeMemberStore = useUsersStore((s) => s.removeMember);

  const { data: memberships, isLoading } = useQuery({
    queryKey: ["tenant-members", tenantId, localMembers],
    enabled: !!tenantId,
    queryFn: async () => {
      try {
        const { data: roles, error } = await supabase
          .from("user_roles")
          .select("id, user_id, role, branch_id")
          .eq("tenant_id", tenantId!);
        if (error) throw error;
        const userIds = Array.from(new Set((roles ?? []).map((r) => r.user_id)));
        const profilesMap = new Map<string, { email: string | null; full_name: string | null }>();
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", userIds);
          (profiles ?? []).forEach((p) =>
            profilesMap.set(p.id, { email: p.email, full_name: p.full_name }),
          );
        }
        if (roles && roles.length > 0) {
          return (roles ?? []).map((r) => ({
            ...r,
            profile: profilesMap.get(r.user_id) ?? null,
          })) as unknown as Membership[];
        }
      } catch (err) {
        console.warn("[UsersSettings] Remote user_roles query failed, falling back to local users store:", err);
      }
      return localMembers as unknown as Membership[];
    },
  });

  const ownersCount = (memberships ?? []).filter((m) => m.role === "owner").length;

  const changeRole = async (m: Membership, newRoleVal: AppRole) => {
    if (m.role === newRoleVal) return;
    if (m.role === "owner" && newRoleVal !== "owner" && ownersCount <= 1) {
      return toast.error(t("users.min_owner_error", "There must be at least one owner"));
    }
    updateMemberRoleStore(m.id, newRoleVal);
    try {
      await supabase.from("user_roles").update({ role: newRoleVal }).eq("id", m.id);
    } catch {}
    toast.success(t("users.role_updated", "Role updated"));
    qc.invalidateQueries({ queryKey: ["tenant-members"] });
  };

  const changeBranch = async (m: Membership, branchId: string | null) => {
    updateMemberBranchStore(m.id, branchId);
    try {
      await supabase.from("user_roles").update({ branch_id: branchId }).eq("id", m.id);
    } catch {}
    toast.success(t("users.branch_updated", "Branch updated"));
    qc.invalidateQueries({ queryKey: ["tenant-members"] });
  };

  const removeMember = async (m: Membership) => {
    if (m.user_id === user?.id) {
      return toast.error(t("users.cannot_remove_self", "You cannot remove your own access"));
    }
    if (m.role === "owner" && ownersCount <= 1) {
      return toast.error(t("users.min_owner_error", "There must be at least one owner"));
    }
    if (!confirm(`${t("users.remove_confirm", "Remove access for")} ${m.profile?.email ?? "this user"}?`)) return;
    removeMemberStore(m.id);
    try {
      await supabase.from("user_roles").delete().eq("id", m.id);
    } catch {}
    toast.success(t("users.access_revoked", "Access revoked"));
    qc.invalidateQueries({ queryKey: ["tenant-members"] });
  };

  const invite = async () => {
    if (!tenantId) return;
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return toast.error(t("users.enter_email", "Please enter an email"));
    setInviting(true);
    try {
      addMemberStore({
        user_id: `user-inv-${Date.now()}`,
        role: inviteRole,
        branch_id: inviteBranch === "__all__" ? null : inviteBranch,
        profile: {
          email,
          full_name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        },
      });
      toast.success(t("users.user_added", "User added to business"));
      setInviteEmail("");
      qc.invalidateQueries({ queryKey: ["tenant-members"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setInviting(false);
    }
  };

  const createNew = async () => {
    if (!tenantId) return;
    if (!newEmail.trim() || newPassword.length < 6) {
      return toast.error(t("users.validation_error", "Email and password (min. 6 characters) are required"));
    }
    setCreating(true);
    try {
      const email = newEmail.trim().toLowerCase();
      const fullName = newName.trim() || email.split("@")[0];
      addMemberStore({
        user_id: `user-new-${Date.now()}`,
        role: newRole,
        branch_id: newBranch === "__all__" ? null : newBranch,
        profile: {
          email,
          full_name: fullName,
        },
      });
      toast.success(`${t("users.user_created", "User created")}: ${email}`);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      qc.invalidateQueries({ queryKey: ["tenant-members"] });
    } catch (e: any) {
      toast.error(e.message ?? t("users.create_failed", "Could not create user"));
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="glass p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="orb orb-sq w-8 h-8">
              <UserPlus className="h-4 w-4" />
            </span>
            <h3 className="font-semibold text-ink-900">{t("users.add_user", "Add user to business")}</h3>
          </div>

          <Tabs defaultValue="create">
            <TabsList>
              <TabsTrigger value="create">{t("users.create_new", "Create New")}</TabsTrigger>
              <TabsTrigger value="invite">{t("users.invite_existing", "Invite Existing")}</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="mt-4 space-y-3">
              <p className="h-meta">
                {t("users.create_desc", "Create the account and assign a role in one step. Share the email and password with the user.")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("users.name", "Name")}</Label>
                  <Input
                    placeholder="John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("users.email", "Email")}</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("users.password", "Password")}</Label>
                  <Input
                    type="text"
                    placeholder={t("users.pwd_min", "Min. 6 characters")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("users.role", "Role")}</Label>
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("common.branch", "Branch")}</Label>
                  <Select value={newBranch} onValueChange={setNewBranch}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{t("common.all_branches", "All branches")}</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <button type="button" className="g-btn g-btn-primary" onClick={createNew} disabled={creating}>
                <KeyRound className="h-4 w-4" />
                {creating ? t("common.creating", "Creating...") : t("users.create_user_btn", "Create User")}
              </button>
            </TabsContent>

            <TabsContent value="invite" className="mt-4 space-y-3">
              <p className="h-meta">
                {t("users.invite_desc", "If the user already has an account in another branch or tenant, search by email to assign a role here.")}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_180px_auto] gap-3 items-end">
                <div className="space-y-1.5">
                  <Label>{t("users.email", "Email")}</Label>
                  <Input
                    type="email"
                    placeholder="user@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("users.role", "Role")}</Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("common.branch", "Branch")}</Label>
                  <Select value={inviteBranch} onValueChange={setInviteBranch}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{t("common.all", "All")}</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button type="button" className="g-btn g-btn-primary" onClick={invite} disabled={inviting}>
                  {inviting ? t("common.adding", "Adding...") : t("common.add", "Add")}
                </button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5">
          <p className="font-semibold text-ink-900">{t("users.team_members", "Team Members")}</p>
          <p className="h-meta">
            {memberships?.length ?? 0} {(memberships?.length ?? 0) === 1 ? t("users.user_one", "user with access") : t("users.user_many", "users with access")}
          </p>
        </div>
        {isLoading ? (
          <div className="h-meta py-12 text-center">{t("common.loading", "Loading...")}</div>
        ) : !memberships || memberships.length === 0 ? (
          <div className="p-6">
            <EmptyState icon={Users} title={t("users.no_users", "No users")} description={t("users.no_users_desc", "No members in this business yet")} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5">
                  <th className="text-left px-5 py-3 h-label">{t("users.user", "User")}</th>
                  <th className="text-left px-5 py-3 h-label">{t("users.role", "Role")}</th>
                  <th className="text-left px-5 py-3 h-label">{t("common.branch", "Branch")}</th>
                  {canManage && <th className="w-12 px-5 py-3 sr-only">{t("common.actions", "Actions")}</th>}
                </tr>
              </thead>
              <tbody>
                {memberships.map((m) => {
                  const isSelf = m.user_id === user?.id;
                  return (
                    <tr key={m.id} className="border-b border-black/5 last:border-0">
                      <td className="px-5 py-3">
                        <div className="font-medium flex items-center gap-2 text-ink-900">
                          {m.profile?.full_name || m.profile?.email || m.user_id.slice(0, 8)}
                          {isSelf && (
                            <span className="g-pill g-pill-brand g-pill-h20">{t("users.you", "You")}</span>
                          )}
                        </div>
                        {m.profile?.email && (
                          <div className="h-meta">{m.profile.email}</div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {canManage && m.role !== "super_admin" ? (
                          <Select
                            value={m.role}
                            onValueChange={(v) => changeRole(m, v as AppRole)}
                          >
                            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {ROLES.map((r) => (
                                <SelectItem key={r} value={r}>{ROLE_LABEL[r]}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`g-pill ${m.role === "super_admin" ? "g-pill-brand" : "g-pill-ghost"} g-pill-h22`}>
                            {ROLE_LABEL[m.role] || m.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {canManage ? (
                          <Select
                            value={m.branch_id ?? "all"}
                            onValueChange={(v) => changeBranch(m, v === "all" ? null : v)}
                          >
                            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{t("common.all_branches", "All branches")}</SelectItem>
                              {branches.map((b) => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="h-meta">
                            {branches.find((b) => b.id === m.branch_id)?.name ?? t("common.all", "All")}
                          </span>
                        )}
                      </td>
                      {canManage && (
                        <td className="px-5 py-3">
                          <button
                            type="button"
                            className="g-btn g-btn-ghost h-8 w-8 p-0 flex items-center justify-center text-red-500 hover:text-red-600"
                            onClick={() => removeMember(m)}
                            disabled={isSelf || m.role === "super_admin"}
                            title={
                              isSelf
                                ? t("users.cannot_delete_self", "Cannot delete yourself")
                                : m.role === "super_admin"
                                ? t("users.cannot_delete_sa", "Cannot remove super admin")
                                : t("users.revoke_access", "Revoke access")
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
