'use client'

import { m } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { useI18n } from '@/lib/i18n/useI18n'

interface EventModalFooterProps {
  isEdit: boolean
  loading: boolean
  onDelete: () => void
  onClose: () => void
}

export default function EventModalFooter({
  isEdit,
  loading,
  onDelete,
  onClose
}: EventModalFooterProps) {
  const { t } = useI18n()
  return (
    <m.div
      variants={{}}
      initial='hidden'
      animate='show'
      transition={{ delay: 0.1 }}
      className='flex flex-col-reverse items-stretch justify-between gap-4 pt-4 sm:flex-row sm:items-center sm:pt-6'>
      {isEdit ? (
        <button
          type='button'
          onClick={onDelete}
          disabled={loading}
          className='inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-200/50 bg-rose-50 px-4 py-4 text-sm font-medium text-rose-600 transition-colors duration-300 hover:-translate-y-1 hover:bg-rose-100 disabled:opacity-50 sm:w-auto'>
          {t('deleteEvent')}
        </button>
      ) : (
        <div className='hidden sm:block' /> /* Empty div to push right buttons to end on desktop */
      )}

      <div className='flex w-full flex-col gap-3 sm:w-auto sm:flex-row'>
        <button
          type='button'
          onClick={onClose}
          disabled={loading}
          className='btn w-full sm:w-auto'>
          {t('restoreCancel')}
        </button>
        <button
          type='submit'
          disabled={loading}
          className='btn-primary w-full sm:w-auto'>
          {loading && <Loader2 className='size-4 animate-spin' />}
          {loading ? t('savingEvent') : t('saveEvent')}
        </button>
      </div>
    </m.div>
  )
}
