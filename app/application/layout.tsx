import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Application - Rivio Trade Credit Insurance',
  description: 'Complete your application for the Rivio trade credit insurance interview.',
}

export default function ApplicationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
