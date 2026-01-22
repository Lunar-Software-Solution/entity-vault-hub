import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEntities } from "@/hooks/usePortalData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Search, Mail, CheckCircle2 } from "lucide-react";

interface EmailAddress {
  id: string;
  entity_id: string | null;
  email: string;
  label: string;
  purpose: string | null;
  mail_server_id: string | null;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface MailServer {
  id: string;
  name: string;
  provider: string;
  domain: string | null;
  is_verified: boolean;
  is_active: boolean;
}

interface EmailFormData {
  entity_id: string;
  email: string;
  label: string;
  purpose?: string;
  mail_server_id?: string;
  is_primary: boolean;
}

// Custom hooks for email addresses
const useEmailAddresses = () => {
  return useQuery({
    queryKey: ["email_addresses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("email_addresses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as EmailAddress[];
    },
  });
};

const useMailServers = () => {
  return useQuery({
    queryKey: ["mail_servers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mail_servers")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data as MailServer[];
    },
  });
};

const useCreateEmailAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (email: Omit<EmailAddress, "id" | "created_at" | "updated_at" | "is_verified">) => {
      const { data, error } = await supabase.from("email_addresses").insert(email).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_addresses"] });
      toast.success("Email address added successfully");
    },
    onError: (error: Error) => toast.error(`Failed to add email: ${error.message}`),
  });
};

const useUpdateEmailAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...email }: Partial<EmailAddress> & { id: string }) => {
      const { data, error } = await supabase.from("email_addresses").update(email).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_addresses"] });
      toast.success("Email address updated successfully");
    },
    onError: (error: Error) => toast.error(`Failed to update email: ${error.message}`),
  });
};

const useDeleteEmailAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_addresses"] });
      toast.success("Email address deleted successfully");
    },
    onError: (error: Error) => toast.error(`Failed to delete email: ${error.message}`),
  });
};

const EmailForm = ({
  item,
  onSubmit,
  onCancel,
  isLoading,
  entities,
  mailServers,
}: {
  item?: EmailAddress | null;
  onSubmit: (data: EmailFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  entities: any[];
  mailServers: MailServer[];
}) => {
  const form = useForm<EmailFormData>({
    defaultValues: {
      entity_id: item?.entity_id || "",
      email: item?.email || "",
      label: item?.label || "",
      purpose: item?.purpose || "",
      mail_server_id: item?.mail_server_id || "",
      is_primary: item?.is_primary || false,
    },
  });

  const labelOptions = ["Support", "Sales", "Info", "Billing", "HR", "Legal", "Admin", "Other"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="entity_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Entity *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select an entity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background max-h-[300px]">
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl><Input placeholder="support@company.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="label" render={({ field }) => (
            <FormItem>
              <FormLabel>Label *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a label" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-background">
                  {labelOptions.map((label) => (
                    <SelectItem key={label} value={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="mail_server_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Mail Server</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a mail server (optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-background">
                <SelectItem value="__none__">None</SelectItem>
                {mailServers?.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name} ({server.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="purpose" render={({ field }) => (
          <FormItem>
            <FormLabel>Purpose</FormLabel>
            <FormControl><Textarea placeholder="Describe the purpose of this email..." rows={2} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="is_primary" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Primary Email</FormLabel>
            </div>
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : item ? "Update" : "Add Email"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

const EmailSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailAddress | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<EmailAddress | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");

  const { data: emailAddresses, isLoading: emailsLoading } = useEmailAddresses();
  const { data: mailServers, isLoading: serversLoading } = useMailServers();
  const { data: entities } = useEntities();

  const createEmail = useCreateEmailAddress();
  const updateEmail = useUpdateEmailAddress();
  const deleteEmail = useDeleteEmailAddress();

  const getEntityName = (entityId: string | null) => {
    if (!entityId) return "—";
    return entities?.find(e => e.id === entityId)?.name || "Unknown";
  };

  const getServerName = (serverId: string | null) => {
    if (!serverId) return null;
    return mailServers?.find(s => s.id === serverId)?.name || null;
  };

  const filteredEmails = useMemo(() => {
    let data = emailAddresses || [];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(email =>
        email.email.toLowerCase().includes(query) ||
        email.label.toLowerCase().includes(query)
      );
    }

    if (entityFilter !== "all") {
      data = data.filter(email => email.entity_id === entityFilter);
    }

    return data;
  }, [emailAddresses, searchQuery, entityFilter]);

  const handleSubmit = (data: EmailFormData) => {
    const payload = {
      ...data,
      entity_id: data.entity_id || null,
      mail_server_id: data.mail_server_id === "__none__" ? null : (data.mail_server_id || null),
      purpose: data.purpose || null,
    };

    if (editingEmail) {
      updateEmail.mutate({ id: editingEmail.id, ...payload }, {
        onSuccess: () => { setShowForm(false); setEditingEmail(null); }
      });
    } else {
      createEmail.mutate(payload as any, {
        onSuccess: () => setShowForm(false)
      });
    }
  };

  const handleDelete = () => {
    if (deletingEmail) {
      deleteEmail.mutate(deletingEmail.id, {
        onSuccess: () => setDeletingEmail(null)
      });
    }
  };

  if (emailsLoading || serversLoading) {
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
        <h2 className="text-2xl font-bold text-foreground">Email Addresses</h2>
        <p className="text-muted-foreground">Manage group email addresses for your entities</p>
      </div>

      <div className="glass-card rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Filter by Entity" />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="all">All Entities</SelectItem>
              {entities?.map((entity) => (
                <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(true)} className="gap-2 ml-auto">
            <Plus className="w-4 h-4" />
            Add Email
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground">Email</TableHead>
                <TableHead className="text-foreground">Label</TableHead>
                <TableHead className="text-foreground">Entity</TableHead>
                <TableHead className="text-foreground">Mail Server</TableHead>
                <TableHead className="text-foreground">Status</TableHead>
                <TableHead className="text-foreground w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmails.map((email) => (
                <TableRow key={email.id}>
                  <TableCell className="font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      {email.email}
                      {email.is_primary && (
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{email.label}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getEntityName(email.entity_id)}</TableCell>
                  <TableCell className="text-muted-foreground">{getServerName(email.mail_server_id) || "—"}</TableCell>
                  <TableCell>
                    {email.is_verified ? (
                      <div className="flex items-center gap-1 text-green-500">
                        <CheckCircle2 className="w-4 h-4" />
                        Verified
                      </div>
                    ) : (
                      <Badge variant="outline">Unverified</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                        onClick={() => { setEditingEmail(email); setShowForm(true); }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeletingEmail(email)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!filteredEmails.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    {searchQuery || entityFilter !== "all" ? "No emails match your filters" : "No email addresses added yet"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) { setShowForm(false); setEditingEmail(null); } }}>
        <DialogContent className="max-w-lg bg-background">
          <DialogHeader>
            <DialogTitle>{editingEmail ? "Edit Email Address" : "Add Email Address"}</DialogTitle>
          </DialogHeader>
          <EmailForm
            item={editingEmail}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditingEmail(null); }}
            entities={entities || []}
            mailServers={mailServers || []}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingEmail}
        onOpenChange={(open) => !open && setDeletingEmail(null)}
        onConfirm={handleDelete}
        title="Delete Email Address"
        description={`Are you sure you want to delete "${deletingEmail?.email || "this email"}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default EmailSection;
