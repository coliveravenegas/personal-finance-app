import { auth } from '@/app/auth'
import { LoginForm } from '@/components/login-form'
import { Card } from '@/components/ui/card'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-[400px] p-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold">Welcome to Finance Tracker</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage your personal finances</p>
        </div>

        <LoginForm />
      </Card>
    </div>
  )
}
