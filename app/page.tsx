import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { ExpenseTracker } from '@/components/expense-tracker'
import { UserProfile } from '@/components/auth/user-profile'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Financer - Personal Finance Manager',
  description: 'Track and manage your personal finances with ease',
}

type Props = {
  searchParams?: Promise<{ tab?: string }>
}

export default async function Home(props: Props) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies()

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

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  const validTabs = ['expenses', 'income', 'accounts', 'loans', 'recurring']
  const activeTab = searchParams?.tab && validTabs.includes(searchParams.tab)
    ? searchParams.tab
    : 'expenses'

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Financer</h1>
        <UserProfile user={session.user} />
      </div>
      <ExpenseTracker activeTab={activeTab} />
    </div>
  )
}

