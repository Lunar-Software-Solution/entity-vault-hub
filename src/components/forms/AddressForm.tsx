import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addressSchema, AddressFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { Address } from "@/hooks/usePortalData";
import { countries } from "@/lib/countries";
import AddressEntityAffiliationsManager from "./AddressEntityAffiliationsManager";
import AddressAutocomplete from "@/components/shared/AddressAutocomplete";

interface AddressFormProps {
  address?: Address | null;
  onSubmit: (data: AddressFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const AddressForm = ({ address, onSubmit, onCancel, isLoading }: AddressFormProps) => {
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
    },
  });

  const handleAddressSelect = (data: { street: string; city: string; state: string; zip: string; country: string }) => {
    form.setValue("street", data.street, { shouldValidate: true });
    form.setValue("city", data.city, { shouldValidate: true });
    form.setValue("state", data.state, { shouldValidate: true });
    form.setValue("zip", data.zip, { shouldValidate: true });
    if (data.country) {
      // Try to match with our countries list
      const matchedCountry = countries.find(c => 
        c.toLowerCase() === data.country.toLowerCase() ||
        c.toLowerCase().includes(data.country.toLowerCase()) ||
        data.country.toLowerCase().includes(c.toLowerCase())
      );
      if (matchedCountry) {
        form.setValue("country", matchedCountry, { shouldValidate: true });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <FormControl>
                <AddressAutocomplete
                  value={field.value}
                  onChange={field.onChange}
                  onAddressSelect={handleAddressSelect}
                  placeholder="Start typing an address..."
                />
              </FormControl>
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="text-foreground"><SelectValue placeholder="Select country" /></SelectTrigger></FormControl>
                <SelectContent className="max-h-60">
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* Entity Affiliations Section */}
        {address?.id && (
          <>
            <Separator className="my-6" />
            <AddressEntityAffiliationsManager addressId={address.id} />
          </>
        )}

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
