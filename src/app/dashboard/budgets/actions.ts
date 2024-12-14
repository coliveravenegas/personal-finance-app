'use server'

import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BudgetSchema } from './schema'

export async function createBudget(data: BudgetSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // First, verify that the category exists and belongs to the user or is default
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        type: 'EXPENSE',
        OR: [{ userId: session.user.id }, { isDefault: true }],
      },
    })

    if (!category) {
      return { error: 'Category not found' }
    }

    // Check if a budget already exists for this category and month/year
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: session.user.id,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
    })

    if (existingBudget) {
      return { error: 'A budget already exists for this category in the selected month/year' }
    }

    // Create the budget
    const budget = await prisma.budget.create({
      data: {
        amount: data.amount,
        month: data.month,
        year: data.year,
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

    revalidatePath('/dashboard/budgets')
    return { success: true, budget }
  } catch (error) {
    console.error('Failed to create budget:', error)
    return { error: 'Failed to create budget' }
  }
}

export async function updateBudget(id: string, data: BudgetSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // First, verify that the category exists and belongs to the user or is default
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        type: 'EXPENSE',
        OR: [{ userId: session!.user.id }, { isDefault: true }],
      },
    })

    if (!category) {
      return { error: 'Category not found' }
    }

    const budget = await prisma.budget.findUnique({
      where: { id },
    })

    if (!budget || budget.userId !== session!.user.id) {
      return { error: 'Budget not found or unauthorized' }
    }

    // Check if another budget exists for this category and month/year
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: session!.user.id,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
        NOT: {
          id: budget.id,
        },
      },
    })

    if (existingBudget) {
      return { error: 'A budget already exists for this category in the selected month/year' }
    }

    // Update the budget
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        amount: data.amount,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
      },
      include: {
        category: true,
      },
    })

    revalidatePath('/dashboard/budgets')
    return { success: true, budget: updatedBudget }
  } catch (error) {
    console.error('Failed to update budget:', error)
    return { error: 'Failed to update budget' }
  }
}

export async function deleteBudget(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const budget = await prisma.budget.findUnique({
      where: { id },
    })

    if (!budget || budget.userId !== session!.user.id) {
      return { error: 'Budget not found or unauthorized' }
    }

    await prisma.budget.delete({
      where: { id },
    })

    revalidatePath('/dashboard/budgets')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete budget:', error)
    return { error: 'Failed to delete budget' }
  }
}

export async function getBudgets() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const budgets = await prisma.budget.findMany({
      where: {
        userId: session!.user.id,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        category: true,
      },
    })

    return { budgets }
  } catch (error) {
    console.error('Failed to fetch budgets:', error)
    return { error: 'Failed to fetch budgets' }
  }
}
