import { getDashboardData } from '@/app/dashboard/actions'
import { AddTransactionDialog } from '@/components/add-transaction-dialog'
import { DashboardCharts } from '@/components/dashboard-charts'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export default async function DashboardPage() {
  const { recentTransactions, stats, error } = await getDashboardData()

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>
      </div>
    )
  }

  // Prepare data for charts
  const expenseChartData = stats?.expensesByCategory.map((category) => ({
    name: category.name,
    amount: category.amount,
  }))

  // Prepare time series data for line chart
  const timeSeriesData = recentTransactions?.map((t) => ({
    date: new Date(t.date).toLocaleDateString(),
    amount: t.type === 'INCOME' ? t.amount : -t.amount,
    type: t.type,
  }))

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <AddTransactionDialog />
      </div>

      {/* Stats Overview */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${stats?.totalIncome.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${stats?.totalExpenses.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
          {stats && (
            <p
              className={`text-2xl font-bold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              ${stats?.balance.toFixed(2)}
            </p>
          )}
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts expenseChartData={expenseChartData} timeSeriesData={timeSeriesData} />

      {/* Budget Progress */}
      <Card className="mb-8 p-6">
        <h2 className="mb-4 text-xl font-semibold">Monthly Budget Progress</h2>
        <div className="space-y-6">
          {stats?.expensesByCategory.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm text-muted-foreground">
                  ${category.amount.toFixed(2)} / ${category.budget.toFixed(2)}
                </span>
              </div>
              <Progress
                value={category.progress}
                className={category.progress > 100 ? 'bg-red-100' : ''}
                // indicatorClassName={category.progress > 100 ? 'bg-red-500' : ''}
              />
              {category.progress > 90 && (
                <p
                  className={`text-sm ${category.progress > 100 ? 'text-red-500' : 'text-yellow-500'}`}
                >
                  {category.progress > 100 ? 'Budget exceeded!' : 'Approaching budget limit'}
                </p>
              )}
            </div>
          ))}
          {stats?.expensesByCategory.length === 0 && (
            <p className="text-center text-muted-foreground">No budget data available.</p>
          )}
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Transactions</h2>
        <div className="divide-y">
          {recentTransactions?.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground">No transactions yet.</p>
          ) : (
            recentTransactions?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{transaction.category.name}</p>
                  <p className="text-sm text-muted-foreground">{transaction.description}</p>
                </div>
                <p
                  className={`font-medium ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaction.type === 'INCOME' ? '+' : '-'}${transaction.amount.toFixed(2)}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
