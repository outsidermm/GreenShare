const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface logoutResponse {
  message?: string;
  error?: string;
}

export default async function authUser() {
  try {
    const csrf_token = localStorage.getItem("csrfToken");

    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: logoutResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error during token validation:", error);
    return false;
  }
}
