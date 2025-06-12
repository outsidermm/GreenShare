import { StandardBackendResponse } from "@/types/standardBackendResponse";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;


export default async function acceptOffer(offerId : number): Promise<StandardBackendResponse> {
  try {
        const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    const data = {
      offerId: offerId,
    };

    const response = await fetch(`${API_BASE}/offer/accept`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrf_token,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: StandardBackendResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
