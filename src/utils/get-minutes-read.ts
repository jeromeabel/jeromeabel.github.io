import getReadingTime from "reading-time";

export function getMinutesReadFromBody(body: string | undefined): string {
  if (!body) {
    return "";
  }

  return getReadingTime(body, { wordsPerMinute: 120 }).text;
}

export function getMinutesFromBody(body: string | undefined): number {
  if (!body) {
    return 0;
  }

  return getReadingTime(body, { wordsPerMinute: 120 }).minutes;
}
