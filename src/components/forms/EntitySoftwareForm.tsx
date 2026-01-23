import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entitySoftwareSchema, EntitySoftwareFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEntities, useSoftwareCatalog, type EntitySoftware } from "@/hooks/usePortalData";

interface EntitySoftwareFormProps {
  software?: EntitySoftware | null;
  defaultEntityId?: string;
  onSubmit: (data: EntitySoftwareFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const softwareCategories = [
  { value: "erp", label: "ERP System" },
  { value: "accounting", label: "Accounting" },
  { value: "payroll", label: "Payroll" },
  { value: "business_intelligence", label: "Business Intelligence" },
  { value: "crm", label: "CRM" },
  { value: "project_management", label: "Project Management" },
  { value: "communication", label: "Communication" },
  { value: "productivity", label: "Productivity" },
  { value: "hr", label: "HR Management" },
  { value: "inventory", label: "Inventory Management" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "marketing", label: "Marketing" },
  { value: "other", label: "Other" },
];

export const categoryLabels: Record<string, string> = {
  erp: "ERP System",
  accounting: "Accounting",
  payroll: "Payroll",
  business_intelligence: "Business Intelligence",
  crm: "CRM",
  project_management: "Project Management",
  communication: "Communication",
  productivity: "Productivity",
  hr: "HR Management",
  inventory: "Inventory Management",
  ecommerce: "E-Commerce",
  marketing: "Marketing",
  other: "Other",
};

const EntitySoftwareForm = ({ software, defaultEntityId, onSubmit, onCancel, isLoading }: EntitySoftwareFormProps) => {
  const { data: entities } = useEntities();
  const { data: catalog } = useSoftwareCatalog();

  const form = useForm<EntitySoftwareFormData>({
    resolver: zodResolver(entitySoftwareSchema),
    defaultValues: {
      entity_id: software?.entity_id ?? defaultEntityId ?? "",
      software_id: software?.software_id ?? "",
      custom_name: software?.custom_name ?? "",
      category: software?.category ?? "other",
      login_url: software?.login_url ?? "",
      account_email: software?.account_email ?? "",
      notes: software?.notes ?? "",
      is_active: software?.is_active ?? true,
      license_type: software?.license_type ?? "",
      license_expiry_date: software?.license_expiry_date ?? "",
    },
  });

  const selectedSoftwareId = form.watch("software_id");
  const selectedSoftware = catalog?.find(s => s.id === selectedSoftwareId);

  // When software is selected from catalog, update category
  const handleSoftwareChange = (value: string) => {
    form.setValue("software_id", value === "__custom__" ? "" : value);
    if (value !== "__custom__" && value) {
      const sw = catalog?.find(s => s.id === value);
      if (sw) {
        form.setValue("category", sw.category);
        form.setValue("custom_name", "");
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="entity_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Entity *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
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

        <FormField control={form.control} name="software_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Software</FormLabel>
            <Select onValueChange={handleSoftwareChange} value={field.value || "__custom__"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select from catalog or enter custom" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px]">
                <SelectItem value="__custom__">-- Custom Software --</SelectItem>
                {catalog?.map((sw) => (
                  <SelectItem key={sw.id} value={sw.id}>
                    {sw.name} {sw.vendor && `(${sw.vendor})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {!selectedSoftwareId && (
          <FormField control={form.control} name="custom_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Software Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter software name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {softwareCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="license_type" render={({ field }) => (
            <FormItem>
              <FormLabel>License Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Enterprise, Pro, Free" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="login_url" render={({ field }) => (
            <FormItem>
              <FormLabel>Login URL</FormLabel>
              <FormControl>
                <Input placeholder="https://app.example.com/login" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="account_email" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="admin@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="license_expiry_date" render={({ field }) => (
          <FormItem>
            <FormLabel>License Expiry Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Additional notes..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="is_active" render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel className="cursor-pointer">Active</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : software ? "Update Software" : "Add Software"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EntitySoftwareForm;
