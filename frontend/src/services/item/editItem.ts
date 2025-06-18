import { StandardBackendResponse } from "@/types/standardBackendResponse";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Defines the structure of input data used to edit an existing item.
// All fields except 'id' are optional, allowing partial updates.
interface editItemInput {
  id: number;
  title?: string;
  description?: string;
  condition?: string;
  location?: string;
  images?: File[];
  type?: string;
}

// Sends a POST request to the backend to update item details.
// Uses multipart/form-data to include text fields and optional images.
export default async function editItem(
  input: editItemInput,
): Promise<StandardBackendResponse> {
  try {
    const { id, title, description, condition, location, images, type } = input;
    // Retrieve CSRF token from local storage for secure API interaction
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Populate FormData with provided fields and attach images if available
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

    // Send the POST request with FormData and CSRF token included in the headers
    const response = await fetch(`${API_BASE}/item/edit`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRF-Token": csrf_token,
      },
      body: formData,
    });

    // Check if the response is successful; if not, extract and throw the error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Unknown error occurred");
    }

    // Parse and return the server's JSON response
    const result: StandardBackendResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Log and re-throw any error that occurs for error handling in the UI
    console.error("Error during item creation:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
