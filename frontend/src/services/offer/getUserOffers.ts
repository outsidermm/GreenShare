import { Offer } from "@/types/offer";
// Define the base URL for API calls, sourced from environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Structure of the response expected from the backend for user-specific offers
interface getUserOffersResponse {
  outgoingOffers: Offer[];
  incomingOffers: Offer[];
}

// Function to retrieve incoming and outgoing offers associated with the current user
export default async function getUserOffers(): Promise<getUserOffersResponse> {
  try {
    // Retrieve CSRF token from local storage to authenticate the request
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Perform a GET request to the backend endpoint for user-specific offer data
    const response = await fetch(`${API_BASE}/offer/userview`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
    });

    // Check if the response status is OK; otherwise, parse and throw the error message
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse the JSON response into the expected format and return it
    const result: getUserOffersResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and rethrow any error encountered during the request for error boundary handling
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
