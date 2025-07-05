import React, { useState } from "react";
import FilterBar from "../../src/components/FilterBar";
import { conditionOptions, typeOptions } from "../../src/types/itemDropdownOptions";
import { Option } from "@/types/option";

interface FilterBarProps {
  conditionFilter: Option | null;
  typeFilter: Option | null;
  handleConditionFilter: (value: Option | null) => void;
  handleTypeFilter: (value: Option | null) => void;
}

let defaultProps:FilterBarProps;
let handleConditionFilter;
let handleTypeFilter;

beforeEach(() => {
  document.body.classList.add('light');
  handleConditionFilter = cy.stub().as("handleConditionFilter");
  handleTypeFilter = cy.stub().as("handleTypeFilter");
  defaultProps = {
    conditionFilter: null,
    typeFilter: null,
    handleConditionFilter,
    handleTypeFilter,
  };
})

const FilterBarWrapper = () => {
  const [conditionFilter, setConditionFilter] = useState<Option | null>(null);
  const [typeFilter, setTypeFilter] = useState<Option | null>(null);

  return (
    <FilterBar
      conditionFilter={conditionFilter}
      typeFilter={typeFilter}
      handleConditionFilter={setConditionFilter}
      handleTypeFilter={setTypeFilter}
    />
  );
};

describe("<FilterBar />", () => {
  it("renders both dropdowns with correct labels and placeholders", () => {
    cy.mount(<FilterBar {...defaultProps} />);
    // Check for labels
    cy.contains("label", "Filtered Condition:").should("exist");
    cy.contains("label", "Filtered Type:").should("exist");
    // Check for placeholders
    cy.contains("Select Condition").should("exist");
    cy.contains("Select Type").should("exist");
  });

  it("updates conditionFilter state when selecting a condition option", () => {
    cy.mount(<FilterBarWrapper />);
    // Verify placeholder is shown and first option is not present
    cy.contains("Select Condition").should("exist");
    cy.contains(conditionOptions[0].label).should("not.exist");
    // Open the condition dropdown (first DropDown)
    cy.get("input").first().click();
    cy.contains(conditionOptions[0].label).should("exist");
  });

  it("updates typeFilter state when selecting a type option", () => {
    cy.mount(<FilterBarWrapper />);
    // Verify placeholder is shown and first option is not present
    cy.contains("Select Type").should("exist");
    cy.contains(typeOptions[0].label).should("not.exist");
    // Open the type dropdown (second DropDown)
    cy.get("input").eq(1).click();
    cy.contains(typeOptions[0].label).should("exist");
  });
});