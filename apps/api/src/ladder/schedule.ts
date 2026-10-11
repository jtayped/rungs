// Dates are plain YYYY-MM-DD strings in UTC, so they compare as strings.

export const today = (now = new Date()) => now.toISOString().slice(0, 10)

// A ladder dated in the future can't be opened. The collection shows only its
// date and size.
export const isOut = (ladder: { date: string }, day: string) => ladder.date <= day
