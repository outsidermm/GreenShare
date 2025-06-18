// Converts a string to title case format.
// Example: "hello-world" or "my_string value" => "Hello World"
// Handles separators like spaces, hyphens, and underscores.
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s\-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
