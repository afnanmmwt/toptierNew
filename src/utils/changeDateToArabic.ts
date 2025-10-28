function formatDateToArabic(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("ar", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
export default formatDateToArabic;
