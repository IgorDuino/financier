import './globals.css'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Financer - Personal Finance Manager",
  description: "Track your expenses, income, and manage your finances with ease",
  authors: [{ name: "Igor" }],
  keywords: ["finance", "expense tracker", "money management", "personal finance"],
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { session } = await supabase.auth.getSession()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen bg-background">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
