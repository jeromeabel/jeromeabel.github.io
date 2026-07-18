const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const getFormattedDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", dateOptions);
