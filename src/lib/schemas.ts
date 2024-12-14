import { z } from 'zod'

const transactionTypes = ['INCOME', 'EXPENSE'] as const

export const transactionSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places
  type: z.enum(transactionTypes, {
    required_error: 'Please select a transaction type',
  }),
  categoryId: z.string({
    required_error: 'Please select a category',
  }),
  description: z.string().min(3, 'Description must be at least 3 characters').max(100),
  date: z.coerce.date({
    required_error: 'Please select a date',
    invalid_type_error: "That's not a valid date!",
  }),
  tags: z.array(z.string()).default([]),
})

export type TransactionSchema = z.infer<typeof transactionSchema>
