import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rivio - Trade Credit Insurance Compliance',
  description: 'Trade Credit Insurance Compliance, Simplified',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
