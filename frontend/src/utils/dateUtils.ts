// typescript
// dateUtils.ts

/**
 * Formats an ISO date string to a human-readable format (e.g., "19 Sep 2025")
 * @param dateString ISO date string (e.g., "2025-09-19T05:17:29.439Z")
 * @returns Formatted date string in "DD MMM YYYY" format
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Formats an ISO date string to include both date and time (e.g., "19 Sep 2025, 07:17")
 * @param dateString ISO date string (e.g., "2025-09-19T05:17:29.439Z")
 * @returns Formatted date-time string in "DD MMM YYYY, HH:mm" format
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Formats an ISO date string to a time-only format (e.g., "07:17")
 * @param dateString ISO date string (e.g., "2025-09-19T05:17:29.439Z")
 * @returns Formatted time string in "HH:mm" format
 */
export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Invalid Time';
  }
};

/**
 * Checks if a date string is valid
 * @param dateString ISO date string
 * @returns Boolean indicating if the date is valid
 */
export const isValidDate = (dateString: string): boolean => {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
};
