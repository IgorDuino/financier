import { headers, cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'
import { User, Session } from '@supabase/supabase-js'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  })
}

export const getSession = async () => {
  const supabase = createClient()
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error: unknown) {
    console.error('Error:', error)
    return null
  }
}

export const getUser = async () => {
  const supabase = createClient()
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error: unknown) {
    console.error('Error:', error)
    return null
  }
} 