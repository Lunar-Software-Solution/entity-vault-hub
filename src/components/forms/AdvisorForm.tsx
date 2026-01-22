import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { advisorSchema, AdvisorFormData } from "@/lib/formSchemas";
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
import type { Advisor } from "@/hooks/usePortalData";

interface AdvisorFormProps {
  advisor?: Advisor;
  entityId: string;
  onSubmit: (data: AdvisorFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ADVISOR_TYPES = [
  "Financial Advisor",
  "Strategic Advisor",
  "Investment Advisor",
  "M&A Advisor",
  "Board Advisor",
  "Wealth Manager",
];

const CERTIFICATION_OPTIONS = [
  "CFA",
  "CFP",
  "CPA",
  "MBA",
  "Series 7",
  "Series 65",
  "ChFC",
  "CIMA",
];

const AdvisorForm = ({ advisor, entityId, onSubmit, onCancel, isLoading }: AdvisorFormProps) => {
  const form = useForm<AdvisorFormData>({
    resolver: zodResolver(advisorSchema),
    defaultValues: {
      entity_id: entityId,
      name: advisor?.name ?? "",
      contact_name: advisor?.contact_name ?? "",
      email: advisor?.email ?? "",
      phone: advisor?.phone ?? "",
      website: advisor?.website ?? "",
      linkedin_url: advisor?.linkedin_url ?? "",
      address: advisor?.address ?? "",
      advisor_type: advisor?.advisor_type ?? "",
      certifications: advisor?.certifications ?? [],
      engagement_start_date: advisor?.engagement_start_date ?? "",
      engagement_end_date: advisor?.engagement_end_date ?? "",
      fee_structure: advisor?.fee_structure ?? "",
      notes: advisor?.notes ?? "",
      is_active: advisor?.is_active ?? true,
    },
  });

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
                <FormLabel>Advisor/Firm Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="advisor_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Advisor Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ADVISOR_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="advisor@firm.com" {...field} />
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
                  <Input placeholder="https://advisor.com" {...field} />
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
                  <Input placeholder="https://linkedin.com/in/..." {...field} />
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
                  <Input placeholder="AUM %, Retainer, etc." {...field} />
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
            {isLoading ? "Saving..." : advisor ? "Update" : "Add"} Advisor
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AdvisorForm;
