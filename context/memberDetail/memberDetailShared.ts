import { Variants } from 'framer-motion'

export interface RelationshipStats {
  biologicalChildren: number
  maleBiologicalChildren: number
  femaleBiologicalChildren: number
  paternalGrandchildren: number
  maternalGrandchildren: number
  sonInLaw: number
  daughterInLaw: number
}

export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  }
}
