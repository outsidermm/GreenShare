// Offer interface defines the structure of a user-generated offer on the GreenShare platform,
// representing a proposal to exchange specific items for another listed item.
export interface Offer {
  id: number;
  offered_by_id: number;
  message: string;
  status: string;
  created_at: string;
  offered_item_ids: number[];
  requested_item_id: number;
  requested_item_name: string;
  requested_item_location: string;
  offered_item_names: string[];
}
