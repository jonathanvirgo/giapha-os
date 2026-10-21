'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useContext, useEffect, useState } from 'react'

import { MemberListContext } from '@/context/memberListViewContext'
import { useMemberListView } from '@/context/useMemberListView'
import { useI18n } from '@/lib/i18n/useI18n'
import { Person } from '@/types'
import { fetchRelationshipData } from '@/utils/relationshipFetch'
import { createClient } from '@/utils/supabase/client'

import AddRelationshipSection from './relationship/AddRelationshipSection'
import BulkAddChildrenSection from './relationship/BulkAddChildrenSection'
import QuickAddSpouseSection from './relationship/QuickAddSpouseSection'
import RelationshipAddButtons from './relationship/RelationshipAddButtons'
import RelationshipErrorBanner from './relationship/RelationshipErrorBanner'
import RelationshipList from './relationship/RelationshipList'
import {
  EnrichedRelationship,
  RelationshipStats
} from './relationship/relationshipTypes'

interface RelationshipManagerProps {
  person: Person
  isAdmin: boolean
  canEdit?: boolean
  onStatsLoaded?: (stats: RelationshipStats) => void
}

export default function RelationshipManager({
  person,
  isAdmin,
  canEdit = false,
  onStatsLoaded
}: RelationshipManagerProps) {
  const { t } = useI18n()
  const supabase = createClient()
  const memberListContext = useContext(MemberListContext)
  const { setMemberModalId } = useMemberListView()
  const router = useRouter()

  const personId = person.id

  // If inside DashboardProvider → open modal; otherwise → navigate to full page
  const handlePersonClick = (id: string) => {
    if (memberListContext !== undefined) {
      setMemberModalId(id)
    } else {
      router.push(`/dashboard/members/${id}`)
    }
  }

  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([])
  const [loading, setLoading] = useState(true)

  // Which admin form is open (mutually exclusive)
  const [isAdding, setIsAdding] = useState(false)
  const [isAddingBulk, setIsAddingBulk] = useState(false)
  const [isAddingSpouse, setIsAddingSpouse] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Fetch relationships
  const fetchRelationships = useCallback(async () => {
    try {
      const { relationships, stats } = await fetchRelationshipData(
        supabase,
        personId,
        t
      )
      setRelationships(relationships)
      onStatsLoaded?.(stats)
    } catch (err) {
      console.error('Error fetching relationships:', err)
    } finally {
      setLoading(false)
    }
  }, [personId, supabase, onStatsLoaded, t])

  useEffect(() => {
    const timeoutId = window.setTimeout(fetchRelationships, 0)
    return () => window.clearTimeout(timeoutId)
  }, [fetchRelationships])

  const handleSaved = () => {
    fetchRelationships()
    router.refresh()
  }

  const handleDelete = async (relId: string) => {
    if (!confirm(t('confirmDeleteRelationship'))) return
    try {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', relId)
      if (error) throw error
      fetchRelationships()
      router.refresh()
    } catch (err: unknown) {
      const e = err as Error
      setDeleteError(t('deleteRelationshipError', { error: e.message }))
      setTimeout(() => setDeleteError(null), 5000)
    }
  }

  if (loading)
    return (
      <div className='text-sm text-stone-500'>{t('loadingFamilyInfo')}</div>
    )

  return (
    <div className='space-y-6'>
      <RelationshipList
        relationships={relationships}
        isAdmin={isAdmin}
        canEdit={canEdit}
        onPersonClick={handlePersonClick}
        onDelete={handleDelete}
      />

      {/* Add Buttons (Admin) */}
      {canEdit && !isAdding && !isAddingBulk && !isAddingSpouse && (
        <RelationshipAddButtons
          onAddRelation={() => setIsAdding(true)}
          onAddBulk={() => setIsAddingBulk(true)}
          onAddSpouse={() => setIsAddingSpouse(true)}
        />
      )}

      {canEdit &&
        deleteError &&
        !isAdding &&
        !isAddingBulk &&
        !isAddingSpouse && (
          <RelationshipErrorBanner
            error={deleteError}
            onDismiss={() => setDeleteError(null)}
          />
        )}

      {/* Add Form (Admin) */}
      {canEdit && (
        <AddRelationshipSection
          person={person}
          open={isAdding}
          onClose={() => setIsAdding(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Bulk Add Children Form (Admin) */}
      {canEdit && (
        <BulkAddChildrenSection
          person={person}
          spouseOptions={relationships.filter((r) => r.direction === 'spouse')}
          open={isAddingBulk}
          onClose={() => setIsAddingBulk(false)}
          onSaved={handleSaved}
        />
      )}

      {/* Quick Add Spouse Form (Admin) */}
      {canEdit && (
        <QuickAddSpouseSection
          person={person}
          open={isAddingSpouse}
          onClose={() => setIsAddingSpouse(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
