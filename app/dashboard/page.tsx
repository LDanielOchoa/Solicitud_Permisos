'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Briefcase } from 'lucide-react'
import Navigation from '../../components/navigation'
import AnimatedDashboardButton from '../../components/AnimatedDashboardButton'
import WelcomeBar from '../../components/WelcomeBar'

export default function Dashboard() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const response = await fetch('http://127.0.0.1:8000/auth/user', {
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
      }
    }

    fetchUserData()
  }, [])

  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden">
      <Navigation />
      
      <div className="container mx-auto max-w-6xl">
        <WelcomeBar userName={userName} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
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
        </motion.div>
      </div>
    </div>
  )
}


