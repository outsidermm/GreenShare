import { StandardBackendResponse } from "@/types/standardBackendResponse";

// Set the base URL for API calls using the public environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Function to authenticate the current user session via CSRF token validation
export default async function authUser(): Promise<StandardBackendResponse> {
  try {
    // Attempt to retrieve CSRF token from local storage; throw error if not found
    const csrf_token = localStorage.getItem("csrfToken");

    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Send a POST request to the backend to validate the session using the CSRF token
    const response = await fetch(`${API_BASE}/auth/validate`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
    });

    // If the response is not OK, extract and throw the error message from the backend
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the validated user session response
    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Catch and log any errors during the validation process and rethrow for handling
    console.error("Error during token validation:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
