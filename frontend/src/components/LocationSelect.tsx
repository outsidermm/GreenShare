"use client";

import { useState, useEffect } from "react";
import autocompleteAddress from "@/services/autocompleteAddress";
import DropDown from "./DropDown";
import { Option } from "@/types/option";

interface LocationSelectProps {
  value: Option | null;
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

    const timer = setTimeout(() => {
      fetchOptions();
    }, 150); // Debounce to avoid too many API calls

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <DropDown
      selectedOption={value}
      setSelectedOption={onChange}
      options={options}
      label_text="Location"
      placeholder="Search for a location..."
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
    />
  );
};

export default LocationSelect;
