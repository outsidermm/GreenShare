"use client";

import { useState, useEffect } from "react";
import autocompleteAddress from "@/services/autocompleteAddress";
import dynamic from 'next/dynamic';
import { OnChangeValue } from "react-select";

// Dynamic import with SSR disabled
const Select = dynamic(() => import('react-select'), { 
  ssr: false 
});

interface Option {
  value: string;
  label: string;
}

interface LocationSelectProps {
  value?: Option | null;
  onChange: (value: Option | null) => void;
}

const LocationSelect = ({ value, onChange }: LocationSelectProps) => {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      if (inputValue.length < 3) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const predictions = await autocompleteAddress(inputValue);
        const newOptions = predictions?.map((prediction) => ({
          value: prediction.place_id,
          label: prediction.description,
        })) || [];
        setOptions(newOptions);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchOptions();
    }, 150); // Debounce to avoid too many API calls

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleChange = (
    newValue: OnChangeValue<unknown, false>,
  ) => {
    onChange(newValue as Option | null);
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={handleChange}
      onInputChange={setInputValue}
      isLoading={isLoading}
      placeholder="Search for a location..."
      isClearable
      isSearchable
      required
      noOptionsMessage={() =>
        inputValue.length < 3
          ? "Type at least 3 characters to search"
          : "No locations found"
      }
      loadingMessage={() => "Searching locations..."}
      styles={{
        control: (base, state) => ({
          ...base,
          border: state.isFocused ? "none" : "2px solid #64748b",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          boxShadow: state.isFocused ? "0 0 0 2px #22c55e" : "none",
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected
            ? "#4ade80"
            : isFocused
            ? "#bbf7d0"
            : "white",
          color: isSelected || isFocused ? "#1e293b" : "#334155",
          fontWeight: isSelected ? "600" : "400",
          cursor: "pointer",
        }),
        menu: (base) => ({
          ...base,
          borderRadius: "0.5rem",
          overflow: "hidden",
          boxShadow: "0 0 0 1px #94a3b8",
        }),
        placeholder: (base) => ({
          ...base,
          color: "#64748b",
        }),
        singleValue: (base) => ({
          ...base,
          color: "#1e293b",
        }),
      }}
    />
  );
};

export default LocationSelect;