import { StandardBackendResponse } from "@/types/standardBackendResponse";

// Define the base URL for API requests using an environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Logs the user out by sending a DELETE request to the backend with CSRF protection
export default async function logoutUser(): Promise<StandardBackendResponse> {
  try {
    // Retrieve CSRF token from local storage for authenticated request
    const csrf_token = localStorage.getItem("csrfToken");

    // Throw an error if no CSRF token is found in local storage
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Make a DELETE request to the logout endpoint with appropriate headers
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
    });

    // If the server responds with an error, extract and throw the error message
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the successful logout response from the server
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Catch and log any errors that occur during logout, rethrow for external handling
    console.error("Error during token validation:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
