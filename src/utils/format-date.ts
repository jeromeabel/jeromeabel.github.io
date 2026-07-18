const dateOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

export const getFormattedDate = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", dateOptions);

const monthYearOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
};

export const getMonthYear = (date: string | Date) =>
  new Date(date).toLocaleDateString("en-GB", monthYearOptions);
