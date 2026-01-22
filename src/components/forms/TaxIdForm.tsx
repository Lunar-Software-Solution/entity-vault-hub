import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxIdSchema, TaxIdFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useEntities } from "@/hooks/usePortalData";
import type { TaxId } from "@/hooks/usePortalData";

interface TaxIdFormProps {
  taxId?: TaxId | null;
  defaultEntityId?: string;
  onSubmit: (data: TaxIdFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const commonTaxIdTypes = [
  { value: "EIN", label: "EIN (Employer Identification Number)" },
  { value: "SSN", label: "SSN (Social Security Number)" },
  { value: "ITIN", label: "ITIN (Individual Taxpayer ID)" },
  { value: "VAT", label: "VAT (Value Added Tax)" },
  { value: "GST", label: "GST (Goods & Services Tax)" },
  { value: "TIN", label: "TIN (Tax Identification Number)" },
  { value: "ABN", label: "ABN (Australian Business Number)" },
  { value: "UTR", label: "UTR (Unique Taxpayer Reference)" },
  { value: "PAN", label: "PAN (Permanent Account Number)" },
  { value: "NIF", label: "NIF (Número de Identificación Fiscal)" },
  { value: "RFC", label: "RFC (Registro Federal de Contribuyentes)" },
  { value: "CNPJ", label: "CNPJ (Brazil Corporate ID)" },
  { value: "Other", label: "Other" },
];

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

const commonAuthorities = [
  "IRS (Internal Revenue Service)",
  "HMRC (HM Revenue & Customs)",
  "CRA (Canada Revenue Agency)",
  "ATO (Australian Taxation Office)",
  "State Tax Office",
  "AFIP (Argentina)",
  "SAT (Mexico)",
  "Receita Federal (Brazil)",
  "BZSt (Germany)",
  "DGFIP (France)",
  "Agenzia delle Entrate (Italy)",
  "AEAT (Spain)",
  "NTA (Japan)",
  "IRAS (Singapore)",
];

const TaxIdForm = ({ taxId, defaultEntityId, onSubmit, onCancel, isLoading }: TaxIdFormProps) => {
  const { data: entities } = useEntities();
  
  const form = useForm<TaxIdFormData>({
    resolver: zodResolver(taxIdSchema),
    defaultValues: {
      entity_id: taxId?.entity_id ?? defaultEntityId ?? "",
      tax_id_number: taxId?.tax_id_number ?? "",
      type: taxId?.type ?? "EIN",
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Tax ID Type *</FormLabel>
              <FormControl>
                <>
                  <Input 
                    list="tax-id-types" 
                    placeholder="Select or type custom..."
                    {...field} 
                  />
                  <datalist id="tax-id-types">
                    {commonTaxIdTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </datalist>
                </>
              </FormControl>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem>
              <FormLabel>Country *</FormLabel>
              <FormControl>
                <>
                  <Input 
                    list="countries" 
                    placeholder="Select or type custom..."
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

          <FormField control={form.control} name="authority" render={({ field }) => (
            <FormItem>
              <FormLabel>Issuing Authority *</FormLabel>
              <FormControl>
                <>
                  <Input 
                    list="authorities" 
                    placeholder="e.g., IRS, HMRC, State Tax Office"
                    {...field} 
                  />
                  <datalist id="authorities">
                    {commonAuthorities.map((auth) => (
                      <option key={auth} value={auth} />
                    ))}
                  </datalist>
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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
