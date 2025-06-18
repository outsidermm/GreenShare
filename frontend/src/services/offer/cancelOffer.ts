import { StandardBackendResponse } from "@/types/standardBackendResponse";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Define the shape of the input required to cancel an offer
interface cancelOfferInput {
  offerId: number;
  message: string;
}

// Sends a POST request to cancel an offer using the provided input
export default async function cancelOffer(
  input: cancelOfferInput,
): Promise<StandardBackendResponse> {
  try {
    // Retrieve CSRF token from local storage to protect against cross-site request forgery
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Prepare the request payload containing the offer ID and cancellation message
    const data = {
      offerId: input.offerId,
      message: input.message,
    };

    // Send a POST request to the /offer/cancel endpoint with appropriate headers and body
    const response = await fetch(`${API_BASE}/offer/cancel`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    // If the response status is not OK, parse and throw the server-provided error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the successful response as a StandardBackendResponse object
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and rethrow any errors that occur during the request for caller-level handling
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
