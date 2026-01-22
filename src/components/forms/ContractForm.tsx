import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contractSchema, ContractFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Contract } from "@/hooks/usePortalData";

interface ContractFormProps {
  contract?: Contract | null;
  onSubmit: (data: ContractFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ContractForm = ({ contract, onSubmit, onCancel, isLoading }: ContractFormProps) => {
  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      title: contract?.title ?? "",
      type: contract?.type ?? "General",
      parties: contract?.parties ?? [],
      status: contract?.status ?? "active",
      start_date: contract?.start_date ?? "",
      end_date: contract?.end_date ?? "",
      value: contract?.value ?? "",
      value_numeric: contract?.value_numeric ? Number(contract.value_numeric) : undefined,
    },
  });

  const handleSubmit = (data: ContractFormData) => {
    // Parse parties from comma-separated string if needed
    const parties = typeof data.parties === 'string' 
      ? (data.parties as string).split(',').map(p => p.trim()).filter(Boolean)
      : data.parties;
    onSubmit({ ...data, parties });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Contract Title *</FormLabel>
              <FormControl><Input placeholder="Office Lease Agreement" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Contract Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Lease">Lease</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                  <SelectItem value="Employment">Employment</SelectItem>
                  <SelectItem value="NDA">NDA</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Vendor">Vendor</SelectItem>
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expiring-soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="terminated">Terminated</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="parties" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Parties (comma-separated)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Acme Corp, Jane Doe" 
                  value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="start_date" render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="end_date" render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel>
              <FormControl><Input type="date" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="value" render={({ field }) => (
            <FormItem>
              <FormLabel>Value (Display)</FormLabel>
              <FormControl><Input placeholder="$5,000/month" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="value_numeric" render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Value (Numeric)</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="60000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : contract ? "Update Contract" : "Add Contract"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContractForm;
