import { z } from 'zod'

export const budgetSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Amount must be positive')
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places
  categoryId: z.string({
    required_error: 'Please select a category',
  }),
  month: z.coerce
    .number()
    .min(1, 'Month must be between 1 and 12')
    .max(12, 'Month must be between 1 and 12'),
  year: z.coerce
    .number()
    .min(2024, 'Year must be 2024 or later')
    .max(2100, 'Year must be before 2100'),
})

export type BudgetSchema = z.infer<typeof budgetSchema>
