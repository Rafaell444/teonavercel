import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import {
  Inter,
  Playfair_Display,
  Geist_Mono,
  Noto_Sans_Georgian,
  Noto_Serif_Georgian,
} from 'next/font/google'
import './globals.css'

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] })
// Inter and Playfair have no Georgian letters. Without these two, Georgian text
// falls back to whatever each visitor's device happens to have installed, so the
// site looked different on every phone. They sit second in the font stacks
// (see globals.css), so Latin text is unchanged and only Georgian uses them.
const georgianSans = Noto_Sans_Georgian({
  variable: '--font-georgian-sans',
  subsets: ['georgian'],
  display: 'swap',
})
const georgianSerif = Noto_Serif_Georgian({
  variable: '--font-georgian-serif',
  subsets: ['georgian'],
  display: 'swap',
})
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Ascend — Premium Coaching & Therapy',
  description:
    'Transformative one-on-one coaching, group seminars, and therapy. Book a session and unlock your next level.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      // Georgian is the default language; the language switcher updates this on the client
      lang="ka"
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} ${georgianSans.variable} ${georgianSerif.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
