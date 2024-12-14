'use client'

import { createTransaction } from '@/app/dashboard/actions'
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
import { TransactionSchema, transactionSchema } from '@/lib/schemas'
import { Transaction } from '@/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  icon?: string | null
  isDefault: boolean
}

interface TransactionFormProps {
  onSuccess?: () => void
  transaction?: Transaction
  action?: (id: string, data: TransactionSchema) => Promise<{ success?: boolean; error?: string }>
}

export function TransactionForm({ onSuccess, transaction, action }: TransactionFormProps) {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const form = useForm<TransactionSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: transaction
      ? {
          amount: transaction.amount,
          type: transaction.type,
          categoryId: transaction.category.id,
          description: transaction.description,
          date: transaction.date,
          tags: transaction.tags,
        }
      : {
          amount: 0,
          type: 'EXPENSE',
          categoryId: '',
          description: '',
          date: new Date(),
          tags: [],
        },
  })

  // Get the current transaction type
  const transactionType = form.watch('type')

  // Load categories from the API
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

  // Filter categories based on transaction type
  const filteredCategories = categories.filter((category) => category.type === transactionType)

  async function onSubmit(data: TransactionSchema) {
    try {
      const result =
        transaction && action
          ? await action(transaction.id, data)
          : await createTransaction(data as TransactionSchema)

      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error,
        })
        return
      }

      toast({
        title: 'Success',
        description: transaction
          ? 'Transaction updated successfully'
          : 'Transaction added successfully',
      })

      form.reset()
      onSuccess?.()
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
        <div className="grid grid-cols-2 gap-4">
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    {...field}
                  >
                    <option value="EXPENSE">Expense</option>
                    <option value="INCOME">Income</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter description"
                  {...field}
                  value={field.value}
                  onChange={field.onChange}
                  type="text"
                />
              </FormControl>
              <FormDescription>Brief description of the transaction.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {transaction
            ? !form.formState.isSubmitting
              ? 'Update Transaction'
              : 'Updating...'
            : !form.formState.isSubmitting
              ? 'Add Transaction'
              : 'Adding...'}
        </Button>
      </form>
    </Form>
  )
}
