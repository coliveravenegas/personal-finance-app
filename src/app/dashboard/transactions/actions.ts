'use server'

import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { TransactionSchema } from '@/lib/schemas'
import { revalidatePath } from 'next/cache'

export async function createTransaction(data: TransactionSchema) {
  const session = await auth()

  try {
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    await prisma.transaction.create({
      data: {
        ...data,
        userId: session!.user.id,
      },
    })

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Failed to create transaction:', error)
    return { error: 'Failed to create transaction' }
  }
}

export async function updateTransaction(id: string, data: TransactionSchema) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction || transaction.userId !== session!.user.id) {
      return { error: 'Transaction not found or unauthorized' }
    }

    await prisma.transaction.update({
      where: { id },
      data,
    })

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Failed to update transaction:', error)
    return { error: 'Failed to update transaction' }
  }
}

export async function deleteTransaction(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    })

    if (!transaction || transaction.userId !== session!.user.id) {
      return { error: 'Transaction not found or unauthorized' }
    }

    await prisma.transaction.delete({
      where: { id },
    })

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete transaction:', error)
    return { error: 'Failed to delete transaction' }
  }
}

export async function getTransactions() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session!.user.id,
      },
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true,
      },
    })

    return { transactions }
  } catch (error) {
    console.error('Failed to fetch transactions:', error)
    return { error: 'Failed to fetch transactions' }
  }
}
