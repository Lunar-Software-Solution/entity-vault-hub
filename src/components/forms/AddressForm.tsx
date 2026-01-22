import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Address } from "@/hooks/usePortalData";
import { useEntities } from "@/hooks/usePortalData";

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddressForm = ({ address, onSubmit, onCancel, isLoading }: AddressFormProps) => {
  const { data: entities } = useEntities();
  
  const form = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: address?.label ?? "",
      type: address?.type ?? "home",
      street: address?.street ?? "",
      city: address?.city ?? "",
      state: address?.state ?? "",
      zip: address?.zip ?? "",
      country: address?.country ?? "United States",
      is_primary: address?.is_primary ?? false,
      entity_id: (address as any)?.entity_id ?? "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="entity_id" render={({ field }) => (
            <FormItem className="md:col-span-2">
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
          
          <FormField control={form.control} name="label" render={({ field }) => (
            <FormItem>
              <FormLabel>Label *</FormLabel>
              <FormControl><Input placeholder="Home Office" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          
          <FormField control={form.control} name="type" render={({ field }) => (
            <FormItem>
              <FormLabel>Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="home">Home</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="street" render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Street Address *</FormLabel>
              <FormControl><Input placeholder="123 Main Street, Suite 100" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="city" render={({ field }) => (
            <FormItem>
              <FormLabel>City *</FormLabel>
              <FormControl><Input placeholder="New York" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="state" render={({ field }) => (
            <FormItem>
              <FormLabel>State / Province</FormLabel>
              <FormControl><Input placeholder="NY" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="zip" render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP / Postal Code</FormLabel>
              <FormControl><Input placeholder="10001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="country" render={({ field }) => (
            <FormItem>
              <FormLabel>Country *</FormLabel>
              <FormControl><Input placeholder="United States" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="is_primary" render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3 md:col-span-2">
              <FormLabel className="cursor-pointer">Set as Primary Address</FormLabel>
              <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : address ? "Update Address" : "Add Address"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AddressForm;
