'use client'

import { updateTransaction } from '@/app/dashboard/transactions/actions'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Transaction } from '@/types'
import { TransactionForm } from './transaction-form'

interface EditTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: Transaction
  onSuccess?: () => void
}

export function EditTransactionDialog({
  open,
  onOpenChange,
  transaction,
  onSuccess,
}: EditTransactionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
          <DialogDescription>Make changes to your transaction here.</DialogDescription>
        </DialogHeader>
        <TransactionForm
          onSuccess={() => {
            onOpenChange(false)
            onSuccess?.()
          }}
          transaction={transaction}
          action={updateTransaction}
        />
      </DialogContent>
    </Dialog>
  )
}
