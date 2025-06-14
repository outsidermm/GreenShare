import { StandardBackendResponse } from "@/types/standardBackendResponse";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface editItemInput {
  id: number;
  title?: string;
  description?: string;
  condition?: string;
  location?: string;
  images?: File[];
  type?: string;
}

export default async function editItem(
  input: editItemInput,
): Promise<StandardBackendResponse> {
  try {
    const { id, title, description, condition, location, images, type } = input;
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    const formData = new FormData();
    formData.append("id", id.toString());
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (condition) formData.append("condition", condition);
    if (location) formData.append("location", location);
    if (type) formData.append("type", type);
    if (images) {
      images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(`${API_BASE}/item/edit`, {
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

    const result: StandardBackendResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    console.error("Error during item creation:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
