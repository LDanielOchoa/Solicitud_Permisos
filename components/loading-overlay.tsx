'use client'

import { motion } from 'framer-motion'

export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="text-green-500"
        >
          <path
            d="M50,10 C80,10 90,40 90,50 C90,60 80,90 50,90 C20,90 10,60 10,50 C10,40 20,10 50,10"
            fill="currentColor"
          />
        </svg>
      </motion.div>
    </div>
  )
}

