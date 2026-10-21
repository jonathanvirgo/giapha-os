'use client'

import { Eye, EyeOff } from 'lucide-react'

import { useMemberListView } from '@/context/useMemberListView'
import { useI18n } from '@/lib/i18n/useI18n'

export default function AvatarToggle() {
  const { showAvatar, setShowAvatar } = useMemberListView()
  const { t } = useI18n()

  const toggleAvatar = () => {
    setShowAvatar(!showAvatar)
  }

  return (
    <button onClick={toggleAvatar} className='btn'>
      {showAvatar ? (
        <EyeOff className='size-4 shrink-0' />
      ) : (
        <Eye className='size-4 shrink-0' />
      )}
      <span className='inline-block min-w-max'>
        {showAvatar ? t('hidePhoto') : t('showPhoto')}
      </span>
    </button>
  )
}
