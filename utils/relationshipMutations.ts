import { SupabaseClient } from '@supabase/supabase-js'

import { BulkChildRow } from '@/components/relationship/relationshipTypes'
import { Person, RelationshipType } from '@/types'

export interface NewRelationshipInput {
  personId: string
  selectedTargetId: string
  direction: 'parent' | 'child' | 'spouse'
  relType: RelationshipType
  note: string
  person: Person
}

// Inserts a relationship between the current person and a target, then
// auto-fills the target's generation/is_in_law when still unset.
export async function addRelationshipWithTargetSync(
  supabase: SupabaseClient,
  input: NewRelationshipInput
) {
  const { personId, selectedTargetId, direction, relType, note } = input

  let personA = personId
  let personB = selectedTargetId
  // Default: I am A, Target is B.

  // Setup payload based on logic
  // Marriage: Order doesn't strictly matter logically, but consistency is good.
  // Parent/Child:
  //    Relationship Type: biological_child
  //    Column A: Parent
  //    Column B: Child

  if (direction === 'parent') {
    // Target is Parent (A), I am Child (B)
    personA = selectedTargetId
    personB = personId
  } else if (direction === 'child') {
    // I am Parent (A), Target is Child (B)
    personA = personId
    personB = selectedTargetId
  }

  // Determine Type
  let type: RelationshipType = 'biological_child'
  if (direction === 'spouse') type = 'marriage'
  else if (relType === 'adopted_child') type = 'adopted_child'

  const { error } = await supabase.from('relationships').insert({
    person_a: personA,
    person_b: personB,
    type: type,
    note: note ? note : null
  })

  if (error) throw error

  await autoUpdateTargetProperties(
    supabase,
    selectedTargetId,
    direction,
    input.person
  )
}

// Auto-update target person generation and is_in_law if currently missing
async function autoUpdateTargetProperties(
  supabase: SupabaseClient,
  selectedTargetId: string,
  direction: 'parent' | 'child' | 'spouse',
  person: Person
) {
  try {
    const { data: targetPerson } = await supabase
      .from('persons')
      .select('generation, is_in_law')
      .eq('id', selectedTargetId)
      .single()

    if (
      targetPerson &&
      (targetPerson.generation == null || targetPerson.is_in_law == null)
    ) {
      const updates: { generation?: number; is_in_law?: boolean } = {}

      if (targetPerson.generation == null && person.generation != null) {
        if (direction === 'child') updates.generation = person.generation + 1
        else if (direction === 'parent')
          updates.generation = person.generation - 1
        else if (direction === 'spouse') updates.generation = person.generation
      }

      if (targetPerson.is_in_law == null) {
        if (direction === 'child' || direction === 'parent')
          updates.is_in_law = false
        else if (direction === 'spouse')
          updates.is_in_law = person.is_in_law === true ? false : true
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('persons')
          .update(updates)
          .eq('id', selectedTargetId)
      }
    }
  } catch (err) {
    console.error('Failed to auto-update target person properties', err)
  }
}

export interface BulkChildInput {
  child: BulkChildRow
  parentId: string
  otherParentId: string
  parentGeneration: number | null
}

// Creates one child person plus the parent relationship(s). Returns true on
// success; failures are logged and reported per row.
async function createChildWithParents(
  supabase: SupabaseClient,
  { child, parentId, otherParentId, parentGeneration }: BulkChildInput
): Promise<boolean> {
  const personPayload: {
    full_name: string
    gender: 'male' | 'female' | 'other'
    birth_year?: number
    birth_order?: number
    is_in_law?: boolean
    generation?: number
  } = {
    full_name: child.name.trim(),
    gender: child.gender,
    is_in_law: false
  }

  if (parentGeneration != null) {
    personPayload.generation = parentGeneration + 1
  }
  if (child.birthYear.trim() !== '') {
    const year = parseInt(child.birthYear)
    if (!isNaN(year)) personPayload.birth_year = year
  }
  if (child.birthOrder.trim() !== '') {
    const order = parseInt(child.birthOrder)
    if (!isNaN(order)) personPayload.birth_order = order
  }

  const { data: newPersonData, error: insertError } = await supabase
    .from('persons')
    .insert(personPayload)
    .select('id')
    .single()

  if (insertError || !newPersonData) {
    console.error('Error inserting child:', child.name, insertError)
    return false // Skip setting relationships for this if person insert failed
  }

  const newChildId = newPersonData.id

  // Insert Relationship to Main Person (parent)
  await supabase.from('relationships').insert({
    person_a: parentId,
    person_b: newChildId,
    type: 'biological_child'
  })

  // Insert Relationship to Second Parent (spouse), if selected
  if (otherParentId && otherParentId !== 'unknown') {
    await supabase.from('relationships').insert({
      person_a: otherParentId,
      person_b: newChildId,
      type: 'biological_child'
    })
  }

  return true
}

// Bulk-inserts children in bounded batches of 5 (rows are independent but we
// avoid firing every insert at once from the browser). Returns how many
// children were created successfully.
export async function bulkCreateChildren(
  supabase: SupabaseClient,
  input: {
    children: BulkChildRow[]
    parentId: string
    otherParentId: string
    parentGeneration: number | null
  }
): Promise<number> {
  const { children, parentId, otherParentId, parentGeneration } = input
  let successCount = 0

  const BATCH_SIZE = 5
  for (let i = 0; i < children.length; i += BATCH_SIZE) {
    const batch = children.slice(i, i + BATCH_SIZE)

    const results = await Promise.all(
      batch.map((child) =>
        createChildWithParents(supabase, {
          child,
          parentId,
          otherParentId,
          parentGeneration
        })
      )
    )
    successCount += results.filter(Boolean).length
  }

  return successCount
}

export interface SpouseInput {
  person: Person
  name: string
  birthYear: string
  note: string
}

// Creates a spouse person (default gender opposite to `person`) and links the
// marriage. Returns the new spouse's ID; throws on failure.
export async function createSpouseWithMarriage(
  supabase: SupabaseClient,
  { person, name, birthYear, note }: SpouseInput
): Promise<string> {
  // Determine default gender based on current person
  // Default to opposite. If original is other, default to female (arbitrary choice, or let user pick, but standard says opposite)
  const newSpouseGender =
    person.gender === 'male'
      ? 'female'
      : person.gender === 'female'
        ? 'male'
        : 'female'

  const personPayload: {
    full_name: string
    gender: 'male' | 'female' | 'other'
    birth_year?: number
    is_in_law?: boolean
    generation?: number
  } = {
    full_name: name.trim(),
    gender: newSpouseGender,
    is_in_law: person.is_in_law === true ? false : true
  }

  if (person.generation != null) {
    personPayload.generation = person.generation
  }

  if (birthYear.trim() !== '') {
    const year = parseInt(birthYear)
    if (!isNaN(year)) personPayload.birth_year = year
  }

  // 1. Insert Person
  const { data: newPersonData, error: insertError } = await supabase
    .from('persons')
    .insert(personPayload)
    .select('id')
    .single()

  if (insertError || !newPersonData) throw insertError

  const newSpouseId = newPersonData.id

  // 2. Insert Marriage Relationship
  const { error: relError } = await supabase.from('relationships').insert({
    person_a: person.id,
    person_b: newSpouseId,
    type: 'marriage',
    note: note.trim() || null
  })

  if (relError) throw relError

  return newSpouseId
}
