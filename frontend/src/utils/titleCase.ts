export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/[\s\-_]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function decodeHtmlEntities(str: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}

export function toTitleCaseWithDecode(str: string): string {
  const decoded = decodeHtmlEntities(str);
  return toTitleCase(decoded);
}
