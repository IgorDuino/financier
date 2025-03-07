'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { User } from '@supabase/supabase-js'

export function UserProfile({ user }: { user: User }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{user.email}</span>
      </div>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  )
} 