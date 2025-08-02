// utils/dateFormatter.js
export function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);

  const datePart = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const timePart = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return `${datePart} - ${timePart}`; // ➤ 21 Jul 2025 - 00:00
}
