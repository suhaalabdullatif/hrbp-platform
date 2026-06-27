// Converts a Date (from timestamp columns) to an ISO string for API responses.
export function iso(d: Date): string {
  return d.toISOString();
}

export function isoOrNull(d: Date | null): string | null {
  return d == null ? null : d.toISOString();
}
