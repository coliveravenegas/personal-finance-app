'use client'

import { handleGitHubSignIn } from '@/app/dashboard/actions'
import { Button } from '@/components/ui/button'
import { Github } from 'lucide-react'

export function LoginForm() {
  return (
    <form action={handleGitHubSignIn}>
      <Button type="submit" className="flex w-full items-center justify-center gap-2">
        <Github className="h-5 w-5" />
        Sign in with GitHub
      </Button>
    </form>
  )
}
