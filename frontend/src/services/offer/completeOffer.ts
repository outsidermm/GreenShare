import { StandardBackendResponse } from "@/types/standardBackendResponse";
// Define the base URL for API calls from the environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Sends a POST request to mark an offer as complete using its offer ID
export default async function completeOffer(
  offerId: number,
): Promise<StandardBackendResponse> {
  try {
    // Retrieve the CSRF token from localStorage to ensure request authenticity
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Construct the payload containing the offer ID
    const data = {
      offerId: offerId,
    };

    // Execute a POST request to the backend API with the offer data and CSRF token
    const response = await fetch(`${API_BASE}/offer/exchange_complete`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    // Handle unsuccessful responses by throwing an error with details from the server
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the server response as a typed object
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Catch and log any errors encountered during the process for debugging
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
