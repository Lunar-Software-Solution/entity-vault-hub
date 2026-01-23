import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Search, Users, Shield, Clock, UserPlus, Mail, MoreHorizontal, Pencil, Trash2, RefreshCw, UserCheck, UserX, ChevronDown, ChevronRight } from "lucide-react";
import { getChangeSummary, getChangedFields, formatTableName } from "@/lib/auditLogUtils";
import GravatarAvatar from "@/components/shared/GravatarAvatar";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  status: string;
  invited_by: string | null;
  invited_at: string | null;
  last_login: string | null;
  created_at: string;
}

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  user_email: string | null;
  action: string;
  table_name: string | null;
  record_id: string | null;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  invited_by: string;
  token: string;
  status: string;
  expires_at: string;
  created_at: string;
}

// Custom hooks
const useUserProfiles = () => {
  return useQuery({
    queryKey: ["user_profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UserProfile[];
    },
  });
};

const useUserRoles = () => {
  return useQuery({
    queryKey: ["user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*");
      if (error) throw error;
      return data as UserRole[];
    },
  });
};

const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as AuditLog[];
    },
  });
};

const useTeamInvitations = () => {
  return useQuery({
    queryKey: ["team_invitations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TeamInvitation[];
    },
  });
};

interface InviteFormData {
  email: string;
  role: string;
}

interface EditUserFormData {
  full_name: string;
  status: string;
  role: string;
}

