'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VideoAlert } from '../../components/VideoAlert'
import { Button } from '@/components/ui/button'
import { Video } from 'lucide-react'

export function PersistentVideoMessage() {
  const [showVideoAlert, setShowVideoAlert] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-green-100 p-4 rounded-lg shadow-md mb-4 flex items-center justify-between"
    >
      <div className="flex items-center space-x-3">
        <Video className="text-green-600 h-6 w-6" />
        <span className="text-green-800 font-medium">
          Video explicativo de cómo solicitar permisos
        </span>
      </div>
      <Button
        onClick={() => setShowVideoAlert(true)}
        className="bg-green-500 hover:bg-green-600 text-white"
      >
        Ver Video
      </Button>
      {showVideoAlert && <VideoAlert setShowVideo={setShowVideoAlert} />}
    </motion.div>
  )
}

