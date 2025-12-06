// app/api/create-company/route.ts
// Automatically creates a private company for every new user on first sign-in

import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = createClient()

  // Get the current logged-in user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ success: false })

  // Check if they already have a company (prevents duplicates)
  const { data: alreadyHas } = await supabase
    .from('company_memberships')
    .select('company_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (alreadyHas) return NextResponse.json({ success: true })

  // Create their own company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: `${user.email?.split('@')[0] || 'User'}'s Company`,
      created_by: user.id,
    })
    .select()
    .single()

  if (companyError) {
    console.error('Company creation error:', companyError)
    return NextResponse.json({ success: false })
  }

  // Make them the admin
  await supabase.from('company_memberships').insert({
    company_id: company.id,
    user_id: user.id,
    role: 'admin',
  })

  return NextResponse.json({ success: true })
}
