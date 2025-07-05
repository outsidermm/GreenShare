import { StandardBackendResponse } from "@/types/standardBackendResponse";

// Define the base URL for the backend API, pulled from environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Function to handle user reset password by sending email to the backend
export default async function forgotPwd(
  email: string,
): Promise<StandardBackendResponse> {
  try {
    // Send POST request with email to the reset password endpoint
    const response = await fetch(`${API_BASE}/auth/forgot_pwd`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    // If the forgot password fails, extract and throw the backend error message
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: StandardBackendResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and rethrow any error to be handled by the calling UI
    console.error("Error during login:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
