import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationAgentSchema, RegistrationAgentFormData } from "@/lib/formSchemas";
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
import type { RegistrationAgent } from "@/hooks/usePortalData";

interface RegistrationAgentFormProps {
  agent?: RegistrationAgent;
  entityId: string;
  onSubmit: (data: RegistrationAgentFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AGENT_TYPES = [
  "Registered Agent",
  "Formation Agent",
  "Compliance Agent",
  "Statutory Agent",
];

const JURISDICTION_OPTIONS = [
  "Delaware",
  "Wyoming",
  "Nevada",
  "California",
  "New York",
  "Texas",
  "Florida",
  "United Kingdom",
  "Cayman Islands",
  "BVI",
];

const RegistrationAgentForm = ({ agent, entityId, onSubmit, onCancel, isLoading }: RegistrationAgentFormProps) => {
  const form = useForm<RegistrationAgentFormData>({
    resolver: zodResolver(registrationAgentSchema),
    defaultValues: {
      entity_id: entityId,
      name: agent?.name ?? "",
      contact_name: agent?.contact_name ?? "",
      email: agent?.email ?? "",
      phone: agent?.phone ?? "",
      website: agent?.website ?? "",
      linkedin_url: agent?.linkedin_url ?? "",
      address: agent?.address ?? "",
      agent_type: agent?.agent_type ?? "",
      jurisdictions_covered: agent?.jurisdictions_covered ?? [],
      engagement_start_date: agent?.engagement_start_date ?? "",
      engagement_end_date: agent?.engagement_end_date ?? "",
      fee_structure: agent?.fee_structure ?? "",
      notes: agent?.notes ?? "",
      is_active: agent?.is_active ?? true,
    },
  });

  const handleJurisdictionToggle = (jur: string) => {
    const current = form.getValues("jurisdictions_covered");
    const updated = current.includes(jur)
      ? current.filter(j => j !== jur)
      : [...current, jur];
    form.setValue("jurisdictions_covered", updated);
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
                <FormLabel>Agent Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter agent/company name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="agent_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AGENT_TYPES.map((type) => (
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
                  <Input type="email" placeholder="contact@agent.com" {...field} />
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
                  <Input placeholder="https://agent.com" {...field} />
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
                <Textarea placeholder="Registered office address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jurisdictions_covered"
          render={() => (
            <FormItem>
              <FormLabel>Jurisdictions Covered</FormLabel>
              <div className="flex flex-wrap gap-2 mt-2">
                {JURISDICTION_OPTIONS.map((jur) => (
                  <Button
                    key={jur}
                    type="button"
                    variant={form.watch("jurisdictions_covered").includes(jur) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleJurisdictionToggle(jur)}
                  >
                    {jur}
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
                  <Input placeholder="Annual, Per-filing, etc." {...field} />
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
            {isLoading ? "Saving..." : agent ? "Update" : "Add"} Registration Agent
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RegistrationAgentForm;
