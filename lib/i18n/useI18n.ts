'use client'

import { createContext, useContext } from 'react'

import { Locale, messages, TranslationKey, TranslationValues } from './messages'

export interface I18nContextValue {
  locale: Locale
  messages: (typeof messages)[Locale]
  setLocale: (locale: Locale) => void
  t: (key: TranslationKey, values?: TranslationValues) => string
}

export const I18nContext = createContext<I18nContextValue | undefined>(
  undefined
)

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}
