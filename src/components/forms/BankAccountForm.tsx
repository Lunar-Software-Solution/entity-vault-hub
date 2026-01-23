import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountSchema, BankAccountFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BankAccount } from "@/hooks/usePortalData";
import { useEntities } from "@/hooks/usePortalData";

interface BankAccountFormProps {
  account?: BankAccount | null;
  onSubmit: (data: BankAccountFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const BankAccountForm = ({ account, onSubmit, onCancel, isLoading }: BankAccountFormProps) => {
  const { data: entities } = useEntities();
  
  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      name: account?.name ?? "",
      bank: account?.bank ?? "",
      bank_website: (account as any)?.bank_website ?? "",
      account_number: account?.account_number ?? "",
      routing_number: account?.routing_number ?? "",
      type: account?.type ?? "Checking",
      currency: account?.currency ?? "USD",
      entity_id: (account as any)?.entity_id ?? "",
      iban: (account as any)?.iban ?? "",
      swift_bic: (account as any)?.swift_bic ?? "",
      account_holder_name: (account as any)?.account_holder_name ?? "",
      bank_address: (account as any)?.bank_address ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Entity Selection */}
        <FormField control={form.control} name="entity_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Linked Entity</FormLabel>
            <Select onValueChange={(value) => field.onChange(value === "__none__" ? "" : value)} defaultValue={field.value || "__none__"}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select entity (optional)" /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="__none__">No entity</SelectItem>
                {entities?.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Account Holder & Account Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="account_holder_name" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Holder Name</FormLabel>
              <FormControl><Input placeholder="LUNAR TECHNOLOGIES OOD" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name *</FormLabel>
              <FormControl><Input placeholder="Primary EUR Account" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Bank Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="bank" render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name *</FormLabel>
              <FormControl><Input placeholder="Wise" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="bank_website" render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Website</FormLabel>
              <FormControl><Input placeholder="https://wise.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Account Numbers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="account_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number *</FormLabel>
              <FormControl><Input placeholder="8313453359" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="iban" render={({ field }) => (
            <FormItem>
              <FormLabel>IBAN</FormLabel>
              <FormControl>
                <Input 
                  placeholder="BE95 9676 8175 4358" 
                  {...field}
                  onChange={(e) => {
                    // Auto-format IBAN with spaces every 4 characters
                    const raw = e.target.value.replace(/\s/g, '').toUpperCase();
                    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
                    field.onChange(formatted);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Routing Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="routing_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl><Input placeholder="026073150" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="swift_bic" render={({ field }) => (
            <FormItem>
              <FormLabel>SWIFT/BIC</FormLabel>
              <FormControl><Input placeholder="CMFGUS33" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Type & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="Checking">Checking</SelectItem>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                  <SelectItem value="Money Market">Money Market</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="currency" render={({ field }) => (
            <FormItem>
              <FormLabel>Currency *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="BGN">BGN</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Bank Address */}
        <FormField control={form.control} name="bank_address" render={({ field }) => (
          <FormItem>
            <FormLabel>Bank Address</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Community Federal Savings Bank, 89-16 Jamaica Ave, Woodhaven, NY, 11421, United States" 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : account ? "Update Account" : "Add Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BankAccountForm;