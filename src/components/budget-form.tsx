'use client'

import { createBudget } from '@/app/dashboard/budgets/actions'
import { BudgetSchema, budgetSchema } from '@/app/dashboard/budgets/schema'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  icon?: string | null
  isDefault: boolean
}

interface BudgetFormProps {
  onSuccess?: (budget: BudgetSchema & { id: string }) => void
  budget?: BudgetSchema & { id: string }
  action?: (
    id: string,
    data: BudgetSchema
  ) => Promise<{ success?: boolean; error?: string; budget?: BudgetSchema & { id: string } }>
}

export function BudgetForm({ onSuccess, budget, action }: BudgetFormProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<BudgetSchema>({
    resolver: zodResolver(budgetSchema),
    defaultValues: budget || {
      amount: 0,
      categoryId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
  })

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()

        if (data.error) {
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Failed to load categories',
          })
          return
        }

        setCategories(data.categories)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to load categories',
        })
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [toast])

  // Filter categories to only show expense categories
  const expenseCategories = categories.filter((category) => category.type === 'EXPENSE')

  async function onSubmit(data: BudgetSchema) {
    try {
      const result = budget && action ? await action(budget.id, data) : await createBudget(data)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
        return
      }

      if (!result.budget) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong. Please try again.',
        })
        return
      }

      toast({
        title: 'Success',
        description: budget ? 'Budget updated successfully' : 'Budget added successfully',
      })

      form.reset()
      onSuccess?.(result.budget)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      })
      console.error(error)
    }
  }

  if (isLoading) {
    return <div className="text-center">Loading categories...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  {...field}
                >
                  <option value="">Select a category</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormDescription>Select an expense category for this budget.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Month</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    {...field}
                  >
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date(2024, i)
                      return (
                        <option key={i + 1} value={i + 1}>
                          {date.toLocaleString('default', { month: 'long' })}
                        </option>
                      )
                    })}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    {...field}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      )
                    })}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? budget
              ? 'Saving...'
              : 'Adding...'
            : budget
              ? 'Save Budget'
              : 'Add Budget'}
        </Button>
      </form>
    </Form>
  )
}
