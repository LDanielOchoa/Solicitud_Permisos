'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Briefcase, List } from 'lucide-react'
import Navigation from '../../components/navigation'
import AnimatedDashboardButton from '../../components/AnimatedDashboardButton'
import WelcomeBar from '../../components/WelcomeBar'
import LoadingOverlay from '../../components/loading-overlay'
import { VideoAlert } from '../../components/VideoAlert'
import { PersistentVideoMessage } from './PersistentVideoMessage'

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [showVideo, setShowVideo] = useState(true)

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
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  if (isLoading) {
    return <LoadingOverlay />
  }

  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden relative">
      <Navigation />
      
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
          />
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

