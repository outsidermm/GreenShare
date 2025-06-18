import { Item } from "@/types/item";
import { ItemFilter } from "@/types/itemFilter";

// Base URL for backend API, injected via environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Fetches a list of items from the backend filtered by the given parameters.
// Constructs a URL query string based on provided filters.
export default async function getItems({
  category,
  condition,
  type,
  title,
  item_id,
}: ItemFilter): Promise<Item[]> {
  try {
    // Initialise and populate URL search parameters with optional filters
    const params: URLSearchParams = new URLSearchParams();
    if (category) params.append("category", category);
    if (condition) params.append("condition", condition);
    if (type) params.append("type", type);
    if (title) params.append("title", title);
    if (item_id) params.append("id", item_id.toString());

    // Perform GET request to the item API with the constructed query string
    const response = await fetch(`${API_BASE}/item?${params.toString()}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // If the response is not OK, extract the error message and throw it
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the JSON response as an array of Item objects
    const result: Item[] = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Catch and log any errors that occur during the fetch request
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
