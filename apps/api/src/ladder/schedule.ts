// Dates are plain YYYY-MM-DD strings in UTC, so they compare as strings.

export const today = (now = new Date()) => now.toISOString().slice(0, 10)

// A ladder dated in the future doesn't exist yet as far as players can tell.
export const isOut = (ladder: { date: string }, day: string) => ladder.date <= day
