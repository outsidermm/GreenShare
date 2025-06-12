const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface createOfferInput {
    requestedItemId: string;
    offeredItemIds: string[];
    message: string;
}

interface createOfferResponse {
  message?: string;
  error?: string;
}

export default async function createOffer(input : createOfferInput): Promise<createOfferResponse> {
  try {
        const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    const data = {
      requestedItemId: input.requestedItemId,
      offeredItemIds: input.offeredItemIds,
      message: input.message,
    };

    const response = await fetch(`${API_BASE}/offer/create`, {
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

    const result: createOfferResponse = await response.json();
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error fetching item:", error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
}
