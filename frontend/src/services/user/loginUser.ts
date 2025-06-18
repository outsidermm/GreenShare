// Define the base URL for the backend API, pulled from environment variables
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Expected shape of the login response object
interface loginResponse {
  csrf_token: string;
}

// Function to handle user login by sending credentials to the backend
export default async function loginUser(
  email: string,
  password: string,
): Promise<string> {
  try {
    // Send POST request with email and password to the login endpoint
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    // If the login fails, extract and throw the backend error message
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse the server's JSON response to retrieve the CSRF token
    const result: loginResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result.csrf_token;
  } catch (error) {
    // Log and rethrow any error to be handled by the calling UI
    console.error("Error during login:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
