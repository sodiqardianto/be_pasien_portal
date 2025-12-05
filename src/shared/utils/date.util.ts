/**
 * Format Date object to YYYY-MM-DD string
 * @param date - Date object or null
 * @returns Formatted date string or null
 */
export const formatDate = (date: Date | null | undefined): string | null => {
  if (!date) return null;
  return date.toISOString().split('T')[0];
};

/**
 * Parse YYYY-MM-DD string to Date object
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object or null
 */
export const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  return new Date(dateString);
};
