const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface loginResponse {
    csrf_token:string;
}

export default async function loginUser(email: string, password: string): Promise<string> {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        // Check if the response is not OK 
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Unknown error occurred');
        }

        const result: loginResponse = await response.json(); // Parse JSON response
        console.log('Response from server:', result);
        return result.csrf_token;
    } catch (error) {
        console.error('Error during login:', error);
        throw error; // Re-throw the error so it can be displayed in the UI
    }
}