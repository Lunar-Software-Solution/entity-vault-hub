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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Search, Users, Shield, Clock, UserPlus, Mail } from "lucide-react";
import GravatarAvatar from "@/components/shared/GravatarAvatar";

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

const UserManagementSection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [showInviteForm, setShowInviteForm] = useState(false);
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

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "viewer": return "outline";
      default: return "outline";
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

  const createInvitation = useMutation({
    mutationFn: async (data: InviteFormData) => {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { error } = await supabase.from("team_invitations").insert({
        email: data.email,
        role: data.role as "admin" | "viewer",
        invited_by: user?.id || "",
        token,
        expires_at: expiresAt.toISOString(),
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_invitations"] });
      toast.success("Invitation sent successfully");
      setShowInviteForm(false);
    },
    onError: (error: Error) => toast.error(`Failed to send invitation: ${error.message}`),
  });

  const handleInvite = (data: InviteFormData) => {
    createInvitation.mutate(data);
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
                      <Badge variant={profile.status === "active" ? "default" : "secondary"}>
                        {profile.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {profile.last_login ? format(new Date(profile.last_login), "MMM d, yyyy HH:mm") : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(profile.created_at), "MMM d, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredProfiles.length && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations?.map((invitation) => (
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
                        <Badge variant={invitation.status === "pending" ? "outline" : "secondary"}>
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(invitation.expires_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(invitation.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!invitations?.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                    <TableHead className="text-foreground">Action</TableHead>
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Table</TableHead>
                    <TableHead className="text-foreground">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.action}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GravatarAvatar
                            email={log.user_email}
                            name={log.user_email || "User"}
                            size="sm"
                          />
                          <span className="text-muted-foreground">
                            {log.user_email || log.user_id.slice(0, 8) + "..."}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{log.table_name || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                      </TableCell>
                    </TableRow>
                  ))}
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
    </div>
  );
};

export default UserManagementSection;
