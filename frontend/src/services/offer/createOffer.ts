import { StandardBackendResponse } from "@/types/standardBackendResponse";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Define the input structure required to create a new offer
interface createOfferInput {
  requestedItemId: number;
  offeredItemIds: number[];
  message: string;
}

// Function to send a POST request to the backend to create a new offer
export default async function createOffer(
  input: createOfferInput,
): Promise<StandardBackendResponse> {
  try {
    // Retrieve CSRF token from localStorage for secure request authentication
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Construct the request payload from input values
    const data = {
      requestedItemId: input.requestedItemId,
      offeredItemIds: input.offeredItemIds,
      message: input.message,
    };

    // Make a POST request to the backend API endpoint with payload and headers
    const response = await fetch(`${API_BASE}/offer/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    // If response is not OK, parse and throw the error returned from the backend
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the successful response as a typed object
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and rethrow any error that occurs during the request for further handling
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
