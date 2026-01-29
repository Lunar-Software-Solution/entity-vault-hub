import { useEffect, useRef, useState } from "react";
import { AddressAutofill } from "@mapbox/search-js-react";
import { Input } from "@/components/ui/input";

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
  const [isManualMode, setIsManualMode] = useState(!MAPBOX_TOKEN);
  const formRef = useRef<HTMLFormElement>(null);

  // Handle autofill retrieve event
  const handleRetrieve = (res: any) => {
    if (!res?.features?.[0]?.properties) return;
    
    const props = res.features[0].properties;
    
    // Map Mapbox properties to our schema
    const addressData: AddressData = {
      street: props.address_line1 || props.full_address?.split(",")[0] || value,
      city: props.place || props.locality || "",
      state: props.region || props.address_level1 || "",
      zip: props.postcode || "",
      country: props.country || "",
    };
    
    onAddressSelect(addressData);
  };

  if (isManualMode || !MAPBOX_TOKEN) {
    return (
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
        />
        {MAPBOX_TOKEN && (
          <button
            type="button"
            onClick={() => setIsManualMode(false)}
            className="text-xs text-primary hover:underline"
          >
            Use address autocomplete
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <form ref={formRef} className="relative">
        <AddressAutofill
          accessToken={MAPBOX_TOKEN}
          onRetrieve={handleRetrieve}
          options={{
            language: "en",
            country: "US,CA,GB,AU,NZ,IE,SG,HK",
          }}
        >
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="address-line1"
            className="w-full"
          />
        </AddressAutofill>
        
        {/* Hidden inputs for autofill to populate */}
        <input type="hidden" autoComplete="address-level2" id="city" />
        <input type="hidden" autoComplete="address-level1" id="state" />
        <input type="hidden" autoComplete="postal-code" id="zip" />
        <input type="hidden" autoComplete="country-name" id="country" />
      </form>
      
      <button
        type="button"
        onClick={() => setIsManualMode(true)}
        className="text-xs text-muted-foreground hover:text-foreground hover:underline"
      >
        Enter address manually
      </button>
    </div>
  );
};

export default AddressAutocomplete;
