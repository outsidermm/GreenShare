"use client";

import { Option } from "@/types/option";
import { OnChangeValue } from "react-select";
import dynamic from "next/dynamic";

// Dynamic import with SSR disabled
export const Select = dynamic(() => import("react-select"), {
  ssr: false,
});

interface DropDownProps {
  selectedOption: Option | null;
  setSelectedOption: (option: Option | null) => void;
  options: Array<Option>;
  label_text: string;
  placeholder: string;
  styles?: object;
  required?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  noOptionsMessage?: () => string;
  loadingMessage?: () => string;
  onInputChange?: (inputValue: string) => void;
  isLoading?: boolean;
}

DropDown.defaultProps = {
  required: true,
  isClearable: false,
  isSearchable: false,
  noOptionsMessage: () => "",
  loadingMessage: () => "",
  onInputChange: () => {},
  isLoading: undefined,
};

export default function DropDown(props: DropDownProps) {
  const handleSetOptions = (option: Option | unknown) => {
    if ((option === null && !props.isClearable) || option === undefined) {
      throw new Error("Selected option is null or undefined");
    }
    setSelectedOption(option as Option);
  };
  const {
    selectedOption,
    setSelectedOption,
    options,
    label_text,
    placeholder,
  } = props;
  return (
    <>
      <label className="block mb-2 text-content">{label_text}</label>
      <Select
        className="z-40"
        options={options}
        value={selectedOption}
        onChange={(option: OnChangeValue<unknown, false>) =>
          handleSetOptions(option)
        }
        onInputChange={props.onInputChange}
        placeholder={placeholder}
        required={props.required}
        isClearable={props.isClearable}
        isSearchable={props.isSearchable}
        noOptionsMessage={props.noOptionsMessage}
        loadingMessage={props.loadingMessage}
        styles={
          props.styles || {
            control: (base, state) => ({
              ...base,
              border: state.isFocused ? "none" : "2px solid #64748b", // slate-400
              borderRadius: "0.5rem",
              fontSize: "1rem",
              boxShadow: state.isFocused ? "0 0 0 2px #22c55e" : "none", // green-400 outline ring
            }),
            option: (base, { isFocused, isSelected }) => ({
              ...base,
              backgroundColor: isSelected
                ? "#4ade80" // green-400
                : isFocused
                  ? "#bbf7d0" // green-100
                  : "white",
              color: isSelected || isFocused ? "#1e293b" : "#334155", // slate-800 or slate-700
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
              color: "#64748b", // slate-500
            }),
            singleValue: (base) => ({
              ...base,
              color: "#1e293b", // slate-800
            }),
          }
        }
      />
    </>
  );
}
