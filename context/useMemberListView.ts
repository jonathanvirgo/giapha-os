'use client'

import { useContext } from 'react'

import { MemberListContext, MemberListViewState } from './memberListViewContext'

export function useMemberListView(): MemberListViewState {
  const context = useContext(MemberListContext)
  // Return a safe no-op fallback when used outside MemberListProvider
  // (e.g., on the /dashboard/members/[id] standalone page)
  if (context === undefined) {
    return {
      memberModalId: null,
      setMemberModalId: () => {},
      showCreateMember: false,
      setShowCreateMember: () => {},
      showAvatar: true,
      setShowAvatar: () => {},
      view: 'list',
      setView: () => {},
      rootId: null,
      setRootId: () => {}
    }
  }
  return context
}
