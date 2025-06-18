import { StandardBackendResponse } from "@/types/standardBackendResponse";

// Base URL for the backend API, set from the environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Function to send a POST request to accept an offer with the specified ID
export default async function acceptOffer(
  offerId: number,
): Promise<StandardBackendResponse> {
  try {
    // Retrieve CSRF token from localStorage to include in the request headers
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Create the payload to be sent in the request body
    const data = {
      offerId: offerId,
    };

    // Send the POST request to the backend API with proper headers and body
    const response = await fetch(`${API_BASE}/offer/accept`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    // Handle any non-successful HTTP responses by extracting and throwing the error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the backend's JSON response as a StandardBackendResponse object
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Catch any network or logic errors and rethrow for handling by the caller
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
