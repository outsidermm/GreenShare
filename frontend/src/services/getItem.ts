import { Item } from "@/types/item";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface getItemInput {
  category?: string;
  condition?: string;
  location?: string;
  type?: string;
  title?: string;
  item_id?: string;
  user_id?: string;
}

export default async function getItem({
  category,
  condition,
  location,
  type,
  title,
  item_id,
  user_id,
}: getItemInput): Promise<Item[]> {
  try {
    const params: URLSearchParams = new URLSearchParams();
    if (category) params.append("category", category);
    if (condition) params.append("condition", condition);
    if (location) params.append("location", location);
    if (type) params.append("type", type);
    if (title) params.append("title", title);
    if (item_id) params.append("id", item_id);
    if (user_id) params.append("user_id", user_id);

    const response = await fetch(`${API_BASE}/items?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: Item[] = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
