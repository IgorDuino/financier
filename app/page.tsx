import ExpenseTracker from "@/components/expense-tracker"

type Props = {
  searchParams: { tab?: string }
}

export default function Home({ searchParams }: Props) {
  const validTabs = ["expenses", "income", "accounts", "loans", "recurring"]
  const activeTab = validTabs.includes(searchParams.tab || "") ? searchParams.tab : "expenses"

  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Financial Tracker</h1>
      <ExpenseTracker initialTab={activeTab} />
    </main>
  )
}

