// Item interface defines the shape of a product object listed on the GreenShare platform
export interface Item {
  id: number;
  user_id: number;
  title: string;
  description: string;
  condition: string;
  status: string;
  location: string;
  category: string;
  type: string;
  updated_at: string;
  images: string[];
}
