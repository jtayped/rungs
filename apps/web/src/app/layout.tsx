import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import Script from 'next/script'
import { MotionConfig } from '~/components/motion-config'
import { env } from '~/env'
import { ANALYTICS_PATH } from '~/lib/track'
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
      <body>
        {/* Animations made with motion follow the system's reduce-motion setting. */}
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
        {env.NEXT_PUBLIC_UMAMI_HOST && env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ? (
          <Script
            src={`${ANALYTICS_PATH}/script.js`}
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
            // Only the site's own domain reports, so the same build served from
            // localhost sends nothing.
            data-domains={new URL(env.SITE_URL).hostname}
          />
        ) : null}
      </body>
    </html>
  )
}
