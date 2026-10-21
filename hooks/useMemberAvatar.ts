'use client'

import { useEffect, useRef, useState } from 'react'

import { Person } from '@/types'

// Avatar form state: keeps the stored path as submit-only scratch data, while
// the chosen file and the "removed" flag drive the preview. The existing photo
// is only deleted from storage once the form is saved, so cancelling after
// "Remove photo" doesn't leave a broken avatar.
export function useMemberAvatar(initialData?: Person) {
  const avatarUrlRef = useRef(initialData?.avatar_url || '')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [removeExistingAvatar, setRemoveExistingAvatar] = useState(false)
  const [processingAvatar, setProcessingAvatar] = useState(false)

  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialData?.avatar_url || null
  )

  // Blob object URLs are browser resources: create them in an effect (not
  // during render) and revoke the previous one whenever the source changes.
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(
        removeExistingAvatar ? null : initialData?.avatar_url || null
      )
      return
    }
    const url = URL.createObjectURL(avatarFile)
    setAvatarPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [avatarFile, removeExistingAvatar, initialData])

  const handleAvatarSelected = (file: File) => {
    if (initialData?.avatar_url) {
      setRemoveExistingAvatar(true)
    }
    setAvatarFile(file)
  }

  const handleAvatarRemove = () => {
    if (initialData?.avatar_url) {
      setRemoveExistingAvatar(true)
    }
    avatarUrlRef.current = ''
    setAvatarFile(null)
  }

  return {
    avatarUrlRef,
    avatarFile,
    removeExistingAvatar,
    processingAvatar,
    setProcessingAvatar,
    avatarPreview,
    handleAvatarSelected,
    handleAvatarRemove
  }
}
