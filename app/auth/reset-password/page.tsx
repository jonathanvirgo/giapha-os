'use client'

import { m } from 'framer-motion'
import { ArrowLeft, KeyRound, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import {
  AuthAlerts,
  AuthBackgroundDecor,
  AuthField
} from '@/components/auth/AuthFormParts'
import Footer from '@/components/Footer'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useI18n } from '@/lib/i18n/useI18n'
import { authErrorKey } from '@/utils/authErrors'
import { createClient } from '@/utils/supabase/client'

const MIN_PASSWORD_LENGTH = 8

export default function ResetPasswordPage() {
  const { t } = useI18n()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(t('userAdminPasswordTooShort'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(t(authErrorKey(error)))
      } else {
        setSuccess(true)
        redirectTimerRef.current = setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      }
    } catch {
      setError(t('unexpectedError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900'>
      <AuthBackgroundDecor />

      <header className='relative z-20 flex w-full items-center justify-between gap-3 px-4 pt-6 sm:px-6'>
        <Link
          href='/login'
          className='group flex shrink-0 items-center gap-2 rounded-full border border-stone-200 bg-white/60 px-4 py-2.5 text-sm font-medium text-stone-500 transition-colors duration-300 hover:border-stone-300 hover:text-stone-900 sm:px-5'>
          <ArrowLeft
            aria-hidden='true'
            className='size-4 transition-transform group-hover:-translate-x-1'
          />
          {t('login')}
        </Link>

        <div className='flex shrink-0 items-center gap-2 sm:gap-3'>
          <LanguageSwitcher />
        </div>
      </header>

      <div className='relative z-10 flex w-full flex-1 items-center justify-center px-4 py-12'>
        <m.div
          className='relative w-full max-w-md overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-8 backdrop-blur-xl sm:p-10'
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <div className='pointer-events-none absolute top-0 right-0 h-32 w-32 rounded-bl-[100px] bg-linear-to-br from-amber-100/50 to-transparent'></div>

          <div className='relative z-10 mb-8 text-center'>
            <div className='mb-5 inline-flex items-center justify-center rounded-2xl border border-stone-100 bg-white p-3.5'>
              <Shield aria-hidden='true' className='size-8 text-amber-600' />
            </div>
            <h1 className='font-serif text-3xl font-semibold text-stone-900 sm:text-4xl'>
              {t('resetPasswordTitle')}
            </h1>
            <p className='mt-3 text-sm font-medium text-stone-500'>
              {t('resetPasswordDescription')}
            </p>
          </div>

          {success ? (
            <m.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className='py-6 text-center'>
              <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600'>
                <svg
                  aria-hidden='true'
                  className='size-8'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h2 className='mb-2 font-serif text-xl font-semibold text-stone-800'>
                {t('resetPasswordSuccess')}
              </h2>
              <p className='text-sm text-stone-500'>
                {t('redirectingToDashboard')}
              </p>
            </m.div>
          ) : (
            <form className='relative z-10 space-y-5' onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <AuthField
                  id='new-password'
                  label={t('newPassword')}
                  icon={<KeyRound aria-hidden='true' className='size-5' />}
                  type='password'
                  autoComplete='new-password'
                  required
                  placeholder={t('newPasswordPlaceholder')}
                  value={password}
                  onChange={setPassword}
                />

                <AuthField
                  id='confirm-new-password'
                  label={t('confirmNewPassword')}
                  icon={<KeyRound aria-hidden='true' className='size-5' />}
                  type='password'
                  autoComplete='new-password'
                  required
                  placeholder={t('confirmNewPasswordPlaceholder')}
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                />
              </div>

              <AuthAlerts error={error} successMessage={null} />

              <div className='pt-4'>
                <button
                  type='submit'
                  disabled={loading}
                  className='group relative flex w-full items-center justify-center gap-2 rounded-xl border border-stone-800 bg-stone-900 px-4 py-4 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-stone-800 focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:outline-none disabled:cursor-wait disabled:opacity-70'>
                  {loading ? (
                    <span className='flex items-center gap-2.5'>
                      <svg
                        aria-hidden='true'
                        className='-ml-1 h-4 w-4 animate-spin text-white'
                        fill='none'
                        viewBox='0 0 24 24'>
                        <circle
                          className='opacity-25'
                          cx='12'
                          cy='12'
                          r='10'
                          stroke='currentColor'
                          strokeWidth='4'></circle>
                        <path
                          className='opacity-75'
                          fill='currentColor'
                          d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                      </svg>
                      {t('loading')}
                    </span>
                  ) : (
                    t('resetPasswordTitle')
                  )}
                </button>
              </div>
            </form>
          )}
        </m.div>
      </div>

      <Footer className='relative z-10 mt-auto border-none bg-transparent' />
    </div>
  )
}
