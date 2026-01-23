import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/lib/countries";
import MultipleIdDocuments, { type IdDocument } from "./MultipleIdDocuments";
import { supabase } from "@/integrations/supabase/client";

const directorUboSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role_type: z.string().min(1, "Role type is required"),
  title: z.string().optional(),
  nationality: z.string().optional(),
  country_of_residence: z.string().optional(),
  date_of_birth: z.string().optional(),
  appointment_date: z.string().optional(),
  resignation_date: z.string().optional(),
  ownership_percentage: z.string().optional(),
  control_type: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  passport_number: z.string().optional(),
  is_pep: z.boolean().default(false),
  pep_details: z.string().optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
});

export type DirectorUboFormData = z.infer<typeof directorUboSchema> & {
  id_documents?: IdDocument[];
};

const ROLE_TYPES = [
  { value: "director", label: "Director" },
  { value: "ubo", label: "UBO (Ultimate Beneficial Owner)" },
  { value: "both", label: "Both (Director & UBO)" },
];

const TITLE_OPTIONS = [
  "CEO",
  "CFO",
  "COO",
  "CTO",
  "Chairman",
  "President",
  "Vice President",
  "Secretary",
  "Treasurer",
  "Board Member",
  "Managing Director",
  "Director",
  "Executive Director",
  "Non-Executive Director",
  "Independent Director",
];

const CONTROL_TYPES = [
  { value: "direct", label: "Direct Ownership" },
  { value: "indirect", label: "Indirect Ownership" },
  { value: "voting_rights", label: "Voting Rights" },
  { value: "other", label: "Other Control" },
];


interface DirectorUboFormProps {
  item?: any;
  entityId: string;
  onSubmit: (data: DirectorUboFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DirectorUboForm = ({
  item,
  entityId,
  onSubmit,
  onCancel,
  isLoading,
}: DirectorUboFormProps) => {
  const [idDocuments, setIdDocuments] = useState<IdDocument[]>(
    item?.id_documents || []
  );

  // Fetch existing ID documents when editing
  useEffect(() => {
    if (item?.id) {
      supabase
        .from("director_id_documents")
        .select("*")
        .eq("director_id", item.id)
        .then(({ data }) => {
          if (data) {
            setIdDocuments(
              data.map((d) => ({
                id: d.id,
                document_type: d.document_type || "",
                document_number: d.document_number || "",
                expiry_date: d.expiry_date || "",
                file_path: d.file_path || "",
                file_name: d.file_name || "",
                notes: d.notes || "",
              }))
            );
          }
        });
    }
  }, [item?.id]);
  
  const form = useForm<DirectorUboFormData>({
    resolver: zodResolver(directorUboSchema),
    defaultValues: {
      name: item?.name || "",
      role_type: item?.role_type || "director",
      title: item?.title || "",
      nationality: item?.nationality || "",
      country_of_residence: item?.country_of_residence || "",
      date_of_birth: item?.date_of_birth || "",
      appointment_date: item?.appointment_date || "",
      resignation_date: item?.resignation_date || "",
      ownership_percentage: item?.ownership_percentage?.toString() || "",
      control_type: item?.control_type || "",
      tax_id: item?.tax_id || "",
      address: item?.address || "",
      email: item?.email || "",
      phone: item?.phone || "",
      passport_number: item?.passport_number || "",
      is_pep: item?.is_pep || false,
      pep_details: item?.pep_details || "",
      is_active: item?.is_active ?? true,
      notes: item?.notes || "",
    },
  });

  const roleType = form.watch("role_type");
  const isPep = form.watch("is_pep");
  const showOwnershipFields = roleType === "ubo" || roleType === "both";

  const handleFormSubmit = (data: z.infer<typeof directorUboSchema>) => {
    onSubmit({ ...data, id_documents: idDocuments });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title/Position</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TITLE_OPTIONS.map((title) => (
                      <SelectItem key={title} value={title}>
                        {title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 234 567 8900" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Info */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nationality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select nationality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="country_of_residence"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country of Residence</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Full address..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Appointment Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="appointment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Appointment Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resignation_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resignation Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Ownership Info (for UBO) */}
        {showOwnershipFields && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ownership_percentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ownership Percentage</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" max="100" placeholder="25" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="control_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Control Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select control type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CONTROL_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Multiple ID Documents */}
        <MultipleIdDocuments
          directorId={item?.id || "new"}
          documents={idDocuments}
          onChange={setIdDocuments}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="passport_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Passport Number</FormLabel>
                <FormControl>
                  <Input placeholder="P12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax ID / SSN</FormLabel>
                <FormControl>
                  <Input placeholder="XXX-XX-XXXX" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* PEP Status */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="is_pep"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Politically Exposed Person (PEP)</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Is this person a politically exposed person?
                  </p>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {isPep && (
            <FormField
              control={form.control}
              name="pep_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PEP Details</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Provide details about the PEP status..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Is this person currently active?
                </p>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {item ? "Update" : "Add"} {roleType === "ubo" ? "UBO" : roleType === "both" ? "Director/UBO" : "Director"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default DirectorUboForm;
