import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taxIdSchema, TaxIdFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  // Canada - Federal & General
  GST_CA: { placeholder: "XXXXXXXXX RT XXXX", hint: "BN + RT + 4 digits" },
  PST: { placeholder: "PST-XXXX-XXXX", hint: "Format varies by province" },
  QST: { placeholder: "XXXXXXXXXX TQ XXXX", hint: "10-digit QST number" },
  NEQ: { placeholder: "XXXXXXXXXX", hint: "10-digit Quebec enterprise number" },
  FED_CORP: { placeholder: "XXXXXXX", hint: "Federal corporation number" },
  // Canada - Provincial Corporation Numbers
  ON_CORP: { placeholder: "XXXXXXX", hint: "7-digit Ontario corporation number" },
  BC_CORP: { placeholder: "BC XXXXXXX", hint: "BC + 7-digit number" },
  AB_CORP: { placeholder: "XXXXXXXXX", hint: "9-digit Corporate Access Number" },
  MB_CORP: { placeholder: "XXXXXXX", hint: "Manitoba business number" },
  SK_CORP: { placeholder: "XXXXXXX", hint: "Saskatchewan corporation number" },
  NS_CORP: { placeholder: "XXXXXXX", hint: "Nova Scotia registry ID" },
  NB_CORP: { placeholder: "XXXXXX", hint: "New Brunswick corporation number" },
  PE_CORP: { placeholder: "XXXXXX", hint: "PEI corporation number" },
  NL_CORP: { placeholder: "XXXXXXX", hint: "Newfoundland corporation number" },
  NT_BL: { placeholder: "XXXXXX", hint: "NWT business licence number" },
  YT_CORP: { placeholder: "XXXXXXX", hint: "Yukon corporation number" },
  NU_BL: { placeholder: "XXXXXX", hint: "Nunavut business licence number" },
  // Canada - Provincial Sales Tax
  RST_MB: { placeholder: "XXXXXXX", hint: "Manitoba RST number" },
  PST_SK: { placeholder: "XXXXXXX", hint: "Saskatchewan PST vendor licence" },
  PST_BC: { placeholder: "PST-XXXX-XXXX", hint: "BC PST registration number" },
  // Bulgaria
  EGN: { placeholder: "XXXXXXXXXX", hint: "10-digit personal ID" },
  BG_VAT: { placeholder: "BG XXXXXXXXX", hint: "BG + EIK number" },
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

  // Group tax ID types by country
  const groupedTaxIdTypes = useMemo(() => {
    if (!taxIdTypes) return {};
    
    const countryPatterns: Record<string, RegExp> = {
      'United States': /\(US\)|\(USA\)/i,
      'Canada': /\(Canada\)|\(Ontario\)|\(British Columbia\)|\(Alberta\)|\(Manitoba\)|\(Saskatchewan\)|\(Nova Scotia\)|\(New Brunswick\)|\(Prince Edward Island\)|\(Newfoundland\)|\(Northwest Territories\)|\(Yukon\)|\(Nunavut\)|\(Quebec\)|\(Canada Federal\)/i,
      'United Kingdom': /\(UK\)/i,
      'France': /\(France\)/i,
      'Netherlands': /\(Netherlands\)/i,
      'Bulgaria': /\(Bulgaria\)/i,
      'Australia': /Australia/i,
      'Brazil': /\(Brazil\)/i,
      'Spain': /\(Spain\)/i,
      'India': /\(India\)/i,
      'Mexico': /\(Mexico\)/i,
    };
    
    const groups: Record<string, typeof taxIdTypes> = {};
    const other: typeof taxIdTypes = [];
    
    taxIdTypes.forEach((type) => {
      let matched = false;
      for (const [country, pattern] of Object.entries(countryPatterns)) {
        if (pattern.test(type.label)) {
          if (!groups[country]) groups[country] = [];
          groups[country].push(type);
          matched = true;
          break;
        }
      }
      if (!matched) {
        other.push(type);
      }
    });
    
    // Sort countries alphabetically
    const sortedGroups: Record<string, typeof taxIdTypes> = {};
    Object.keys(groups).sort().forEach(key => {
      sortedGroups[key] = groups[key].sort((a, b) => a.code.localeCompare(b.code));
    });
    
    if (other.length > 0) {
      sortedGroups['Other'] = other.sort((a, b) => a.code.localeCompare(b.code));
    }
    
    return sortedGroups;
  }, [taxIdTypes]);

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
              <SelectContent className="max-h-80">
                {Object.entries(groupedTaxIdTypes).map(([country, types]) => (
                  <SelectGroup key={country}>
                    <SelectLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5 bg-muted/50">
                      {country}
                    </SelectLabel>
                    {types.map((type) => (
                      <SelectItem key={type.id} value={type.code}>
                        {type.code} — {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
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
