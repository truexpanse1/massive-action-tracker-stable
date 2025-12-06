// app/lib/actions.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createUserWithTrial(formData: FormData) {
  const supabase = createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  const company = formData.get('company') as string;
  const phone = formData.get('phone') as string;
  const role = formData.get('role') as string;

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (authError || !authData.user) {
    redirect('/?error=signup_failed');
  }

  // Create profile + start 7-day trial
  await supabase.from('profiles').upsert({
    id: authData.user.id,
    full_name: name,
    role,
    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 *60 *1000).toISOString(), // 7 days
    updated_at: new Date().toISOString(),
  });

  await supabase.from('companies').insert({
    name: company,
    phone,
    owner_id: authData.user.id,
  });

  revalidatePath('/');
  redirect('/dashboard');
}
