import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { auditorSchema, AuditorFormData } from "@/lib/formSchemas";
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
import type { Auditor } from "@/hooks/usePortalData";

interface AuditorFormProps {
  auditor?: Auditor;
  entityId: string;
  onSubmit: (data: AuditorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AUDIT_TYPE_OPTIONS = [
  "Financial Audit",
  "Compliance Audit",
  "Operational Audit",
  "IT Audit",
  "Tax Audit",
  "Internal Audit",
  "SOC 1",
  "SOC 2",
];

const CERTIFICATION_OPTIONS = [
  "CPA",
  "CIA",
  "CISA",
  "CFE",
  "CRMA",
  "Big 4",
];

const AuditorForm = ({ auditor, entityId, onSubmit, onCancel, isLoading }: AuditorFormProps) => {
  const form = useForm<AuditorFormData>({
    resolver: zodResolver(auditorSchema),
    defaultValues: {
      entity_id: entityId,
      name: auditor?.name ?? "",
      contact_name: auditor?.contact_name ?? "",
      email: auditor?.email ?? "",
      phone: auditor?.phone ?? "",
      website: auditor?.website ?? "",
      linkedin_url: auditor?.linkedin_url ?? "",
      address: auditor?.address ?? "",
      license_number: auditor?.license_number ?? "",
      audit_types: auditor?.audit_types ?? [],
      certifications: auditor?.certifications ?? [],
      engagement_start_date: auditor?.engagement_start_date ?? "",
      engagement_end_date: auditor?.engagement_end_date ?? "",
      fee_structure: auditor?.fee_structure ?? "",
      notes: auditor?.notes ?? "",
      is_active: auditor?.is_active ?? true,
    },
  });

  const handleAuditTypeToggle = (type: string) => {
    const current = form.getValues("audit_types");
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    form.setValue("audit_types", updated);
  };

  const handleCertificationToggle = (cert: string) => {
    const current = form.getValues("certifications");
    const updated = current.includes(cert)
      ? current.filter(c => c !== cert)
      : [...current, cert];
    form.setValue("certifications", updated);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Auditor/Firm Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter firm name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Contact</FormLabel>
                <FormControl>
                  <Input placeholder="Audit partner name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="auditor@firm.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://auditfirm.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="linkedin_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn Profile</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/company/..." {...field} />
                </FormControl>
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
                <Textarea placeholder="Office address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="license_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>License Number</FormLabel>
              <FormControl>
                <Input placeholder="PCAOB registration or CPA license" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audit_types"
          render={() => (
            <FormItem>
              <FormLabel>Audit Types</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {AUDIT_TYPE_OPTIONS.map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={form.watch("audit_types").includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleAuditTypeToggle(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certifications"
          render={() => (
            <FormItem>
              <FormLabel>Certifications</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {CERTIFICATION_OPTIONS.map((cert) => (
                  <Button
                    key={cert}
                    type="button"
                    variant={form.watch("certifications").includes(cert) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCertificationToggle(cert)}
                  >
                    {cert}
                  </Button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="engagement_start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engagement Start</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="engagement_end_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Engagement End</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fee_structure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fee Structure</FormLabel>
                <FormControl>
                  <Input placeholder="Fixed fee, Hourly, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Active Engagement</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : auditor ? "Update" : "Add"} Auditor
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AuditorForm;