const InviteForm = ({ 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  onSubmit: (data: InviteFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<InviteFormData>({
    defaultValues: {
      email: "",
      role: "viewer",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address *</FormLabel>
            <FormControl>
              <Input type="email" placeholder="user@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Role *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const EditUserForm = ({ 
  user,
  currentRole,
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  user: UserProfile;
  currentRole: string;
  onSubmit: (data: EditUserFormData) => void; 
  onCancel: () => void; 
  isLoading?: boolean;
}) => {
  const form = useForm<EditUserFormData>({
    defaultValues: {
      full_name: user.full_name || "",
      status: user.status,
      role: currentRole,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="full_name" render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <FormControl>
              <Input placeholder="John Doe" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="status" render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem>
            <FormLabel>Role</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const UserManagementSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [showEditUserForm, setShowEditUserForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [deleteUserDialog, setDeleteUserDialog] = useState(false);
  const [deleteInvitationDialog, setDeleteInvitationDialog] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<TeamInvitation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: profiles, isLoading: profilesLoading } = useUserProfiles();
  const { data: roles, isLoading: rolesLoading } = useUserRoles();
  const { data: auditLogs, isLoading: logsLoading } = useAuditLogs();
  const { data: invitations, isLoading: invitationsLoading } = useTeamInvitations();

  const isLoading = profilesLoading || rolesLoading;

  // Get user role
  const getUserRole = (userId: string) => {
    const userRoles = roles?.filter(r => r.user_id === userId) || [];
    if (userRoles.some(r => r.role === "admin")) return "admin";
    if (userRoles.some(r => r.role === "viewer")) return "viewer";
    return "viewer"; // default
  };

  const getUserRoleRecord = (userId: string) => {
    return roles?.find(r => r.user_id === userId);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "viewer": return "outline";
      default: return "outline";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "secondary";
      case "suspended": return "destructive";
      default: return "secondary";
    }
  };

  const filteredProfiles = useMemo(() => {
    let data = profiles || [];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(p =>
        p.full_name?.toLowerCase().includes(query) ||
        p.user_id.toLowerCase().includes(query)
      );
    }
    return data;
  }, [profiles, searchQuery]);

  const filteredLogs = useMemo(() => {
    let data = auditLogs || [];
    if (actionFilter !== "all") {
      data = data.filter(log => log.action === actionFilter);
    }
    return data;
  }, [auditLogs, actionFilter]);

  // Mutations
  const createInvitation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error } = await supabase.from("team_invitations").insert({
        email: data.email,
        role: data.role as "admin" | "viewer",
        invited_by: user?.id || "",
        token,
        expires_at: expiresAt.toISOString(),
      } as any);
      if (error) throw error;

      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({
            email: data.email,
            role: data.role,
            invitedBy: user?.id,
            token,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send invitation email:", errorData);
        toast.warning("Invitation created but email could not be sent");
        return;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invitations"] });
      toast.success("Invitation sent successfully");
      setShowInviteForm(false);
    },
    onError: (error: Error) => toast.error(`Failed to send invitation: ${error.message}`),
  });

  const updateUser = useMutation({
    mutationFn: async ({ userId, profileId, data, currentRoleId }: { 
      userId: string; 
      profileId: string; 
      data: EditUserFormData; 
      currentRoleId?: string;
    }) => {
      // Update profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ 
          full_name: data.full_name || null, 
          status: data.status 
        })
        .eq("id", profileId);
      if (profileError) throw profileError;

      // Update role - delete existing and insert new
      if (currentRoleId) {
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("id", currentRoleId);
        if (deleteError) throw deleteError;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: data.role as "admin" | "viewer" });
      if (roleError) throw roleError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("User updated successfully");
      setShowEditUserForm(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => toast.error(`Failed to update user: ${error.message}`),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      // Delete user roles first
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);
      if (roleError) throw roleError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .delete()
        .eq("user_id", userId);
      if (profileError) throw profileError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("User deleted successfully");
      setDeleteUserDialog(false);
      setSelectedUser(null);
    },
    onError: (error: Error) => toast.error(`Failed to delete user: ${error.message}`),
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ profileId, newStatus }: { profileId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("user_profiles")
        .update({ status: newStatus })
        .eq("id", profileId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
      toast.success("User status updated");
    },
    onError: (error: Error) => toast.error(`Failed to update status: ${error.message}`),
  });

  const deleteInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("team_invitations")
        .delete()
        .eq("id", invitationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invitations"] });
      toast.success("Invitation deleted");
      setDeleteInvitationDialog(false);
      setSelectedInvitation(null);
    },
    onError: (error: Error) => toast.error(`Failed to delete invitation: ${error.message}`),
  });

  const resendInvitation = useMutation({
    mutationFn: async (invitation: TeamInvitation) => {
      // Update expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const { error: updateError } = await supabase
        .from("team_invitations")
        .update({ 
          expires_at: expiresAt.toISOString(),
          status: "pending"
        })
        .eq("id", invitation.id);
      if (updateError) throw updateError;

      // Resend email
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-invitation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({
            email: invitation.email,
            role: invitation.role,
            invitedBy: user?.id,
            token: invitation.token,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to resend invitation email:", errorData);
        throw new Error("Failed to send email");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invitations"] });
      toast.success("Invitation resent successfully");
    },
    onError: (error: Error) => toast.error(`Failed to resend invitation: ${error.message}`),
  });

  const handleInvite = (data: InviteFormData) => {
    createInvitation.mutate(data);
  };

  const handleEditUser = (data: EditUserFormData) => {
    if (!selectedUser) return;
    const roleRecord = getUserRoleRecord(selectedUser.user_id);
    updateUser.mutate({
      userId: selectedUser.user_id,
      profileId: selectedUser.id,
      data,
      currentRoleId: roleRecord?.id,
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser.mutate(selectedUser.user_id);
  };

  const handleDeleteInvitation = () => {
    if (!selectedInvitation) return;
    deleteInvitation.mutate(selectedInvitation.id);
  };

  const actionTypes = useMemo(() => {
    const actions = new Set(auditLogs?.map(log => log.action) || []);
    return Array.from(actions);
  }, [auditLogs]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">User Management</h2>
        <p className="text-muted-foreground">Manage users, roles, and view audit logs</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <UserPlus className="w-4 h-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="audit-log" className="gap-2">
            <Clock className="w-4 h-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={() => setShowInviteForm(true)} className="gap-2 ml-auto">
                <Plus className="w-4 h-4" />
                Invite User
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground">User</TableHead>
                  <TableHead className="text-foreground">Role</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Last Login</TableHead>
                  <TableHead className="text-foreground">Joined</TableHead>
                  <TableHead className="text-foreground w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <GravatarAvatar
                          email={null}
                          name={profile.full_name || "User"}
                          size="sm"
                        />
                        <span className="font-medium text-foreground">
                          {profile.full_name || profile.user_id.slice(0, 8) + "..."}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(getUserRole(profile.user_id))}>
                        <Shield className="w-3 h-3 mr-1" />
                        {getUserRole(profile.user_id)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(profile.status)}>
                        {profile.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profile.last_login ? format(new Date(profile.last_login), "MMM d, yyyy HH:mm") : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(profile.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(profile);
                              setShowEditUserForm(true);
                            }}
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          {profile.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus.mutate({ 
                                profileId: profile.id, 
                                newStatus: "inactive" 
                              })}
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => toggleUserStatus.mutate({ 
                                profileId: profile.id, 
                                newStatus: "active" 
                              })}
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedUser(profile);
                              setDeleteUserDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredProfiles.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Pending Invitations</h3>
              <Button onClick={() => setShowInviteForm(true)} className="gap-2">
                <Mail className="w-4 h-4" />
                Send Invitation
              </Button>
            </div>

            {invitationsLoading ? (
              <Skeleton className="h-32" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Email</TableHead>
                    <TableHead className="text-foreground">Role</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Expires</TableHead>
                    <TableHead className="text-foreground">Sent</TableHead>
                    <TableHead className="text-foreground w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations?.map((invitation) => {
                    const isExpired = new Date(invitation.expires_at) < new Date();
                    return (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <GravatarAvatar
                              email={invitation.email}
                              name={invitation.email.split("@")[0]}
                              size="sm"
                            />
                            <span className="font-medium text-foreground">{invitation.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(invitation.role)}>{invitation.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            isExpired ? "destructive" : 
                            invitation.status === "accepted" ? "default" : "outline"
                          }>
                            {isExpired ? "expired" : invitation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(invitation.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-foreground hover:bg-muted">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              {invitation.status === "pending" && (
                                <DropdownMenuItem
                                  onClick={() => resendInvitation.mutate(invitation)}
                                  disabled={resendInvitation.isPending}
                                >
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Resend Invitation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                  setSelectedInvitation(invitation);
                                  setDeleteInvitationDialog(true);
                                }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Invitation
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!invitations?.length && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No pending invitations
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        <TabsContent value="audit-log" className="mt-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[200px] bg-background ml-auto">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>{action}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {logsLoading ? (
              <Skeleton className="h-64" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground w-[100px]">Action</TableHead>
                    <TableHead className="text-foreground">Description</TableHead>
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => {
                    const summary = getChangeSummary(log.action, log.table_name, log.old_values, log.new_values);
                    const changes = log.action === 'UPDATE' ? getChangedFields(log.old_values, log.new_values) : [];
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              log.action === "INSERT" ? "border-green-500/50 text-green-500" :
                              log.action === "UPDATE" ? "border-blue-500/50 text-blue-500" :
                              log.action === "DELETE" ? "border-red-500/50 text-red-500" :
                              ""
                            }
                          >
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium text-foreground">{summary}</p>
                            {changes.length > 0 && (
                              <div className="text-xs text-muted-foreground space-y-0.5">
                                {changes.slice(0, 3).map((change, idx) => (
                                  <div key={idx} className="flex items-center gap-1">
                                    <span className="text-muted-foreground/70">{change.fieldLabel}:</span>
                                    {change.oldValue && (
                                      <span className="line-through text-red-400/70">{change.oldValue}</span>
                                    )}
                                    {change.oldValue && change.newValue && <span>→</span>}
                                    {change.newValue && (
                                      <span className="text-green-400/70">{change.newValue}</span>
                                    )}
                                  </div>
                                ))}
                                {changes.length > 3 && (
                                  <span className="text-muted-foreground/50">+{changes.length - 3} more changes</span>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GravatarAvatar
                              email={log.user_email}
                              name={log.user_email || "User"}
                              size="sm"
                            />
                            <span className="text-muted-foreground text-sm">
                              {log.user_email?.split("@")[0] || log.user_id.slice(0, 8) + "..."}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(log.created_at), "MMM d, yyyy HH:mm")}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!filteredLogs.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite User Dialog */}
      <Dialog open={showInviteForm} onOpenChange={setShowInviteForm}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <InviteForm
            onSubmit={handleInvite}
            onCancel={() => setShowInviteForm(false)}
            isLoading={createInvitation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditUserForm} onOpenChange={(open) => {
        setShowEditUserForm(open);
        if (!open) setSelectedUser(null);
      }}>
        <DialogContent className="max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              currentRole={getUserRole(selectedUser.user_id)}
              onSubmit={handleEditUser}
              onCancel={() => {
                setShowEditUserForm(false);
                setSelectedUser(null);
              }}
              isLoading={updateUser.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <DeleteConfirmDialog
        open={deleteUserDialog}
        onOpenChange={(open) => {
          setDeleteUserDialog(open);
          if (!open) setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User?"
        description="This will permanently remove the user and their role. This action cannot be undone."
        isLoading={deleteUser.isPending}
      />

      {/* Delete Invitation Confirmation */}
      <DeleteConfirmDialog
        open={deleteInvitationDialog}
        onOpenChange={(open) => {
          setDeleteInvitationDialog(open);
          if (!open) setSelectedInvitation(null);
        }}
        onConfirm={handleDeleteInvitation}
        title="Delete Invitation?"
        description="This will permanently remove this invitation. The recipient will no longer be able to use it to join."
        isLoading={deleteInvitation.isPending}
      />
    </div>
  );
};

export default UserManagementSection;
