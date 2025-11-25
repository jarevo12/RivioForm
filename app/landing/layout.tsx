import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Help Build a Future Where Businesses Can Confidently Sell on Terms',
  description: '',
}

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
