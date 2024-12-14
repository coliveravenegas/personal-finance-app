'use client'

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
import { Input } from '@/components/ui/input'
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
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import * as Icons from 'lucide-react'
import { ArrowUpDown, Edit, MoreHorizontal, Plus, Trash } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { CategoryDialog } from './_components/category-dialog'
import { deleteCategory, getCategories } from './actions'
import { CategoryFormValues } from './schema'

type Category = CategoryFormValues & {
  id: string
  isDefault: boolean
}

export default function CategoriesPage() {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [defaultCategories, setDefaultCategories] = useState<Category[]>([])
  const [customCategories, setCustomCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const loadCategories = useMemo(
    () => async () => {
      const result = await getCategories()
      if (result.defaultCategories && result.customCategories) {
        setDefaultCategories(result.defaultCategories as Category[])
        setCustomCategories(result.customCategories as Category[])
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result.error || 'Failed to load categories',
        })
      }
      setIsLoading(false)
    },
    [setDefaultCategories, setCustomCategories, toast, setIsLoading]
  )

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  async function handleDelete(category: Category) {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  async function confirmDelete() {
    if (!categoryToDelete) return

    const result = await deleteCategory(categoryToDelete.id)
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })
      loadCategories()
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to delete category',
      })
    }
    setDeleteDialogOpen(false)
    setCategoryToDelete(null)
  }

  function handleEdit(category: Category) {
    setSelectedCategory(category)
    setDialogOpen(true)
  }

  function handleDialogClose() {
    setDialogOpen(false)
    setSelectedCategory(null)
    loadCategories()
  }

  const getIcon = (iconName: string) => {
    const Icon = Icons[iconName as keyof typeof Icons] as
      | React.ComponentType<React.SVGProps<SVGSVGElement>>
      | undefined
    return Icon ? <Icon className="h-4 w-4" /> : null
  }

  const defaultColumns: ColumnDef<Category>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="-ml-4"
          >
            Type
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div>{row.getValue('type')}</div>,
    },
    {
      accessorKey: 'icon',
      header: 'Icon',
      cell: ({ row }) => {
        const Icon = getIcon(row.getValue('icon'))
        return <div>{Icon}</div>
      },
    },
  ]

  const customColumns: ColumnDef<Category>[] = [
    ...defaultColumns,
    {
      id: 'actions',
      cell: ({ row }) => {
        const category = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(category)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(category)}>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const defaultTable = useReactTable({
    data: defaultCategories,
    columns: defaultColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  const customTable = useReactTable({
    data: customCategories,
    columns: customColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center">Loading categories...</div>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-4xl font-bold">Categories</h1>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Default Categories */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold">Default Categories</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                These categories are available to all users and cannot be modified.
              </p>

              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Filter by name..."
                  value={(defaultTable.getColumn('name')?.getFilterValue() as string) ?? ''}
                  onChange={(event) =>
                    defaultTable.getColumn('name')?.setFilterValue(event.target.value)
                  }
                  className="max-w-sm"
                />

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {defaultTable.getHeaderGroups().map((headerGroup) => (
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
                      {defaultTable.getRowModel().rows?.length ? (
                        defaultTable.getRowModel().rows.map((row) => (
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
                          <TableCell colSpan={defaultColumns.length} className="h-24 text-center">
                            No default categories available.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </Card>

          {/* Custom Categories */}
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold">Custom Categories</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                These are your personal categories that you can modify anytime.
              </p>

              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Filter by name..."
                    value={(customTable.getColumn('name')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                      customTable.getColumn('name')?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                  />
                  <select
                    value={(customTable.getColumn('type')?.getFilterValue() as string) ?? ''}
                    onChange={(event) =>
                      customTable.getColumn('type')?.setFilterValue(event.target.value)
                    }
                    className="rounded-md border px-3 py-2"
                  >
                    <option value="">All Types</option>
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      {customTable.getHeaderGroups().map((headerGroup) => (
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
                      {customTable.getRowModel().rows?.length ? (
                        customTable.getRowModel().rows.map((row) => (
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
                          <TableCell colSpan={customColumns.length} className="h-24 text-center">
                            No custom categories yet. Click &quot;Add Category&quot; to create one.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <CategoryDialog
          key={selectedCategory ? 'edit-category-' + selectedCategory.id : 'create-category'}
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          category={selectedCategory}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the category &quot;{categoryToDelete?.name}&quot;. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
