'use client'

import { X } from 'lucide-react'

import { useI18n } from '@/lib/i18n/useI18n'

interface EventHeaderActionsProps {
  onClose: () => void
}

export default function EventHeaderActions({
  onClose
}: EventHeaderActionsProps) {
  const { t } = useI18n()
  return (
    <div className='absolute top-4 right-4 z-20 flex items-center gap-2 sm:top-5 sm:right-5'>
      <button
        type='button'
        onClick={onClose}
        className='flex size-10 items-center justify-center rounded-full border border-stone-200/50 bg-stone-100/80 text-stone-600 transition-colors hover:bg-stone-200 hover:text-stone-900'
        aria-label={t('close')}>
        <X className='size-5' />
      </button>
    </div>
  )
}
