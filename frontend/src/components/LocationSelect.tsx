"use client";

import { useState, useEffect } from "react";
import useDebounce from "@/hooks/useDebounce";
import autocompleteAddress from "@/services/api/autocompleteAddress";
import DropDown from "./DropDown";
import { Option } from "@/types/option";

interface LocationSelectProps {
  value: Option | null;
  onChange: (value: Option | null) => void;
  placeholder?: string;
  required?: boolean;
}

export default function LocationSelect(input: LocationSelectProps) {
  const { value, onChange, placeholder, required } = input;
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Option[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedInputValue = useDebounce(inputValue, 200);

  useEffect(() => {
    const fetchOptions = async () => {
      if (debouncedInputValue.length < 3) {
        setOptions([]);
        return;
      }

      setIsLoading(true);
      try {
        const predictions = await autocompleteAddress(debouncedInputValue);
        const newOptions =
          predictions?.map((prediction) => ({
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

    fetchOptions();
  }, [debouncedInputValue]);

  return (
    <DropDown
      selectedOption={value}
      setSelectedOption={onChange}
      options={options}
      label_text="Location"
      placeholder={placeholder || "Search for a location..."}
      isClearable
      isSearchable
      noOptionsMessage={() =>
        inputValue.length < 3
          ? "Type at least 3 characters to search"
          : "No locations found"
      }
      loadingMessage={() => "Searching locations..."}
      onInputChange={setInputValue}
      isLoading={isLoading}
      required={required || true}
    />
  );
}
