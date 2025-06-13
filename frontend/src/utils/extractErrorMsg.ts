export function extractErrorMessage(input: string): string {
  const parts = input.split(":");
  return parts.slice(1).join(":").trim(); // handles cases with multiple colons
}