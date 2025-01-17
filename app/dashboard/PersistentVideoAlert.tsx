'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoAlert } from '../../components/VideoAlert'

export function PersistentVideoAlert() {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const lastViewedTime = localStorage.getItem('videoLastViewed')
    const currentTime = new Date().getTime()

    if (!lastViewedTime || currentTime - parseInt(lastViewedTime) > 24 * 60 * 60 * 1000) {
      setShowVideo(true)
    }
  }, [])

  const handleVideoClose = () => {
    setShowVideo(false)
    localStorage.setItem('videoLastViewed', new Date().getTime().toString())
  }

  return (
    <AnimatePresence>
      {showVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40" />
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <VideoAlert setShowVideo={handleVideoClose} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

