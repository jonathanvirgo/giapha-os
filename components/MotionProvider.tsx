'use client'

import { domMax, LazyMotion } from 'framer-motion'
import { ReactNode } from 'react'

// ViewToggle uses `layoutId`, which needs the layout-projection features in
// domMax (domAnimation would silently skip the tab-pill animation).
export default function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domMax}>{children}</LazyMotion>
}
