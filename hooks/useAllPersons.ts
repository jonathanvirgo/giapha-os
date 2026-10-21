'use client'

import { useEffect, useState } from 'react'

import { Person } from '@/types'

/** Loads every person (paged past the 1000-row cap) for export pickers. */
export function useAllPersons() {
  const [persons, setPersons] = useState<Person[]>([])

  useEffect(() => {
    async function fetchPersons() {
      try {
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()

        let allFetched: Person[] = []
        let from = 0
        const step = 1000

        while (true) {
          const { data } = await supabase
            .from('persons')
            .select('id, full_name, birth_year, gender, avatar_url, generation')
            .order('birth_year', { ascending: true, nullsFirst: false })
            .order('id')
            .range(from, from + step - 1)

          if (!data || data.length === 0) break
          allFetched = allFetched.concat(data as Person[])
          if (data.length < step) break
          from += step
        }
        setPersons(allFetched)
      } catch (err) {
        console.error('Error fetching persons:', err)
      }
    }
    fetchPersons()
  }, [])

  return persons
}
