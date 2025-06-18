const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Represents a single address prediction from the autocomplete API
interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

// Describes the expected structure of the API response for address predictions
interface AutocompleteResponse {
  predictions: PlacePrediction[];
  status: string;
}

// Calls the backend autocomplete API to fetch address predictions based on user input
export default async function autocompleteAddress(
  input: string,
): Promise<PlacePrediction[]> {
  if (!input || input.length < 3) {
    return []; // Return empty array if input is too short
  }

  try {
    const response = await fetch(`${API_BASE}/api/autocomplete`, {
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

    const data: AutocompleteResponse = await response.json();
    console.log("Autocomplete response:", data);
    return data.predictions;
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error);
    return [];
  }
}
