import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bankAccountSchema, BankAccountFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
      account_number: account?.account_number ?? "",
      routing_number: account?.routing_number ?? "",
      type: account?.type ?? "Checking",
      currency: account?.currency ?? "USD",
      balance: account?.balance ? Number(account.balance) : 0,
      entity_id: (account as any)?.entity_id ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="entity_id" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Linked Entity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select entity (optional)" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="">No entity</SelectItem>
                  {entities?.map((entity) => (
                    <SelectItem key={entity.id} value={entity.id}>{entity.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name *</FormLabel>
              <FormControl><Input placeholder="Primary Checking" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="bank" render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name *</FormLabel>
              <FormControl><Input placeholder="Chase Bank" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="account_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number *</FormLabel>
              <FormControl><Input placeholder="****1234" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="routing_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl><Input placeholder="021000021" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

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
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="balance" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Current Balance *</FormLabel>
              <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

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
