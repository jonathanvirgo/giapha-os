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

  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  // Revoke object URL on cleanup / unmount
  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [objectUrl])

  const avatarPreview = avatarFile
    ? objectUrl
    : removeExistingAvatar
      ? null
      : initialData?.avatar_url || null

  const handleAvatarSelected = (file: File) => {
    if (initialData?.avatar_url) {
      setRemoveExistingAvatar(true)
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
    setObjectUrl(URL.createObjectURL(file))
    setAvatarFile(file)
  }

  const handleAvatarRemove = () => {
    if (initialData?.avatar_url) {
      setRemoveExistingAvatar(true)
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
      setObjectUrl(null)
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
