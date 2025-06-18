// ItemFilter defines optional query parameters used to filter items in the GreenShare platform's search or browse features.
export interface ItemFilter {
  category?: string;
  condition?: string;
  type?: string;
  title?: string;
  item_id?: number;
}
