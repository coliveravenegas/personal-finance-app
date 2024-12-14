import { auth } from '@/app/auth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { handleSignOut } from './actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  // Get user's initials for avatar fallback
  const initials = session!.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                Finance Tracker
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/transactions"
                className="text-sm font-medium hover:text-primary"
              >
                Transactions
              </Link>
              <Link href="/dashboard/budgets" className="text-sm font-medium hover:text-primary">
                Budgets
              </Link>
              <Link href="/dashboard/categories" className="text-sm font-medium hover:text-primary">
                Categories
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session!.user?.image || undefined}
                        alt={session!.user?.name || ''}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session!.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session!.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    asChild
                  >
                    <form className="w-full">
                      <button formAction={handleSignOut} className="flex w-full items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  )
}
