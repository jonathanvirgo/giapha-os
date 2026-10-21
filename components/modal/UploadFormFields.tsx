'use client'

import { useI18n } from '@/lib/i18n/useI18n'

const inputClasses =
  'bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300  focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition-colors outline-none!'

interface UploadFormFieldsProps {
  title: string
  eventDate: string
  description: string
  onTitleChange: (value: string) => void
  onEventDateChange: (value: string) => void
  onDescriptionChange: (value: string) => void
}

export default function UploadFormFields({
  title,
  eventDate,
  description,
  onTitleChange,
  onEventDateChange,
  onDescriptionChange
}: UploadFormFieldsProps) {
  const { t } = useI18n()
  return (
    <div className='space-y-4'>
      <div>
        <label
          htmlFor='upload-image-title'
          className='mb-1.5 block text-sm font-medium text-stone-700'>
          {t('imageTitle')} <span className='text-red-500'>*</span>
        </label>
        <input
          id='upload-image-title'
          type='text'
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={inputClasses}
          placeholder={t('imageTitlePlaceholder')}
        />
      </div>

      <div>
        <label
          htmlFor='upload-image-date'
          className='mb-1.5 block text-sm font-medium text-stone-700'>
          {t('eventDate')}
        </label>
        <input
          id='upload-image-date'
          type='date'
          value={eventDate}
          onChange={(e) => onEventDateChange(e.target.value)}
          className={inputClasses}
        />
      </div>

      <div>
        <label
          htmlFor='upload-image-description'
          className='mb-1.5 block text-sm font-medium text-stone-700'>
          {t('eventDescription')}
        </label>
        <textarea
          id='upload-image-description'
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className={`${inputClasses} resize-none`}
          placeholder={t('descriptionPlaceholder')}
        />
      </div>
    </div>
  )
}
