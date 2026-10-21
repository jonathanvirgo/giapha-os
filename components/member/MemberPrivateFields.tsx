'use client'

import { m } from 'framer-motion'
import { Briefcase, Lock, MapPin, Phone } from 'lucide-react'

import { DeceasedPhoneWarning } from '@/components/member/MemberDeathFields'
import {
  formSectionVariants,
  inputClasses
} from '@/components/member/memberFormStyles'
import { useI18n } from '@/lib/i18n/useI18n'

interface MemberPrivateFieldsProps {
  isDeceased: boolean
  phoneNumber: string
  onPhoneNumberChange: (value: string) => void
  occupation: string
  onOccupationChange: (value: string) => void
  currentResidence: string
  onCurrentResidenceChange: (value: string) => void
}

export default function MemberPrivateFields({
  isDeceased,
  phoneNumber,
  onPhoneNumberChange,
  occupation,
  onOccupationChange,
  currentResidence,
  onCurrentResidenceChange
}: MemberPrivateFieldsProps) {
  const { t } = useI18n()
  return (
    <m.div
      variants={formSectionVariants}
      initial='hidden'
      animate='show'
      transition={{ delay: 0.1 }}
      className='relative overflow-hidden rounded-2xl border border-amber-200/50 bg-linear-to-br from-amber-50/80 to-stone-50/80 p-5 sm:p-8'>
      {/* Decorative Background Icon */}
      <Lock className='absolute -right-6 -bottom-6 h-32 w-32 rotate-12 text-amber-500/5' />

      <h3 className='relative z-10 mb-6 flex items-center gap-2 border-b border-amber-200/50 pb-4 font-serif text-lg font-semibold text-amber-900 sm:text-xl'>
        <span className='rounded-lg bg-amber-100/80 p-1.5 text-amber-700 shadow-xs'>
          <Lock className='size-4' />
        </span>
        <span>{t('privateInfo')}</span>
        <span className='ml-auto rounded-md border border-amber-300/60 bg-amber-200/80 px-2.5 py-1 text-sm font-medium text-amber-800 sm:ml-2'>
          {t('adminOnly')}
        </span>
      </h3>
      <div className='relative z-10 grid grid-cols-1 gap-6 md:grid-cols-2'>
        <div>
          <label
            htmlFor='member-phone'
            className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-900/80'>
            <Phone className='size-4' /> {t('phone')}
          </label>
          <input
            id='member-phone'
            type='tel'
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            disabled={isDeceased}
            placeholder={t('phonePlaceholder')}
            className={`${inputClasses} disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400`}
          />
          {isDeceased && <DeceasedPhoneWarning />}
        </div>

        <div>
          <label
            htmlFor='member-occupation'
            className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-900/80'>
            <Briefcase className='size-4' /> {t('occupation')}
          </label>
          <input
            id='member-occupation'
            type='text'
            value={occupation}
            onChange={(e) => onOccupationChange(e.target.value)}
            placeholder={t('occupationPlaceholder')}
            className={inputClasses}
          />
        </div>

        <div className='md:col-span-2'>
          <label
            htmlFor='member-residence'
            className='mb-1.5 flex items-center gap-1.5 text-sm font-medium text-amber-900/80'>
            <MapPin className='size-4' /> {t('residence')}
          </label>
          <input
            id='member-residence'
            type='text'
            value={currentResidence}
            onChange={(e) => onCurrentResidenceChange(e.target.value)}
            placeholder={t('residencePlaceholder')}
            className={inputClasses}
          />
        </div>
      </div>
    </m.div>
  )
}
