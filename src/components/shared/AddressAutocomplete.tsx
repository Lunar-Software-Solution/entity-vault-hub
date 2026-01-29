import { useState, useCallback, useEffect } from "react";
import { SearchBox } from "@mapbox/search-js-react";

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
  const [inputValue, setInputValue] = useState(value);

  // Keep local state in sync with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle selection from SearchBox
  const handleRetrieve = useCallback((result: any) => {
    console.log("SearchBox onRetrieve:", result);
    
    if (!result?.features?.[0]) return;
    
    const feature = result.features[0];
    const props = feature.properties || {};
    const context = props.context || {};
    
    // Extract address components from the result
    const addressData: AddressData = {
      street: props.name || props.address || inputValue,
      city: context.place?.name || context.locality?.name || props.place || "",
      state: context.region?.name || context.region?.region_code || props.region || "",
      zip: context.postcode?.name || props.postcode || "",
      country: context.country?.name || props.country || "",
    };
    
    console.log("Mapped address:", addressData);
    
    // Update values
    setInputValue(addressData.street);
    onChange(addressData.street);
    onAddressSelect(addressData);
  }, [inputValue, onChange, onAddressSelect]);

  const inputClassName = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

  if (!MAPBOX_TOKEN) {
    return (
      <input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange(e.target.value);
        }}
        placeholder={placeholder}
        disabled={disabled}
        className={inputClassName}
      />
    );
  }

  return (
    <div className="address-searchbox-wrapper">
      <SearchBox
        accessToken={MAPBOX_TOKEN}
        value={inputValue}
        onChange={(val) => {
          setInputValue(val);
          onChange(val);
        }}
        onRetrieve={handleRetrieve}
        placeholder={placeholder}
        options={{
          language: "en",
          country: "US,CA,GB,AU,NZ,IE,SG,HK,FR,DE,BG,NL",
          types: "address",
        }}
      />
      <style>{`
        .address-searchbox-wrapper .mapboxgl-ctrl-geocoder {
          width: 100%;
          max-width: none;
          min-width: 0;
          font-family: inherit;
        }
        .address-searchbox-wrapper .mapboxgl-ctrl-geocoder--input {
          height: 40px;
          padding: 8px 12px;
          font-size: 14px;
          border: 1px solid hsl(var(--input));
          border-radius: 6px;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        .address-searchbox-wrapper .mapboxgl-ctrl-geocoder--input:focus {
          outline: none;
          ring: 2px solid hsl(var(--ring));
          border-color: hsl(var(--ring));
        }
        .address-searchbox-wrapper .mapboxgl-ctrl-geocoder--icon {
          display: none;
        }
        .address-searchbox-wrapper .mapboxgl-ctrl-geocoder--button {
          display: none;
        }
        .address-searchbox-wrapper .suggestions-wrapper {
          background: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          z-index: 9999;
        }
        .address-searchbox-wrapper .suggestion {
          padding: 8px 12px;
          cursor: pointer;
          color: hsl(var(--popover-foreground));
        }
        .address-searchbox-wrapper .suggestion:hover,
        .address-searchbox-wrapper .suggestion--selected {
          background: hsl(var(--accent));
        }
      `}</style>
    </div>
  );
};

export default AddressAutocomplete;
