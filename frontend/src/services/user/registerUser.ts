const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface registerUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface registerResponse {
  csrf_token: string;
}

export default async function registerUser(input: registerUserInput
): Promise<string> {
  const data = {
    email: input.email,
    password: input.password,
    firstName: input.firstName,
    lastName: input.lastName,
  };
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // Check if the response is not OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: registerResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result.csrf_token;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
