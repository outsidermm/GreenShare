const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface createItemInput {
  title: string;
  description: string;
  condition: string;
  location: string;
  images: File[];
  type: string;
}

interface createItemResponse {
  message?: string;
  error?: string;
}

export default async function createItem(
  input: createItemInput,
): Promise<createItemResponse> {
  try {
    const { title, description, condition, location, images, type } = input;
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("condition", condition);
    formData.append("location", location);
    formData.append("type", type);
    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await fetch(`${API_BASE}/item/create`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrf_token,
      },
      body: formData,
    });

    // Check if the response is not OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    const result: createItemResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error during item creation:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
