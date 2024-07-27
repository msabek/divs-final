'use client';

import './globals.css'
import { Inter } from 'next/font/google'
import { useEffect } from 'react'
import ChatbotScript from '../components/ChatbotScript'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    require('leaflet/dist/leaflet.css')
  }, [])

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
          <footer className="py-4 text-center bg-gray-100">
            © 2024 Disaster Information Verification System
          </footer>
        </div>
        <ChatbotScript />
      </body>
    </html>
  )
}
