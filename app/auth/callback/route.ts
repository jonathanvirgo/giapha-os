import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { notifyAdminOfPendingUser } from '@/utils/approval-notification'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const rawNext = requestUrl.searchParams.get('next')
  const isRelative =
    rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//')
  const next = isRelative ? rawNext : '/dashboard'
  const authError = requestUrl.searchParams.get('error')

  if (authError) {
    return NextResponse.redirect(
      new URL('/login?error=auth_callback_failed', requestUrl.origin)
    )
  }

  if (code) {
    const supabase = createClient(await cookies())
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        new URL('/login?error=auth_callback_failed', requestUrl.origin)
      )
    }

    if (type === "recovery") {
      return NextResponse.redirect(
        new URL('/auth/reset-password', requestUrl.origin)
      )
    }

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user?.email) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.role === 'member' && !profile.is_active) {
        await notifyAdminOfPendingUser({
          id: user.id,
          email: user.email
        })
      }
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  return NextResponse.redirect(
    new URL('/login?error=auth_callback_error', requestUrl.origin)
  )
}
