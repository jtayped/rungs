import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { env } from '~/env'
import './globals.css'

// SF on Apple devices, Geist everywhere else.
const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

// Pages set only a title and description. Next copies those into og:* and
// twitter:*, and a page that set its own `openGraph` would replace this one
// whole, og:image included.
export const metadata: Metadata = {
  metadataBase: new URL(env.SITE_URL),
  title: { default: 'rungs · a writing game', template: '%s · rungs' },
  description:
    'a writing game. you get one rule and write until it holds. then the next rule arrives, and every rule before it has to keep holding.',
  openGraph: { siteName: 'rungs', type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body>{children}</body>
    </html>
  )
}
