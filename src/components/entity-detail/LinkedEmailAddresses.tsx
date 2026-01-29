import { useState } from "react";
import { Mail, Star, Plus, MoreHorizontal, Edit, Trash2, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DeleteConfirmDialog from "@/components/shared/DeleteConfirmDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import EmailEntityAffiliationsManager from "@/components/forms/EmailEntityAffiliationsManager";

interface EmailAddress {
  id: string;
  entity_id: string | null;
  email: string;
  label: string;
  purpose: string | null;
  is_primary: boolean;
  is_verified: boolean;
}

interface EmailEntityLink {
  id: string;
  email_id: string;
  is_primary: boolean;
  role: string | null;
  email?: EmailAddress;
}

interface LinkedEmailAddressesProps {
  entityId: string;
}

interface EmailFormData {
  email: string;
  label: string;
  purpose?: string;
  is_primary: boolean;
}

const EmailForm = ({
  item,
  onSubmit,
  onCancel,
  isLoading,
}: {
  item?: EmailAddress | null;
  onSubmit: (data: EmailFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}) => {
  const form = useForm<EmailFormData>({
    defaultValues: {
      email: item?.email || "",
      label: item?.label || "Support",
      purpose: item?.purpose || "",
      is_primary: item?.is_primary || false,
    },
  });

  const labelOptions = ["Support", "Sales", "Info", "Billing", "HR", "Legal", "Admin", "Other"];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        {/* Show affiliations manager only when editing existing email */}
        {item?.id && (
          <div className="border-t pt-4 mt-4">
            <EmailEntityAffiliationsManager emailId={item.id} />
          </div>
        )}

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

const LinkedEmailAddresses = ({ entityId }: LinkedEmailAddressesProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmail, setEditingEmail] = useState<EmailAddress | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<EmailAddress | null>(null);
  const queryClient = useQueryClient();

  // Fetch emails linked via junction table
  const { data: linkedEmails = [] } = useQuery({
    queryKey: ["entity-email-links", entityId],
    queryFn: async () => {
      if (!entityId) return [];
      const { data, error } = await supabase
        .from("email_entity_links")
        .select(`
          id,
          email_id,
          is_primary,
          role,
          email:email_addresses(*)
        `)
        .eq("entity_id", entityId);
      if (error) throw error;
      return data as EmailEntityLink[];
    },
    enabled: !!entityId,
  });

  // Map linked emails for display
  const allEmails = linkedEmails
    .filter(link => link.email)
    .map(link => ({ 
      email: link.email!, 
      role: link.role,
      linkIsPrimary: link.is_primary 
    }));

  const createMutation = useMutation({
    mutationFn: async (data: EmailFormData) => {
      const { data: result, error } = await supabase
        .from("email_addresses")
        .insert({
          ...data,
          purpose: data.purpose || null,
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_addresses"] });
      toast.success("Email address added");
      handleCloseForm();
    },
    onError: (error: Error) => toast.error(`Failed to add email: ${error.message}`),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: EmailFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from("email_addresses")
        .update({
          ...data,
          purpose: data.purpose || null,
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_addresses"] });
      toast.success("Email address updated");
      handleCloseForm();
    },
    onError: (error: Error) => toast.error(`Failed to update email: ${error.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("email_addresses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["email_addresses"] });
      toast.success("Email address deleted");
      setDeletingEmail(null);
    },
    onError: (error: Error) => toast.error(`Failed to delete email: ${error.message}`),
  });

  const handleSubmit = (data: EmailFormData) => {
    if (editingEmail) {
      updateMutation.mutate({ id: editingEmail.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (email: EmailAddress) => {
    setEditingEmail(email);
    setShowForm(true);
  };

  const handleDelete = () => {
    if (deletingEmail) {
      deleteMutation.mutate(deletingEmail.id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingEmail(null);
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Email Addresses</h3>
          <Badge variant="secondary" className="text-xs">{allEmails.length}</Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(true)} className="gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {allEmails.length === 0 ? (
        <p className="text-sm text-muted-foreground">No email addresses linked</p>
      ) : (
        <div className="space-y-3">
          {allEmails.map(({ email, role, linkIsPrimary }) => (
            <div key={email.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{email.email}</span>
                    {(email.is_primary || linkIsPrimary) && (
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                    <Link2 className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-xs">{email.label}</Badge>
                    {role && (
                      <Badge variant="secondary" className="text-xs capitalize">{role}</Badge>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(email)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setDeletingEmail(email)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={handleCloseForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingEmail ? "Edit Email Address" : "Add Email Address"}
            </DialogTitle>
          </DialogHeader>
          <EmailForm
            item={editingEmail}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={!!deletingEmail}
        onOpenChange={() => setDeletingEmail(null)}
        onConfirm={handleDelete}
        title="Delete Email Address"
        description={`Are you sure you want to delete "${deletingEmail?.email}"?`}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LinkedEmailAddresses;
