import { Option } from "./option";

export const conditionOptions: Array<Option> = [
  { value: "new", label: "New" },
  { value: "like-new", label: "Like New" },
  { value: "used-good", label: "Used - Good" },
  { value: "used-fair", label: "Used - Fair" },
  { value: "poor", label: "Poor" },
];

export const typeOptions: Array<Option> = [
  { value: "Free", label: "Free to Claim" },
  { value: "Exchange", label: "Exchange via Offer" },
];
