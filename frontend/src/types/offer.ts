export interface Offer {
  id: number;
  offered_by_id: number;
  message: string;
  status: string;
  created_at: string;
  offered_item_ids: number[];
  requested_item_id: number;
}