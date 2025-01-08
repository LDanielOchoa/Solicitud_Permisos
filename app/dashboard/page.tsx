'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Briefcase, List, Bell } from 'lucide-react'
import Navigation from '../../components/navigation'
import AnimatedDashboardButton from '../../components/AnimatedDashboardButtonn'
import WelcomeBar from '../../components/WelcomeBar'
import LoadingOverlay from '../../components/loading-overlay'
import { VideoAlert } from '../../components/VideoAlert'
import { PersistentVideoMessage } from './PersistentVideoMessage'
import { toast, Toaster } from 'react-hot-toast'

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(true)
  const [hasNewNotification, setHasNewNotification] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setIsLoading(false)
          return
        }

        const response = await fetch('https://solicitud-permisos.onrender.com/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          setUserName(data.name)
          fetchRequests(data.code)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const fetchRequests = async (userCode: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await fetch(`https://solicitud-permisos.onrender.com/requests/${userCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const hasNewNotification = Array.isArray(data) && data.some(request => 
          (request.status === 'approved' || request.status === 'rejected') && request.notifications === '0'
        )
        setHasNewNotification(hasNewNotification)
        if (hasNewNotification) {
          toast.success('Tienes nuevas actualizaciones en tus solicitudes!', {
            duration: 6000,
            icon: '🔔',
          })
        }
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    }
  }

  useEffect(() => {
    if (userName) {
      const interval = setInterval(() => fetchRequests(userName), 30000) // Check every 30 seconds
      return () => clearInterval(interval)
    }
  }, [userName])

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden relative">
      <Navigation />
      <Toaster position="top-right" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <WelcomeBar userName={userName} />

        <PersistentVideoMessage />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8"
        >
          <AnimatedDashboardButton
            href="/solicitud-permisos"
            icon={FileText}
            title="Permisos"
            description="Gestione sus solicitudes de descansos, licencias entre otros..."
            color="bg-gradient-to-br from-green-400 to-green-600"
          />
          <AnimatedDashboardButton
            href="/solicitud-equipo"
            icon={Briefcase}
            title="Postulaciones"
            description="Solicite aqui los turno pareja, tabla partida y disponible fijo."
            color="bg-gradient-to-br from-green-600 to-green-700"
          />
          <AnimatedDashboardButton
            href="/solicitudes-global"
            icon={List}
            title="Mis Solicitudes"
            description="Ver todas sus solicitudes aceptadas y rechazadas."
            color="bg-gradient-to-br from-green-500 to-green-600"
          >
            {hasNewNotification && (
              <motion.div
                className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <Bell className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </AnimatedDashboardButton>
        </motion.div>
      </div>

      {showVideo && (
        <>
          <div className="fixed inset-0 bg-black/01 backdrop-blur-md z-40" />
          <div className="fixed inset-0 z-50">
            <VideoAlert setShowVideo={setShowVideo} />
          </div>
        </>
      )}
    </div>
  )
}

