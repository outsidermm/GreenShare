"use client";
import DropDown from "./DropDown";
import { Option } from "@/types/option";

interface FilterBarProps {
  conditionFilter: Option | null;
  typeFilter: Option | null;
  handleConditionFilter: (value: Option | null) => void;
  handleTypeFilter: (value: Option | null) => void;
}

export default function HeaderBar(FilterBarProps: FilterBarProps) {
  const {
    conditionFilter,
    typeFilter,
    handleConditionFilter,
    handleTypeFilter,
  } = FilterBarProps;

  const conditionOptions: Array<Option> = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "used-good", label: "Used - Good" },
    { value: "used-fair", label: "Used - Fair" },
    { value: "poor", label: "Poor" },
  ];

  const typeOptions: Array<Option> = [
    { value: "Free", label: "Free to Claim" },
    { value: "Exchange", label: "Exchange via Offer" },
  ];

  return (
    <div className="flex flex-row items-center gap-10 py-8">
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
