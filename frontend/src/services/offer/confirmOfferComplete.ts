import { StandardBackendResponse } from "@/types/standardBackendResponse";
// Define the base URL for backend API calls using environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Function to confirm the completion of an offer exchange
export default async function confirmOfferComplete(
  offerId: number,
): Promise<StandardBackendResponse> {
  try {
    // Retrieve CSRF token from local storage to include in the request header for security
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Prepare the payload with the offer ID to be sent in the POST request
    const data = {
      offerId: offerId,
    };

    // Send POST request to backend endpoint with CSRF token and offer data
    const response = await fetch(`${API_BASE}/offer/exchange_confirmed`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    // If the response is not OK, throw an error using the response message or a default one
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the successful response from the backend
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and rethrow any error encountered during the API request
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
