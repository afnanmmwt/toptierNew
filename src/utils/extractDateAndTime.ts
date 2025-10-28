// utils/dateUtils.ts

export const extractDateTime = (isoString: string) => {
  if (!isoString) return { date: "", time: "" };

  try {
    const dateObj = new Date(isoString);

    const date = dateObj.toISOString().split("T")[0]; // "YYYY-MM-DD"
    const time = dateObj.toISOString().split("T")[1].slice(0, 5); // "HH:MM"

    return { date, time };
  } catch (error) {
    console.error("Invalid ISO string:", error);
    return { date: "", time: "" };
  }
};
