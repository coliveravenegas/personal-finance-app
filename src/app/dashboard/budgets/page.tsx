'use client'

import { deleteBudget, getBudgets } from '@/app/dashboard/budgets/actions'
import { BudgetDialog } from '@/components/budget-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BudgetSchema } from './schema'

type Budget = BudgetSchema & {
  id: string
  category: {
    name: string
  }
}

export default function BudgetsPage() {
  const { toast } = useToast()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [editBudget, setEditBudget] = useState<Budget | null>(null)
  const [deleteBudgetConfirm, setDeleteBudget] = useState<Budget | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const loadBudgets = useMemo(() => {
    return async () => {
      const result = await getBudgets()
      if (result.budgets) {
        setBudgets(result.budgets)
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to load budgets',
        })
      }
    }
  }, [setBudgets, toast])

  useEffect(() => {
    loadBudgets()
  }, [loadBudgets])

  async function handleDelete() {
    if (!deleteBudgetConfirm) return

    const result = await deleteBudget(deleteBudgetConfirm.id)
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Budget deleted successfully',
      })
      setBudgets((prev) => prev.filter((b) => b.id !== deleteBudgetConfirm.id))
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to delete budget',
      })
    }

    setDeleteBudget(null)
  }

  const columns: ColumnDef<Budget>[] = [
    {
      accessorKey: 'category.name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Category
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const amount = row.getValue('amount') as number
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(amount)

        return <div>{formatted}</div>
      },
    },
    {
      accessorKey: 'month',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Month
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const month = row.getValue('month') as number
        const date = new Date(2024, month - 1)
        return <div>{date.toLocaleString('default', { month: 'long' })}</div>
      },
    },
    {
      accessorKey: 'year',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Year
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const budget = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditBudget(budget)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600" onClick={() => setDeleteBudget(budget)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: budgets,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-4xl font-bold">Budgets</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget
        </Button>
      </div>

      <Card>
        <div className="p-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No budgets found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>

      <BudgetDialog
        budget={editBudget}
        isOpen={!!editBudget}
        onOpenChange={(open) => {
          if (!open) {
            setEditBudget(null)
          }
        }}
        onSuccess={(updatedBudget) => {
          setBudgets((prev) =>
            prev.map((b) => (b.id === updatedBudget.id ? (updatedBudget as Budget) : b))
          )
          setEditBudget(null)
        }}
      />

      <BudgetDialog
        isOpen={createDialogOpen}
        onOpenChange={(open) => setCreateDialogOpen(open)}
        onSuccess={(newBudget) => {
          setBudgets((prev) => [...prev, newBudget as Budget])
          setCreateDialogOpen(false)
        }}
      />

      <AlertDialog
        open={!!deleteBudgetConfirm}
        onOpenChange={(open) => !open && setDeleteBudget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the budget for {deleteBudgetConfirm?.category.name} (
              {deleteBudgetConfirm?.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
              })}
              ).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
