import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { entitySchema, EntityFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Entity } from "@/hooks/usePortalData";

// Entity types grouped by jurisdiction
const ENTITY_TYPES = {
  "United States": [
    { value: "LLC", label: "LLC (Limited Liability Company)" },
    { value: "Corporation", label: "Corporation (C-Corp)" },
    { value: "S-Corporation", label: "S-Corporation" },
    { value: "Partnership", label: "Partnership" },
    { value: "LP", label: "LP (Limited Partnership)" },
    { value: "LLP", label: "LLP (Limited Liability Partnership)" },
    { value: "Sole Proprietorship", label: "Sole Proprietorship" },
    { value: "Non-Profit", label: "Non-Profit (501(c)(3))" },
    { value: "Trust", label: "Trust" },
    { value: "PLLC", label: "PLLC (Professional LLC)" },
    { value: "PC", label: "PC (Professional Corporation)" },
  ],
  "Canada": [
    { value: "Corporation (Canada)", label: "Corporation (Federal/Provincial)" },
    { value: "Joint Stock Company (Quebec)", label: "Joint Stock Company (Quebec)" },
    { value: "Unlimited Liability Company", label: "ULC (Unlimited Liability Company)" },
    { value: "General Partnership (Canada)", label: "General Partnership" },
    { value: "Limited Partnership (Canada)", label: "Limited Partnership (LP)" },
    { value: "LLP (Canada)", label: "LLP (Limited Liability Partnership)" },
    { value: "Sole Proprietorship (Canada)", label: "Sole Proprietorship" },
    { value: "Cooperative", label: "Cooperative" },
    { value: "Non-Profit (Canada)", label: "Non-Profit Corporation" },
  ],
  "United Kingdom": [
    { value: "Ltd", label: "Ltd (Private Limited Company)" },
    { value: "PLC", label: "PLC (Public Limited Company)" },
    { value: "LLP (UK)", label: "LLP (Limited Liability Partnership)" },
    { value: "Partnership (UK)", label: "Partnership" },
    { value: "Sole Trader", label: "Sole Trader" },
    { value: "CIC", label: "CIC (Community Interest Company)" },
    { value: "Charity", label: "Charity / Non-Profit" },
    { value: "Scottish LP", label: "Scottish Limited Partnership" },
  ],
  "France": [
    { value: "SARL", label: "SARL (Société à Responsabilité Limitée)" },
    { value: "SAS", label: "SAS (Société par Actions Simplifiée)" },
    { value: "SASU", label: "SASU (SAS Unipersonnelle)" },
    { value: "SA", label: "SA (Société Anonyme)" },
    { value: "SNC", label: "SNC (Société en Nom Collectif)" },
    { value: "SCI", label: "SCI (Société Civile Immobilière)" },
    { value: "EURL", label: "EURL (Entreprise Unipersonnelle)" },
    { value: "Auto-entrepreneur", label: "Auto-entrepreneur / Micro-entreprise" },
    { value: "Association", label: "Association (Loi 1901)" },
  ],
  "Bulgaria": [
    { value: "EOOD", label: "ЕООД / EOOD (Single-Member LLC)" },
    { value: "OOD", label: "ООД / OOD (Limited Liability Company)" },
    { value: "AD", label: "АД / AD (Joint Stock Company)" },
    { value: "EAD", label: "ЕАД / EAD (Single-Member JSC)" },
    { value: "ET", label: "ЕТ / ET (Sole Trader)" },
    { value: "SD", label: "СД / SD (General Partnership)" },
    { value: "KD", label: "КД / KD (Limited Partnership)" },
    { value: "KDA", label: "КДА / KDA (Partnership Limited by Shares)" },
    { value: "Cooperative (Bulgaria)", label: "Кооперация (Cooperative)" },
  ],
  "Other": [
    { value: "Other", label: "Other" },
  ],
};

interface EntityFormProps {
  entity?: Entity | null;
  onSubmit: (data: EntityFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const EntityForm = ({ entity, onSubmit, onCancel, isLoading }: EntityFormProps) => {
  const form = useForm<EntityFormData>({
    resolver: zodResolver(entitySchema),
    defaultValues: {
      name: entity?.name ?? "",
      type: entity?.type ?? "LLC",
      status: entity?.status ?? "Active",
      jurisdiction: entity?.jurisdiction ?? "",
      founded_date: entity?.founded_date ?? "",
      fiscal_year_end: (entity as any)?.fiscal_year_end ?? "",
      website: (entity as any)?.website ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Name *</FormLabel>
              <FormControl><Input placeholder="Acme Corporation" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Entity Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent className="max-h-[300px]">
                  {Object.entries(ENTITY_TYPES).map(([country, types]) => (
                    <SelectGroup key={country}>
                      <SelectLabel className="text-xs font-semibold text-muted-foreground">{country}</SelectLabel>
                      {types.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Dissolved">Dissolved</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="jurisdiction" render={({ field }) => (
            <FormItem>
              <FormLabel>Jurisdiction</FormLabel>
              <FormControl><Input placeholder="Delaware, USA" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="founded_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Founded Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="fiscal_year_end" render={({ field }) => (
            <FormItem>
              <FormLabel>Fiscal Year End</FormLabel>
              <FormControl><Input placeholder="MM-DD (e.g., 12-31)" maxLength={5} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="website" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Website</FormLabel>
              <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : entity ? "Update Entity" : "Create Entity"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EntityForm;
