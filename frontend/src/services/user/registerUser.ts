// Define the base URL for API requests from an environment variable
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Interface defining the expected structure of the registration input
interface registerUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Interface representing the expected structure of the server's response
interface registerResponse {
  csrf_token: string;
}

// Registers a new user by sending their data to the backend API
export default async function registerUser(
  input: registerUserInput,
): Promise<string> {
  // Construct the request payload from user input
  const data = {
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
  };
  try {
    // Send POST request to the registration endpoint with JSON payload
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // If the response indicates failure, extract and throw the error message
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse the JSON response and retrieve the CSRF token
    const result: registerResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result.csrf_token;
  } catch (error) {
    // Log and rethrow any errors encountered during registration
    console.error("Error during registration:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
