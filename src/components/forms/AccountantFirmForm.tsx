import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { accountantFirmSchema, AccountantFirmFormData } from "@/lib/formSchemas";
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
import type { AccountantFirm } from "@/hooks/usePortalData";

interface AccountantFirmFormProps {
  firm?: AccountantFirm;
  entityId: string;
  onSubmit: (data: AccountantFirmFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const SPECIALIZATION_OPTIONS = [
  "Tax Planning",
  "Audit",
  "Bookkeeping",
  "Payroll",
  "Financial Reporting",
  "Advisory",
  "Forensic Accounting",
  "Estate Planning",
];

const AccountantFirmForm = ({ firm, entityId, onSubmit, onCancel, isLoading }: AccountantFirmFormProps) => {
  const form = useForm<AccountantFirmFormData>({
    resolver: zodResolver(accountantFirmSchema),
    defaultValues: {
      entity_id: entityId,
      name: firm?.name ?? "",
      contact_name: firm?.contact_name ?? "",
      email: firm?.email ?? "",
      phone: firm?.phone ?? "",
      website: firm?.website ?? "",
      linkedin_url: firm?.linkedin_url ?? "",
      address: firm?.address ?? "",
      license_number: firm?.license_number ?? "",
      specializations: firm?.specializations ?? [],
      engagement_start_date: firm?.engagement_start_date ?? "",
      engagement_end_date: firm?.engagement_end_date ?? "",
      fee_structure: firm?.fee_structure ?? "",
      notes: firm?.notes ?? "",
      is_active: firm?.is_active ?? true,
    },
  });

  const handleSpecializationToggle = (spec: string) => {
    const current = form.getValues("specializations");
    const updated = current.includes(spec)
      ? current.filter(s => s !== spec)
      : [...current, spec];
    form.setValue("specializations", updated);
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
                <FormLabel>Firm Name *</FormLabel>
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
                  <Input placeholder="Contact person name" {...field} />
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
                  <Input type="email" placeholder="contact@firm.com" {...field} />
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
                  <Input placeholder="https://firm.com" {...field} />
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
              <FormLabel>CPA License Number</FormLabel>
              <FormControl>
                <Input placeholder="License/registration number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specializations"
          render={() => (
            <FormItem>
              <FormLabel>Specializations</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {SPECIALIZATION_OPTIONS.map((spec) => (
                  <Button
                    key={spec}
                    type="button"
                    variant={form.watch("specializations").includes(spec) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSpecializationToggle(spec)}
                  >
                    {spec}
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
                  <Input placeholder="Hourly, Retainer, etc." {...field} />
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
            {isLoading ? "Saving..." : firm ? "Update" : "Add"} Accountant Firm
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountantFirmForm;
