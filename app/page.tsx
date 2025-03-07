import ExpenseTracker from "@/components/expense-tracker"

export default function Home() {
  return (
    <main className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Financial Tracker</h1>
      <ExpenseTracker />
    </main>
  )
}

