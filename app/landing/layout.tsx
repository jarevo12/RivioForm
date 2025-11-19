import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rivio - Trade Credit Insurance Compliance Simplified',
  description: 'Help us improve trade credit insurance management. Share your insights in a 30-minute interview and receive a $50 Amazon gift card.',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
