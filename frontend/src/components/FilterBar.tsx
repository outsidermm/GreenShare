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

export default function FilterBar(FilterBarProps: FilterBarProps) {
  const {
    conditionFilter,
    typeFilter,
    handleConditionFilter,
    handleTypeFilter,
  } = FilterBarProps;

  return (
    <div className="flex flex-col items-center gap-4 py-8 lg:flex-row lg:gap-10">
      <DropDown
        label_text="Filtered Condition:"
        placeholder="Select Condition"
        options={conditionOptions}
        selectedOption={conditionFilter}
        setSelectedOption={(option) => handleConditionFilter(option)}
        isClearable={true}
      />
      <DropDown
        label_text="Filtered Type:"
        placeholder="Select Type"
        selectedOption={typeFilter}
        options={typeOptions}
        setSelectedOption={(option) => handleTypeFilter(option)}
        isClearable={true}
      />
    </div>
  );
}
