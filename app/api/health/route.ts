import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
}

async function checkDatabase() {
  const startedAt = Date.now()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'unconfigured',
        message: 'Missing Supabase environment variables',
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      },
      { status: 503, headers: noCacheHeaders }
    )
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Query 1 row from a core table to verify database connectivity and reset inactivity timer
    const { error } = await supabase.from('profiles').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          message: error.message,
          latencyMs: Date.now() - startedAt,
          timestamp: new Date().toISOString()
        },
        { status: 503, headers: noCacheHeaders }
      )
    }

    return NextResponse.json(
      {
        status: 'ok',
        database: 'connected',
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: noCacheHeaders }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        database: 'unknown',
        message: error instanceof Error ? error.message : 'Unexpected error',
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString()
      },
      { status: 500, headers: noCacheHeaders }
    )
  }
}

export async function GET() {
  return await checkDatabase()
}

export async function HEAD() {
  return await checkDatabase()
}
