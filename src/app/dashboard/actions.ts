'use server'

import { auth, signIn, signOut } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { TransactionSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function createTransaction(data: TransactionSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Create the transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: data.type,
        description: data.description,
        date: data.date,
        tags: data.tags || [],
        category: {
          connect: {
            id: data.categoryId,
          },
        },
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
      include: {
        category: true,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, transaction }
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return { error: 'Failed to create transaction' }
  }
}

export async function handleSignOut() {
  await signOut({
    redirectTo: '/login'
  })
}

export async function handleGitHubSignIn() {
  await signIn('github', { callbackUrl: '/dashboard' })
}

export async function getDashboardData() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth() + 1
    const currentYear = currentDate.getFullYear()

    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true,
      },
      take: 5, // Only get the 5 most recent transactions
    })

    // Calculate total income and expenses
    const totalIncome = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'INCOME',
      },
      _sum: {
        amount: true,
      },
    })

    const totalExpenses = await prisma.transaction.aggregate({
      where: {
        userId: session.user.id,
        type: 'EXPENSE',
      },
      _sum: {
        amount: true,
      },
    })

    // Get expenses by category for the current month
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId: session.user.id,
        type: 'EXPENSE',
        date: {
          gte: new Date(currentYear, currentMonth - 1, 1),
          lt: new Date(currentYear, currentMonth, 1),
        },
      },
      _sum: {
        amount: true,
      },
    })

    // Get budgets for the current month
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id,
        month: currentMonth,
        year: currentYear,
      },
      include: {
        category: true,
      },
    })

    // Get category names and combine with budget information
    const categoriesWithExpenses = await Promise.all(
      expensesByCategory.map(async (expense) => {
        const category = await prisma.category.findUnique({
          where: { id: expense.categoryId },
        })
        const budget = budgets.find((b) => b.categoryId === expense.categoryId)
        const amount = expense._sum.amount || 0

        return {
          name: category?.name || 'Unknown',
          amount,
          budget: budget?.amount || 0,
          progress: budget ? (amount / budget.amount) * 100 : 0,
        }
      })
    )

    return {
      recentTransactions: transactions,
      stats: {
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
        balance: (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0),
        expensesByCategory: categoriesWithExpenses,
      },
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    return { error: 'Failed to fetch dashboard data' }
  }
}
