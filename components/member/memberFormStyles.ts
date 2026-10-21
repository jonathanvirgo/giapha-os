import { Variants } from 'framer-motion'

export const inputClasses =
  'bg-white text-stone-900 placeholder-stone-500 block w-full rounded-xl border border-stone-300  focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white text-sm px-4 py-3 transition outline-none!'

export const formSectionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
}
