export function getMinMaxDateRange(minDays = 0, maxDays = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minDays);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + maxDays);

  const format = (date) => date.toISOString().split('T')[0];

  return {
    min: format(minDate),
    max: format(maxDate),
  };
}
