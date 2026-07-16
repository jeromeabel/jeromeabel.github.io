import getReadingTime from "reading-time";

export function getMinutesReadFromBody(body: string | undefined): string {
  if (!body) {
    return "";
  }

  return getReadingTime(body, { wordsPerMinute: 120 }).text;
}