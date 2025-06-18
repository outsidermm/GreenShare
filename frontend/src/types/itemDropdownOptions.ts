import { Option } from "./option";

// conditionOptions defines the available item condition categories users can select from when listing a product
export const conditionOptions: Array<Option> = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "used-good", label: "Used - Good" },
  { value: "used-fair", label: "Used - Fair" },
  { value: "poor", label: "Poor" },
];

// typeOptions defines the available item listing types (e.g., Free or Exchange) that users can choose from
export const typeOptions: Array<Option> = [
  { value: "Free", label: "Free to Claim" },
  { value: "Exchange", label: "Exchange via Offer" },
];
