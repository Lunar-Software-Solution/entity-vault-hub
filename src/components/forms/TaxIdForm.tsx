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
import { useMemo } from "react";

// Dynamic placeholder and format hints based on tax ID type
const TAX_ID_FORMATS: Record<string, { placeholder: string; hint?: string }> = {
  EIN: { placeholder: "XX-XXXXXXX", hint: "Format: 12-3456789" },
  SSN: { placeholder: "XXX-XX-XXXX", hint: "Format: 123-45-6789" },
  ITIN: { placeholder: "9XX-XX-XXXX", hint: "Format: 9XX-XX-XXXX" },
  VAT: { placeholder: "Country code + number", hint: "e.g., FR12345678901" },
  GST: { placeholder: "XXAXXXXXX0X0XX", hint: "15-character alphanumeric" },
  ABN: { placeholder: "XX XXX XXX XXX", hint: "11-digit number" },
  ACN: { placeholder: "XXX XXX XXX", hint: "9-digit number" },
  TFN: { placeholder: "XXX XXX XXX", hint: "8-9 digit number" },
  UTR: { placeholder: "XXXXXXXXXX", hint: "10-digit number" },
  NI: { placeholder: "XX XXXXXX X", hint: "e.g., AB 123456 C" },
  SIN: { placeholder: "XXX-XXX-XXX", hint: "Format: 123-456-789" },
  BN: { placeholder: "XXXXXXXXX RC XXXX", hint: "Business Number" },
  SIRET: { placeholder: "XXX XXX XXX XXXXX", hint: "14-digit number" },
  SIREN: { placeholder: "XXX XXX XXX", hint: "9-digit number" },
  TVA: { placeholder: "FR XX XXXXXXXXX", hint: "FR + 11 characters" },
  EIK: { placeholder: "XXXXXXXXX", hint: "9 or 13-digit number" },
  KVK: { placeholder: "XXXXXXXX", hint: "8-digit number" },
  BTW: { placeholder: "NL XXXXXXXXX B XX", hint: "Dutch VAT format" },
  BSN: { placeholder: "XXXXXXXXX", hint: "9-digit number" },
  CRN: { placeholder: "XXXXXXXX", hint: "Company Registration Number" },
  TIN: { placeholder: "Enter tax ID number", hint: "Tax Identification Number" },
};

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

  const selectedType = form.watch("type");
  
  const formatInfo = useMemo(() => {
    return TAX_ID_FORMATS[selectedType] || { placeholder: "Enter tax ID number" };
  }, [selectedType]);

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
              <Input placeholder={formatInfo.placeholder} {...field} />
            </FormControl>
            {formatInfo.hint && (
              <p className="text-xs text-muted-foreground">{formatInfo.hint}</p>
            )}
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
