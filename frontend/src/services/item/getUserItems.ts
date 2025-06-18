import { Item } from "@/types/item";

// Retrieve the base URL for the backend API from environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Fetches items specific to the logged-in user from the backend API.
// Requires a valid CSRF token and includes credentials for session validation.
export default async function getUserItems(): Promise<Item[]> {
  try {
    // Attempt to retrieve the CSRF token from local storage for request authentication
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Perform a GET request to the user-specific item endpoint with necessary headers
    const response = await fetch(`${API_BASE}/item/userview`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
    });

    // Handle server-side errors by parsing the response and throwing a descriptive error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse the JSON response and return the list of items to the caller
    const result: Item[] = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log any client-side or network errors and rethrow for caller-level handling
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
