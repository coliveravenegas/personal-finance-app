'use client'

import { updateBudget } from '@/app/dashboard/budgets/actions'
import { BudgetSchema } from '@/app/dashboard/budgets/schema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Budget } from '@prisma/client'
import { BudgetForm } from './budget-form'

interface BudgetDialogProps {
  budget?: (BudgetSchema & { id: string }) | null
  isOpen?: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (budget: BudgetSchema & { id: string }) => void
}

export function BudgetDialog({ budget, isOpen, onOpenChange, onSuccess }: BudgetDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{budget ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
          <DialogDescription>
            {budget
              ? 'Edit your budget details below.'
              : 'Add a new budget to track your spending.'}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          onSuccess={(savedBudget) => {
            onSuccess?.(savedBudget)
            onOpenChange(false)
          }}
          budget={budget as Budget}
          action={budget ? updateBudget : undefined}
        />
      </DialogContent>
    </Dialog>
  )
}
