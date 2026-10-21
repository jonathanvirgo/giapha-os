'use client'

import { useI18n } from '@/lib/i18n/useI18n'

type ExportFormat = 'json' | 'gedcom' | 'csv'

export default function ExportActions({
  isExporting,
  onExport
}: {
  isExporting: boolean
  onExport: (format: ExportFormat) => void
}) {
  const { t } = useI18n()
  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      <button
        onClick={() => onExport('json')}
        disabled={isExporting}
        className='btn-primary w-full'>
        {isExporting ? t('processingData') : t('exportJson')}
      </button>
      <button
        onClick={() => onExport('gedcom')}
        disabled={isExporting}
        className='btn w-full bg-stone-100 font-medium text-stone-700 hover:bg-stone-200'>
        {isExporting ? t('processingData') : t('exportGedcom')}
      </button>
      <button
        onClick={() => onExport('csv')}
        disabled={isExporting}
        className='btn w-full bg-stone-100 font-medium text-stone-700 hover:bg-stone-200 sm:col-span-2 lg:col-span-1'>
        {isExporting ? t('processingData') : t('exportCsv')}
      </button>
    </div>
  )
}
