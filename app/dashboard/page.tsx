'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Briefcase, List, Bell } from 'lucide-react'
import Navigation from '../../components/navigation'
import AnimatedDashboardButton from '../../components/AnimatedDashboardButtonn'
import WelcomeBar from '../../components/WelcomeBar'
import LoadingOverlay from '../../components/loading-overlay'
import { PersistentVideoMessage } from './PersistentVideoMessage'
import { EnhancedNotifications } from './EnhancedNotifications'
import { toast, Toaster } from 'react-hot-toast'

interface NotificationItem {
  id: string
  status: 'approved' | 'rejected'
  type: string
  message: string
  date: string
  created_at: string
  isNew: boolean
}

export default function Dashboard() {
  const [userName, setUserName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date')
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Fecha no disponible'
    }
  }

  const shouldShowNotification = (notification: NotificationItem) => {
    const lastViewedTime = localStorage.getItem(`notification_${notification.id}_viewed`)
    if (!lastViewedTime) return true

    const viewedDate = new Date(lastViewedTime)
    const currentDate = new Date()
    const timeDiff = currentDate.getTime() - viewedDate.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    return hoursDiff > 24
  }

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
        const formattedNotifications = data
          .filter((request: any) => request.status === 'approved' || request.status === 'rejected')
          .map((request: any) => ({
            id: request.id,
            status: request.status,
            type: request.type,
            message: `Tu solicitud para ${request.type} ha sido ${request.status === 'approved' ? 'aprobada' : 'rechazada'}.`,
            date: formatDate(request.created_at),
            created_at: request.created_at,
            isNew: shouldShowNotification(request)
          }))
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setNotifications(formattedNotifications)
        
        // Only show notifications for the last 2 requests that haven't been viewed in 24 hours
        const newNotifications = formattedNotifications
          .filter((n: any) => n.isNew)
          .slice(0, 2)
        
        setHasNewNotification(newNotifications.length > 0)
        
        // Store in localStorage
        localStorage.setItem('dashboardNotifications', JSON.stringify(formattedNotifications))
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      const storedNotifications = localStorage.getItem('dashboardNotifications')
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications))
      }
    }
  }

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
          
          // Load stored notifications first
          const storedNotifications = localStorage.getItem('dashboardNotifications')
          if (storedNotifications) {
            const parsedNotifications = JSON.parse(storedNotifications)
            setNotifications(parsedNotifications)
          }
          
          fetchRequests(data.code)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        const storedNotifications = localStorage.getItem('dashboardNotifications')
        if (storedNotifications) {
          setNotifications(JSON.parse(storedNotifications))
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (userName) {
      const interval = setInterval(() => fetchRequests(userName), 30000)
      return () => clearInterval(interval)
    }
  }, [userName])

  const markNotificationsAsViewed = () => {
    const currentDate = new Date().toISOString()
    notifications.forEach(notification => {
      localStorage.setItem(`notification_${notification.id}_viewed`, currentDate)
    })
    setHasNewNotification(false)
  }

  if (isLoading) {
    return <LoadingOverlay />
  }

  // Get only the last 2 unviewed notifications for the popup
  const recentNotifications = notifications
    .filter(n => n.isNew)
    .slice(0, 2)

  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden relative bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
      <Navigation />
      <Toaster position="top-right" />
      
      <EnhancedNotifications 
        hasNewNotification={hasNewNotification} 
        userName={userName}
        notifications={recentNotifications}
        onClose={markNotificationsAsViewed}
      />
      
      <motion.div 
        className="container mx-auto max-w-6xl relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <WelcomeBar userName={userName} />

        <PersistentVideoMessage />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
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
                  stiffness: 500, 
                  damping: 30,
                }}
              >
                <Bell className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </AnimatedDashboardButton>
        </motion.div>
      </motion.div>
    </div>
  )
}

