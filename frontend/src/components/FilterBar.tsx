"use client";
import DropDown from "./DropDown";
import { Option } from "@/types/option";
import { conditionOptions, typeOptions } from "@/types/itemDropdownOptions";

interface FilterBarProps {
  conditionFilter: Option | null;
  typeFilter: Option | null;
  handleConditionFilter: (value: Option | null) => void;
  handleTypeFilter: (value: Option | null) => void;
}

// FilterBar component renders dropdowns for filtering items by condition and type
export default function FilterBar(FilterBarProps: FilterBarProps) {
  const {
    conditionFilter,
    typeFilter,
    handleConditionFilter,
    handleTypeFilter,
  } = FilterBarProps;

  return (
    <section
      className="flex flex-col items-center gap-4 pt-6 py-8 lg:flex-row lg:gap-10"
      role="region"
      aria-label="Item filters for condition and type"
    >
      <DropDown
        label_text="Filtered Condition:"
        placeholder="Select Condition"
        options={conditionOptions}
        selectedOption={conditionFilter}
        setSelectedOption={(option) => handleConditionFilter(option)}
        isClearable={true}
        width="16rem"
      />
      <DropDown
        label_text="Filtered Type:"
        placeholder="Select Type"
        selectedOption={typeFilter}
        options={typeOptions}
        setSelectedOption={(option) => handleTypeFilter(option)}
        isClearable={true}
        width="16rem"
      />
    </section>
  );
}
