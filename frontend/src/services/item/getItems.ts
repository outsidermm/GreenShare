import { Item } from "@/types/item";
import { ItemFilter } from "@/types/itemFilter";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default async function getItems({
  category,
  condition,
  type,
  title,
  item_id,
}: ItemFilter): Promise<Item[]> {
  try {
    const params: URLSearchParams = new URLSearchParams();
    if (category) params.append("category", category);
    if (condition) params.append("condition", condition);
    if (type) params.append("type", type);
    if (title) params.append("title", title);
    if (item_id) params.append("id", item_id.toString());

    const response = await fetch(`${API_BASE}/item?${params.toString()}`, {
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
