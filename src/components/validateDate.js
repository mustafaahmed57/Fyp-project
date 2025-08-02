// validateDate.js

export function validateDateInRange(dateStr, { minDays = 0, maxDays = 2 } = {}) {
  const selected = new Date(dateStr);
  selected.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  if (selected < minDate) return { valid: false, message: `Date cannot be before today` };
  if (selected > maxDate) return { valid: false, message: `Date cannot be more than ${maxDays} days ahead` };

  return { valid: true };
}
