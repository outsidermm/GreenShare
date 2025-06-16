const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface searchItemResponse {
  predictions: string[];
}

export default async function autocompleteAddress(
  input: string,
): Promise<searchItemResponse> {
  if (!input || input.length < 3) {
    return { predictions: [] }; // Return empty array if input is too short
  }

  try {
    const response = await fetch(`${API_BASE}/api/item_search`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const data: searchItemResponse = await response.json();
    console.log("Item search response:", data.predictions);
    return data;
  } catch (error) {
    console.error("Error fetching item search suggestions:", error);
    return { predictions: [] }; // Return empty array on error
  }
}
