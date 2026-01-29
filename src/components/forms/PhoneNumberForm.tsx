import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { phoneNumberSchema, PhoneNumberFormData } from "@/lib/formSchemas";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEntities } from "@/hooks/usePortalData";
import type { PhoneNumber } from "@/hooks/usePortalData";
import PhoneNumberEntityAffiliationsManager from "./PhoneNumberEntityAffiliationsManager";

interface PhoneNumberFormProps {
  phoneNumber?: PhoneNumber | null;
  defaultEntityId?: string;
  onSubmit: (data: PhoneNumberFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const countryCodes = [
  { code: "+54", country: "Argentina", label: "Argentina (+54)" },
  { code: "+374", country: "Armenia", label: "Armenia (+374)" },
  { code: "+61", country: "Australia", label: "Australia (+61)" },
  { code: "+43", country: "Austria", label: "Austria (+43)" },
  { code: "+994", country: "Azerbaijan", label: "Azerbaijan (+994)" },
  { code: "+973", country: "Bahrain", label: "Bahrain (+973)" },
  { code: "+375", country: "Belarus", label: "Belarus (+375)" },
  { code: "+32", country: "Belgium", label: "Belgium (+32)" },
  { code: "+55", country: "Brazil", label: "Brazil (+55)" },
  { code: "+359", country: "Bulgaria", label: "Bulgaria (+359)" },
  { code: "+1", country: "Canada", label: "Canada (+1)" },
  { code: "+56", country: "Chile", label: "Chile (+56)" },
  { code: "+86", country: "China", label: "China (+86)" },
  { code: "+57", country: "Colombia", label: "Colombia (+57)" },
  { code: "+385", country: "Croatia", label: "Croatia (+385)" },
  { code: "+357", country: "Cyprus", label: "Cyprus (+357)" },
  { code: "+420", country: "Czech Republic", label: "Czech Republic (+420)" },
  { code: "+45", country: "Denmark", label: "Denmark (+45)" },
  { code: "+20", country: "Egypt", label: "Egypt (+20)" },
  { code: "+372", country: "Estonia", label: "Estonia (+372)" },
  { code: "+358", country: "Finland", label: "Finland (+358)" },
  { code: "+33", country: "France", label: "France (+33)" },
  { code: "+995", country: "Georgia", label: "Georgia (+995)" },
  { code: "+49", country: "Germany", label: "Germany (+49)" },
  { code: "+30", country: "Greece", label: "Greece (+30)" },
  { code: "+852", country: "Hong Kong", label: "Hong Kong (+852)" },
  { code: "+36", country: "Hungary", label: "Hungary (+36)" },
  { code: "+354", country: "Iceland", label: "Iceland (+354)" },
  { code: "+91", country: "India", label: "India (+91)" },
  { code: "+62", country: "Indonesia", label: "Indonesia (+62)" },
  { code: "+353", country: "Ireland", label: "Ireland (+353)" },
  { code: "+972", country: "Israel", label: "Israel (+972)" },
  { code: "+39", country: "Italy", label: "Italy (+39)" },
  { code: "+81", country: "Japan", label: "Japan (+81)" },
  { code: "+7", country: "Kazakhstan", label: "Kazakhstan (+7)" },
  { code: "+254", country: "Kenya", label: "Kenya (+254)" },
  { code: "+965", country: "Kuwait", label: "Kuwait (+965)" },
  { code: "+371", country: "Latvia", label: "Latvia (+371)" },
  { code: "+423", country: "Liechtenstein", label: "Liechtenstein (+423)" },
  { code: "+370", country: "Lithuania", label: "Lithuania (+370)" },
  { code: "+352", country: "Luxembourg", label: "Luxembourg (+352)" },
  { code: "+60", country: "Malaysia", label: "Malaysia (+60)" },
  { code: "+356", country: "Malta", label: "Malta (+356)" },
  { code: "+52", country: "Mexico", label: "Mexico (+52)" },
  { code: "+377", country: "Monaco", label: "Monaco (+377)" },
  { code: "+212", country: "Morocco", label: "Morocco (+212)" },
  { code: "+31", country: "Netherlands", label: "Netherlands (+31)" },
  { code: "+64", country: "New Zealand", label: "New Zealand (+64)" },
  { code: "+234", country: "Nigeria", label: "Nigeria (+234)" },
  { code: "+47", country: "Norway", label: "Norway (+47)" },
  { code: "+968", country: "Oman", label: "Oman (+968)" },
  { code: "+51", country: "Peru", label: "Peru (+51)" },
  { code: "+63", country: "Philippines", label: "Philippines (+63)" },
  { code: "+48", country: "Poland", label: "Poland (+48)" },
  { code: "+351", country: "Portugal", label: "Portugal (+351)" },
  { code: "+974", country: "Qatar", label: "Qatar (+974)" },
  { code: "+40", country: "Romania", label: "Romania (+40)" },
  { code: "+7", country: "Russia", label: "Russia (+7)" },
  { code: "+966", country: "Saudi Arabia", label: "Saudi Arabia (+966)" },
  { code: "+65", country: "Singapore", label: "Singapore (+65)" },
  { code: "+421", country: "Slovakia", label: "Slovakia (+421)" },
  { code: "+386", country: "Slovenia", label: "Slovenia (+386)" },
  { code: "+27", country: "South Africa", label: "South Africa (+27)" },
  { code: "+82", country: "South Korea", label: "South Korea (+82)" },
  { code: "+34", country: "Spain", label: "Spain (+34)" },
  { code: "+46", country: "Sweden", label: "Sweden (+46)" },
  { code: "+41", country: "Switzerland", label: "Switzerland (+41)" },
  { code: "+886", country: "Taiwan", label: "Taiwan (+886)" },
  { code: "+66", country: "Thailand", label: "Thailand (+66)" },
  { code: "+90", country: "Turkey", label: "Turkey (+90)" },
  { code: "+971", country: "UAE", label: "UAE (+971)" },
  { code: "+380", country: "Ukraine", label: "Ukraine (+380)" },
  { code: "+44", country: "United Kingdom", label: "United Kingdom (+44)" },
  { code: "+1", country: "United States", label: "United States (+1)" },
  { code: "+998", country: "Uzbekistan", label: "Uzbekistan (+998)" },
  { code: "+84", country: "Vietnam", label: "Vietnam (+84)" },
];

// Helper to find country by code (returns first match, typically for editing existing records)
const findCountryByCode = (code: string) => {
  return countryCodes.find(c => c.code === code)?.country || "United States";
};

// Helper to find code by country name
const findCodeByCountry = (country: string) => {
  return countryCodes.find(c => c.country === country)?.code || "+1";
};

const PhoneNumberForm = ({ phoneNumber, defaultEntityId, onSubmit, onCancel, isLoading }: PhoneNumberFormProps) => {
  const { data: entities } = useEntities();
  
  // Convert the stored country_code to a country name for the form's internal state
  const initialCountry = phoneNumber?.country_code 
    ? findCountryByCode(phoneNumber.country_code)
    : "United States";
  
  const form = useForm<PhoneNumberFormData & { selected_country: string }>({
    resolver: zodResolver(phoneNumberSchema),
    defaultValues: {
      entity_id: phoneNumber?.entity_id ?? defaultEntityId ?? "",
      phone_number: phoneNumber?.phone_number ?? "",
      country_code: phoneNumber?.country_code ?? "+1",
      label: phoneNumber?.label ?? "Main",
      purpose: phoneNumber?.purpose ?? "",
      is_primary: phoneNumber?.is_primary ?? false,
    },
  });

  const handleCountryChange = (countryName: string) => {
    const code = findCodeByCountry(countryName);
    form.setValue("country_code", code);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="entity_id" render={({ field }) => (
          <FormItem>
            <FormLabel>Entity</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity (optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="__none__">None</SelectItem>
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
          <FormField control={form.control} name="country_code" render={({ field }) => (
            <FormItem>
              <FormLabel>Country Code *</FormLabel>
              <Select 
                onValueChange={(countryName) => {
                  handleCountryChange(countryName);
                }} 
                defaultValue={initialCountry}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countryCodes.map((country) => (
                    <SelectItem key={country.country} value={country.country}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="phone_number" render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number *</FormLabel>
              <FormControl>
                <Input placeholder="555-123-4567" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField control={form.control} name="label" render={({ field }) => (
            <FormItem>
              <FormLabel>Label *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select label" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Main">Main</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Fax">Fax</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  <SelectItem value="Billing">Billing</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="purpose" render={({ field }) => (
            <FormItem>
              <FormLabel>Purpose</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Customer inquiries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="is_primary" render={({ field }) => (
          <FormItem className="flex items-center justify-between rounded-lg border p-3">
            <FormLabel className="cursor-pointer">Primary Number</FormLabel>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )} />

        {/* Show affiliations manager only when editing existing phone number */}
        {phoneNumber?.id && (
          <div className="border-t pt-4 mt-4">
            <PhoneNumberEntityAffiliationsManager phoneNumberId={phoneNumber.id} />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : phoneNumber ? "Update Phone" : "Add Phone"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PhoneNumberForm;
