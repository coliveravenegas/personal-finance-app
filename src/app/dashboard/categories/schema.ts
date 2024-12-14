import { z } from 'zod'

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces'),
  type: z.enum(['INCOME', 'EXPENSE'], {
    required_error: 'Please select a category type',
  }),
  icon: z
    .string()
    .min(1, 'Please enter an icon name')
    .max(50, 'Icon name must be less than 50 characters')
    .regex(/^[a-zA-Z]+$/, 'Icon name must contain only letters'),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
