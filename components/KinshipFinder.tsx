'use client'

import { ArrowLeftRight, Users } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import KinshipGuideSections from '@/components/kinship/KinshipGuideSections'
import KinshipPersonSelector from '@/components/kinship/KinshipPersonSelector'
import KinshipResult from '@/components/kinship/KinshipResult'
import { PersonNode, RelEdge } from '@/components/kinship/kinshipTypes'
import { useI18n } from '@/lib/i18n/useI18n'
import { computeKinship } from '@/utils/kinshipHelpers'

interface Props {
  persons: PersonNode[]
  relationships: RelEdge[]
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KinshipFinder({ persons, relationships }: Props) {
  const { t } = useI18n()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Selection lives in state (seeded from the URL for deep links) and is
  // persisted to localStorage. The URL is updated from event handlers only —
  // never redirected on mount.
  const [p1Id, setP1Id] = useState(() => searchParams.get('p1'))
  const [p2Id, setP2Id] = useState(() => searchParams.get('p2'))

  useEffect(() => {
    if (p1Id && p2Id) return
    try {
      const savedP1 = localStorage.getItem('kinship_p1')
      const savedP2 = localStorage.getItem('kinship_p2')
      if (!p1Id && savedP1) setP1Id(savedP1)
      if (!p2Id && savedP2) setP2Id(savedP2)
    } catch (e) {
      console.warn('Failed to read from localStorage:', e)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    try {
      if (p1Id) localStorage.setItem('kinship_p1', p1Id)
      else localStorage.removeItem('kinship_p1')

      if (p2Id) localStorage.setItem('kinship_p2', p2Id)
      else localStorage.removeItem('kinship_p2')
    } catch (e) {
      console.warn('Failed to write to localStorage:', e)
    }
  }, [p1Id, p2Id])

  const personA = useMemo(
    () => persons.find((p) => p.id === p1Id) || null,
    [persons, p1Id]
  )
  const personB = useMemo(
    () => persons.find((p) => p.id === p2Id) || null,
    [persons, p2Id]
  )

  const updateUrl = (nextP1: string | null, nextP2: string | null) => {
    setP1Id(nextP1)
    setP2Id(nextP2)

    const params = new URLSearchParams(searchParams.toString())
    if (nextP1) params.set('p1', nextP1)
    else params.delete('p1')
    if (nextP2) params.set('p2', nextP2)
    else params.delete('p2')

    const newUrl = `${pathname}?${params.toString()}`
    router.replace(newUrl, { scroll: false })
  }

  const result = useMemo(() => {
    if (!personA || !personB) return null
    return computeKinship(personA, personB, persons, relationships)
  }, [personA, personB, persons, relationships])

  const swap = () => {
    updateUrl(p2Id, p1Id)
  }

  return (
    <div className='space-y-6'>
      {/* ── Selector row ── */}
      <div className='rounded-2xl border border-stone-200/60 bg-white/80 p-4 sm:p-6'>
        <div className='flex flex-col items-center gap-3 sm:flex-row sm:items-end sm:gap-4'>
          <KinshipPersonSelector
            label={t('memberA')}
            selected={personA}
            onSelect={(p) => updateUrl(p.id, p2Id)}
            persons={persons}
            disabledId={personB?.id}
          />
          <button
            onClick={swap}
            title={t('swapMembers')}
            className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-stone-100 text-stone-500 transition-colors hover:bg-amber-100 hover:text-amber-600 sm:mb-0.5'>
            <ArrowLeftRight className='size-4 rotate-90 sm:rotate-0' />
          </button>
          <KinshipPersonSelector
            label={t('memberB')}
            selected={personB}
            onSelect={(p) => updateUrl(p1Id, p.id)}
            persons={persons}
            disabledId={personA?.id}
          />
        </div>
      </div>

      {/* ── Result ── */}
      {personA && personB ? (
        <KinshipResult personA={personA} personB={personB} result={result} />
      ) : (
        <div className='py-16 text-center text-stone-400'>
          <Users className='mx-auto mb-3 size-12 opacity-30' />
          <p className='font-medium'>{t('chooseTwoMembers')}</p>
        </div>
      )}

      {/* ── Guide & reference section ── */}
      <KinshipGuideSections />
    </div>
  )
}
