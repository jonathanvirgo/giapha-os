'use client'

import { Loader2 } from 'lucide-react'

import { useI18n } from '@/lib/i18n/useI18n'

interface UploadModalActionsProps {
  isUploading: boolean
  canSubmit: boolean
  isEdit: boolean
  onClose: () => void
}

export default function UploadModalActions({
  isUploading,
  canSubmit,
  isEdit,
  onClose
}: UploadModalActionsProps) {
  const { t } = useI18n()
  return (
    <div className='flex justify-end gap-3 border-t border-stone-100 pt-4'>
      <button
        type='button'
        onClick={onClose}
        disabled={isUploading}
        className='btn'>
        {t('restoreCancel')}
      </button>
      <button
        type='submit'
        form='upload-form'
        disabled={isUploading || !canSubmit}
        className='btn-primary flex items-center gap-2'>
        {isUploading ? (
          <>
            <Loader2 className='size-4 animate-spin' />
            {t('savingEvent')}
          </>
        ) : isEdit ? (
          t('saveChanges')
        ) : (
          t('saveImage')
        )}
      </button>
    </div>
  )
}
