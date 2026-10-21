'use client'

import { ReactNode } from 'react'

interface DataCardProps {
  icon: ReactNode
  title: string
  description: ReactNode
  accent: 'amber' | 'rose'
  children: ReactNode
}

export default function DataCard({
  icon,
  title,
  description,
  accent,
  children
}: DataCardProps) {
  return (
    <div className='group relative rounded-2xl border border-stone-200/60 bg-white/80 p-6 transition-shadow'>
      {/* Background Decor */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-2xl'>
        <div
          className={`absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full blur-2xl transition-colors ${
            accent === 'amber'
              ? 'bg-amber-200/20 group-hover:bg-amber-300/30'
              : 'bg-rose-200/20 group-hover:bg-rose-300/30'
          }`}
        />
      </div>

      <div className='relative z-10 mb-4 flex items-start gap-4'>
        <div className='rounded-xl bg-stone-100 p-3 text-stone-600'>{icon}</div>
        <div>
          <h3 className='text-lg font-semibold text-stone-800'>{title}</h3>
          <p className='mt-1 text-sm text-stone-500'>{description}</p>
        </div>
      </div>

      {children}
    </div>
  )
}
