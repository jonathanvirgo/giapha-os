'use client'

import {
  Crown,
  Flower2,
  Heart,
  HeartOff,
  Mars,
  Skull,
  Users,
  Venus
} from 'lucide-react'

import { useI18n } from '@/lib/i18n/useI18n'
import { FamilyStatsResult } from '@/utils/familyStats'

import StatCard from './FamilyStatCard'

export default function StatCardsGrid({ stats }: { stats: FamilyStatsResult }) {
  const { t } = useI18n()
  const cards = [
    {
      label: t('totalMembers'),
      value: stats.total,
      icon: <Users className='size-5 text-stone-600' />,
      color: 'bg-stone-400'
    },
    {
      label: t('male'),
      value: stats.male,
      icon: <Mars className='size-5 text-blue-600' />,
      color: 'bg-blue-400'
    },
    {
      label: t('female'),
      value: stats.female,
      icon: <Venus className='size-5 text-pink-500' />,
      color: 'bg-pink-400'
    },
    {
      label: t('daughterInLawChild'),
      value: stats.daughtersInLaw,
      icon: <Flower2 className='size-5 text-rose-500' />,
      color: 'bg-rose-400'
    },
    {
      label: t('sonInLawChild'),
      value: stats.sonsInLaw,
      icon: <Users className='size-5 text-indigo-500' />,
      color: 'bg-indigo-400'
    },
    {
      label: t('married'),
      value: stats.married,
      icon: <Heart className='size-5 text-red-500' />,
      color: 'bg-red-400'
    },
    {
      label: t('unmarried'),
      value: stats.unmarried,
      icon: <HeartOff className='size-5 text-stone-400' />,
      color: 'bg-stone-300'
    },
    {
      label: t('deceased'),
      value: stats.deceased,
      icon: <Skull className='size-5 text-stone-500' />,
      color: 'bg-stone-400'
    },
    {
      label: t('firstChild'),
      value: stats.firstBorn,
      icon: <Crown className='size-5 text-amber-500' />,
      color: 'bg-amber-400'
    }
  ]

  return (
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3'>
      {cards.map((card, i) => (
        <StatCard
          key={card.label}
          label={card.label}
          value={card.value}
          total={stats.total}
          icon={card.icon}
          color={card.color}
          delay={i * 0.06}
        />
      ))}
    </div>
  )
}
