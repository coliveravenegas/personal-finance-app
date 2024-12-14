'use server'

import { auth } from '@/app/auth'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { CategoryFormValues } from './schema'

export async function createCategory(data: CategoryFormValues) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    await prisma.category.create({
      data: {
        ...data,
        userId: session!.user.id,
      },
    })

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    console.error('Failed to create category:', error)
    return { error: 'Failed to create category' }
  }
}

export async function updateCategory(id: string, data: CategoryFormValues) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category || category.userId !== session!.user.id) {
      return { error: 'Category not found or unauthorized' }
    }

    await prisma.category.update({
      where: { id },
      data,
    })

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    console.error('Failed to update category:', error)
    return { error: 'Failed to update category' }
  }
}

export async function deleteCategory(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
    })

    if (!category || category.userId !== session!.user.id) {
      return { error: 'Category not found or unauthorized' }
    }

    await prisma.category.delete({
      where: { id },
    })

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete category:', error)
    return { error: 'Failed to delete category' }
  }
}

export async function getCategories() {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Unauthorized' }
  }

  try {
    // Get default categories
    const defaultCategories = await prisma.category.findMany({
      where: {
        isDefault: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Get user's custom categories
    const customCategories = await prisma.category.findMany({
      where: {
        userId: session!.user.id,
        isDefault: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { defaultCategories, customCategories }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
    return { error: 'Failed to fetch categories' }
  }
}
