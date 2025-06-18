import { StandardBackendResponse } from "@/types/standardBackendResponse";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// Defines the expected structure of the data required to create a new item on the GreenShare platform
interface createItemInput {
  title: string;
  description: string;
  condition: string;
  location: string;
  images: File[];
  type: string;
}

// Sends a POST request to the backend API to create a new item using multipart/form-data.
// Includes CSRF token validation and image uploads.
export default async function createItem(
  input: createItemInput,
): Promise<StandardBackendResponse> {
  try {
    const { title, description, condition, location, images, type } = input;
    const csrf_token = localStorage.getItem("csrfToken");
    if (!csrf_token) {
      throw new Error("No CSRF token found");
    }

    // Construct FormData object to include all necessary fields and attached images
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("condition", condition);
    formData.append("location", location);
    formData.append("type", type);
    images.forEach((file) => {
      formData.append("images", file);
    });

    // Execute the API call with CSRF token in headers and form data in the request body
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

    const result: StandardBackendResponse = await response.json(); // Parse JSON response
    console.log("Response from server:", result);
    return result;
  } catch (error) {
    // Handle and log any errors that occur during the API request
    console.error("Error during item creation:", error);
    throw error; // Re-throw the error so it can be displayed in the UI
  }
}
