import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxIdSchema, TaxIdFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEntities, useTaxIdTypes } from "@/hooks/usePortalData";
import type { TaxId } from "@/hooks/usePortalData";

interface TaxIdFormProps {
  taxId?: TaxId | null;
  defaultEntityId?: string;
  onSubmit: (data: TaxIdFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const commonCountries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "India",
  "Brazil",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Switzerland",
  "Singapore",
  "Hong Kong",
  "Ireland",
  "Luxembourg",
  "Cayman Islands",
  "British Virgin Islands",
];

const TaxIdForm = ({ taxId, defaultEntityId, onSubmit, onCancel, isLoading }: TaxIdFormProps) => {
  const { data: entities } = useEntities();
  const { data: taxIdTypes } = useTaxIdTypes();
  
  const form = useForm<TaxIdFormData>({
    resolver: zodResolver(taxIdSchema),
    defaultValues: {
      entity_id: taxId?.entity_id ?? defaultEntityId ?? "",
      tax_id_number: taxId?.tax_id_number ?? "",
      type: taxId?.type ?? "",
      authority: taxId?.authority ?? "",
      country: taxId?.country ?? "United States",
      issued_date: taxId?.issued_date ?? "",
      expiry_date: taxId?.expiry_date ?? "",
      notes: taxId?.notes ?? "",
      is_primary: taxId?.is_primary ?? false,
    },
  });

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

        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID Type *</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {taxIdTypes?.map((type) => (
                  <SelectItem key={type.id} value={type.code}>
                    {type.code} — {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="tax_id_number" render={({ field }) => (
          <FormItem>
            <FormLabel>Tax ID Number *</FormLabel>
            <FormControl>
              <Input placeholder="XX-XXXXXXX" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="country" render={({ field }) => (
          <FormItem>
            <FormLabel>Country *</FormLabel>
            <FormControl>
              <>
                <Input 
                  list="countries" 
                  placeholder="Select or type..."
                  {...field} 
                />
                <datalist id="countries">
                  {commonCountries.map((country) => (
                    <option key={country} value={country} />
                  ))}
                </datalist>
              </>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="issued_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="expiry_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Expiry Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Additional notes about this tax ID..." rows={2} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="is_primary" render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel className="cursor-pointer">Primary Tax ID</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : taxId ? "Update Tax ID" : "Add Tax ID"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default TaxIdForm;
