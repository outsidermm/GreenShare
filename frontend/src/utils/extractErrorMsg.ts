// extractErrorMessage takes an error string (usually from backend or thrown error),
// splits it at the first colon, and returns the rest of the message without the prefix.
// This helps in displaying cleaner, user-friendly error messages.
export function extractErrorMessage(input: string): string {
  const parts = input.split(":");
  return parts.slice(1).join(":").trim(); // handles cases with multiple colons
}
