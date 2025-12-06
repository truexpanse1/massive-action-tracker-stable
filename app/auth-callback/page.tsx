'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function AuthCallback() {
  useEffect(() => {
    const supabase = createClient()

    // This runs when someone finishes signing in and creates their company if needed
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetch('/api/create-company', {
          method: 'POST',
          credentials: 'include',
        })
      }
    })
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-xl font-semibold">Setting up your private workspace...</p>
        <p className="text-sm text-gray-600 mt-2">One moment please</p>
      </div>
    </div>
  )
}
