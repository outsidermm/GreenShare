import { Offer } from "@/types/offer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default async function getOfferDetail(offerId: number): Promise<Offer> {
  try {
    const params: URLSearchParams = new URLSearchParams();
    params.append("offerId", offerId.toString());

    const response = await fetch(
      `${API_BASE}/offer/details?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: Offer = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
