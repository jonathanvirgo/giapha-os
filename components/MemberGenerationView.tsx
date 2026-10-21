'use client'

import PersonCard from '@/components/PersonCard'
import { useI18n } from '@/lib/i18n/useI18n'
import { Person } from '@/types'
import {
  FamilySortedPerson,
  groupIntoCoupleGroups
} from '@/utils/memberSorting'

interface MemberGenerationViewProps {
  sortedPersons: FamilySortedPerson[]
  generationSort: 'generation_asc' | 'generation_desc'
  parentsOf: Map<string, string[]>
  spousesOf: Map<string, string[]>
  personMap: Map<string, Person>
}

export default function MemberGenerationView({
  sortedPersons,
  generationSort,
  parentsOf,
  spousesOf,
  personMap
}: MemberGenerationViewProps) {
  const { t } = useI18n()

  return (
    <div className='space-y-12'>
      {Object.entries(
        sortedPersons.reduce(
          (acc, person) => {
            const gen = person.generation || 0
            if (!acc[gen]) acc[gen] = []
            acc[gen].push(person)
            return acc
          },
          {} as Record<number, FamilySortedPerson[]>
        )
      )
        .sort(([genA], [genB]) => {
          if (generationSort === 'generation_desc') {
            return Number(genB) - Number(genA)
          }
          return Number(genA) - Number(genB)
        })
        .map(([gen, persons]) => {
          const familiesMap = new Map<string, typeof persons>()
          persons.forEach((p) => {
            const fid = p._familyId || 'unknown'
            if (!familiesMap.has(fid)) familiesMap.set(fid, [])
            familiesMap.get(fid)!.push(p)
          })

          return (
            <div key={gen} className='space-y-6'>
              <div className='flex items-center gap-3'>
                <div className='h-px flex-1 bg-stone-200'></div>
                <h3 className='rounded-full border border-amber-200/50 bg-amber-50 px-4 py-1.5 font-serif text-lg font-semibold text-amber-800'>
                  {gen === '0'
                    ? t('unknownGeneration')
                    : t('generationOf', { generation: gen })}
                </h3>
                <div className='h-px flex-1 bg-stone-200'></div>
              </div>
              <div className='space-y-9'>
                {Array.from(familiesMap.values()).map((famPersons, idx) => (
                  // Off-screen families skip rendering. The top padding keeps the
                  // parent label (positioned above the card) inside the
                  // paint-contained box so it isn't clipped.
                  <div
                    key={idx}
                    className='pt-3 [contain-intrinsic-size:auto_480px] [content-visibility:auto]'>
                    <div className='relative rounded-[2.5rem] border border-stone-300 bg-white p-5 sm:p-8'>
                      <FamilyLabel
                        famPersons={famPersons}
                        familyIndex={idx}
                        familyCount={familiesMap.size}
                        parentsOf={parentsOf}
                        personMap={personMap}
                      />
                      <div className='grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 lg:grid-cols-3'>
                        {groupIntoCoupleGroups(famPersons, spousesOf).map(
                          (group, gIdx) => {
                            const isCouple = group.length > 1
                            const colSpanClass =
                              group.length === 2
                                ? 'md:col-span-2'
                                : group.length >= 3
                                  ? 'md:col-span-2 lg:col-span-3'
                                  : 'col-span-1'
                            const innerGridClass =
                              group.length === 2
                                ? 'md:grid-cols-2'
                                : group.length >= 3
                                  ? 'md:grid-cols-2 lg:grid-cols-3'
                                  : 'grid-cols-1'

                            return (
                              <div
                                key={gIdx}
                                className={`relative ${colSpanClass}`}>
                                {isCouple && (
                                  <>
                                    {/* Desktop & Tablet background */}
                                    <div className='absolute -inset-3 z-0 hidden rounded-4xl border border-amber-200/80 bg-amber-50/70 md:block lg:-inset-4'></div>
                                    {/* Mobile background */}
                                    <div className='absolute -inset-2 z-0 rounded-3xl border border-amber-200/80 bg-amber-50/70 md:hidden'></div>
                                  </>
                                )}
                                <div
                                  className={`relative z-10 grid grid-cols-1 ${innerGridClass} h-full gap-y-6 md:gap-x-6`}>
                                  {group.map((person, pIdx) => (
                                    <div
                                      key={person.id}
                                      className='relative flex h-full flex-col'>
                                      <PersonCard person={person} />
                                      {/* Visual link between spouses (desktop >= md) */}
                                      {isCouple && pIdx < group.length - 1 && (
                                        <div className='absolute top-[50%] -right-3 z-10 hidden h-0.5 w-6 translate-x-1/2 bg-amber-300 md:block'></div>
                                      )}
                                      {/* Visual link between spouses (mobile < md) */}
                                      {isCouple && pIdx < group.length - 1 && (
                                        <div className='absolute -bottom-6 left-1/2 z-10 h-6 w-0.5 -translate-x-1/2 bg-amber-300 md:hidden'></div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
    </div>
  )
}

function FamilyLabel({
  famPersons,
  familyIndex,
  familyCount,
  parentsOf,
  personMap
}: {
  famPersons: Person[]
  familyIndex: number
  familyCount: number
  parentsOf: Map<string, string[]>
  personMap: Map<string, Person>
}) {
  const { t } = useI18n()
  const firstBloodline = famPersons.find((p) => !p.is_in_law) || famPersons[0]
  const parentIds = parentsOf.get(firstBloodline.id) || []
  const parents = parentIds
    .map((id) => personMap.get(id))
    .filter(Boolean) as Person[]
  const parentNames = parents
    .map((p) => p.full_name.trim().split(' ').splice(-2).join(' '))
    .join(' & ')

  const label = parentNames
    ? t('childOf', { parents: parentNames })
    : familyCount > 1
      ? t('familyNumber', { number: familyIndex + 1 })
      : null

  if (!label) return null

  return (
    <div className='absolute -top-3 left-8 z-20 rounded-full border border-stone-300 bg-stone-100 px-3 py-0.5 text-sm font-medium text-stone-600'>
      {label}
    </div>
  )
}
