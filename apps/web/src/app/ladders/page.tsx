import { permanentRedirect } from 'next/navigation'

// Every ladder is on the home page.
export default function Ladders() {
  permanentRedirect('/')
}
