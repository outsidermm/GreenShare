import { StandardBackendResponse } from "@/types/standardBackendResponse";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Asynchronously sends a DELETE request to remove an item from the backend by its item ID.
// Uses CSRF token for security and returns a standardised backend response.
export default async function deleteItem(
  item_id: number,
): Promise<StandardBackendResponse> {
  try {
    // Retrieve the CSRF token from local storage to include in the request header
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Prepare the request payload with the item ID to delete
    const data = {
      id: item_id,
    };

    // Perform the DELETE request to the backend endpoint with proper headers and CSRF token
    const response = await fetch(`${API_BASE}/item/delete`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    // If the response is not OK, parse and throw the error for handling
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the response from the server
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and rethrow any errors encountered during the request for external handling
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
