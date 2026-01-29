import { useRef, useEffect, useCallback } from "react";
import { AddressAutofill } from "@mapbox/search-js-react";

interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (data: AddressData) => void;
  placeholder?: string;
  disabled?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const AddressAutocomplete = ({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Start typing an address...",
  disabled = false,
}: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Sync external value to input
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value;
    }
  }, [value]);

  // Handle autofill retrieve event - this fires when user selects an address
  const handleRetrieve = useCallback((res: any) => {
    if (!res?.features?.[0]?.properties) return;
    
    const props = res.features[0].properties;
    
    // Map Mapbox properties to our schema
    const addressData: AddressData = {
      street: props.address_line1 || props.full_address?.split(",")[0] || "",
      city: props.address_level2 || props.place || props.locality || "",
      state: props.address_level1 || props.region || "",
      zip: props.postcode || "",
      country: props.country || "",
    };
    
    // Update the input value with the street address
    if (inputRef.current) {
      inputRef.current.value = addressData.street;
    }
    onChange(addressData.street);
    
    // Call the parent handler to fill other fields
    onAddressSelect(addressData);
  }, [onChange, onAddressSelect]);

  // Handle input changes for manual typing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  if (!MAPBOX_TOKEN) {
    return (
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
      />
    );
  }

  return (
    <form ref={formRef} className="relative" onSubmit={(e) => e.preventDefault()}>
      <AddressAutofill
        accessToken={MAPBOX_TOKEN}
        onRetrieve={handleRetrieve}
        options={{
          language: "en",
          country: "US,CA,GB,AU,NZ,IE,SG,HK,FR,DE",
        }}
      >
        <input
          ref={inputRef}
          defaultValue={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="street-address"
          name="street-address"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      </AddressAutofill>
      
      {/* Hidden inputs for autofill to populate */}
      <input type="hidden" autoComplete="address-level2" name="city" />
      <input type="hidden" autoComplete="address-level1" name="state" />
      <input type="hidden" autoComplete="postal-code" name="postal-code" />
      <input type="hidden" autoComplete="country-name" name="country" />
    </form>
  );
};

export default AddressAutocomplete;
