import { Offer } from "@/types/offer";
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface getUserOffersResponse {
    outgoingOffers: Offer[];
    incomingOffers: Offer[];
}

export default async function getUserOffers(): Promise<getUserOffersResponse> {
  try {
        const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    const response = await fetch(`${API_BASE}/offer/userview`, {
      method: "GET",
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

    const result: getUserOffersResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
