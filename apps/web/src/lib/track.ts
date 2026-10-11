// Umami's script and its endpoint are served from this origin, under a name
// that blockers don't match the way they match an analytics host.
export const ANALYTICS_PATH = '/_a'

type Data = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: { track: (name: string, data?: Data) => void }
  }
}

// An event for Umami. Without the script (not configured, or blocked) it does
// nothing. Never pass draft text, names or emails.
export const track = (name: string, data?: Data) => window.umami?.track(name, data)
