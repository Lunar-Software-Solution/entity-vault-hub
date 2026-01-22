import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { lawFirmSchema, LawFirmFormData } from "@/lib/formSchemas";
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
import type { LawFirm } from "@/hooks/usePortalData";

interface LawFirmFormProps {
  firm?: LawFirm;
  entityId: string;
  onSubmit: (data: LawFirmFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const PRACTICE_AREA_OPTIONS = [
  "Corporate",
  "Intellectual Property",
  "Employment",
  "Real Estate",
  "Litigation",
  "Tax",
  "M&A",
  "Securities",
  "Regulatory",
  "Immigration",
];

const LawFirmForm = ({ firm, entityId, onSubmit, onCancel, isLoading }: LawFirmFormProps) => {
  const form = useForm<LawFirmFormData>({
    resolver: zodResolver(lawFirmSchema),
    defaultValues: {
      entity_id: entityId,
      name: firm?.name ?? "",
      contact_name: firm?.contact_name ?? "",
      email: firm?.email ?? "",
      phone: firm?.phone ?? "",
      website: firm?.website ?? "",
      linkedin_url: firm?.linkedin_url ?? "",
      address: firm?.address ?? "",
      bar_number: firm?.bar_number ?? "",
      practice_areas: firm?.practice_areas ?? [],
      engagement_start_date: firm?.engagement_start_date ?? "",
      engagement_end_date: firm?.engagement_end_date ?? "",
      fee_structure: firm?.fee_structure ?? "",
      notes: firm?.notes ?? "",
      is_active: firm?.is_active ?? true,
    },
  });

  const handlePracticeAreaToggle = (area: string) => {
    const current = form.getValues("practice_areas");
    const updated = current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area];
    form.setValue("practice_areas", updated);
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
                  <Input placeholder="Attorney name" {...field} />
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
                  <Input type="email" placeholder="attorney@lawfirm.com" {...field} />
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
                  <Input placeholder="https://lawfirm.com" {...field} />
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
          name="bar_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bar Number</FormLabel>
              <FormControl>
                <Input placeholder="Attorney bar registration" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="practice_areas"
          render={() => (
            <FormItem>
              <FormLabel>Practice Areas</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRACTICE_AREA_OPTIONS.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant={form.watch("practice_areas").includes(area) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePracticeAreaToggle(area)}
                  >
                    {area}
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
            {isLoading ? "Saving..." : firm ? "Update" : "Add"} Law Firm
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LawFirmForm;
