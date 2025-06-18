import { Offer } from "@/types/offer";

// Base URL for the backend API, retrieved from environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Asynchronously fetch detailed information about a specific offer by its ID
export default async function getOfferDetail(offerId: number): Promise<Offer> {
  try {
    // Prepare query parameters with the offer ID
    const params: URLSearchParams = new URLSearchParams();
    params.append("offerId", offerId.toString());

    // Send a GET request to retrieve offer details from the server
    const response = await fetch(
      `${API_BASE}/offer/details?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    // If the response is not OK, parse the error and throw an appropriate exception
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse the JSON response into the expected Offer object type
    const result: Offer = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Catch and log any errors encountered during the fetch operation
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
