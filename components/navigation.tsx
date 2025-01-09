'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useAnimation, useScroll } from 'framer-motion'
import { Button } from "@/components/ui/button"
import NotificationsPanel from './notifications-panel'
import ProfileMenu from './profile-menu'

interface UserData {
  code: string
  name: string
  phone: string
}

export default function Navigation() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(true)
  const pathname = usePathname()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()

  const { scrollXProgress } = useScroll({
    container: scrollContainerRef
  })

  useEffect(() => {
    const updateScrollButtons = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        setShowLeftScroll(scrollLeft > 0)
        setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 1)
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollButtons)
      updateScrollButtons()
      return () => scrollContainer.removeEventListener('scroll', updateScrollButtons)
    }
  }, [])

  useEffect(() => {
    const animateScroll = async () => {
      await controls.start({
        x: [0, -10, 0],
        transition: { repeat: 3, duration: 1.5 }
      })
    }
    animateScroll()
  }, [controls])

  const isFormPage = pathname === '/solicitud-permisos' || pathname === '/solicitud-equipo' || pathname === '/solicitudes-global'

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
          setUserData(data)
        }
      } catch (error) {
        console.error('Error accediendo a los datos ', error)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    const updateUnreadCount = () => {
      const userCode = localStorage.getItem('userCode')
      const permitRequests = JSON.parse(localStorage.getItem('permitRequests') || '[]')
      const equipmentRequests = JSON.parse(localStorage.getItem('equipmentRequests') || '[]')
      const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]')

      const userNotifications = [
        ...permitRequests
          .filter((req: any) => req.code === userCode && req.status !== 'pending')
          .map((req: any) => req.id),
        ...equipmentRequests
          .filter((req: any) => req.code === userCode && req.status !== 'pending')
          .map((req: any) => req.id)
      ]

      const unreadCount = userNotifications.filter(id => !readNotifications.includes(id)).length
      setUnreadCount(unreadCount)
    }

    updateUnreadCount()
    window.addEventListener('storage', updateUnreadCount)
    return () => window.removeEventListener('storage', updateUnreadCount)
  }, [])

  const handlePhoneUpdate = async (newPhone: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('El token no funciona')

      const response = await fetch('http://127.0.0.1:8000/auth/update-phone', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: newPhone }),
      })

      if (!response.ok) throw new Error('Error al actualizar el teléfono')

      setUserData(prev => prev ? { ...prev, phone: newPhone } : null)
    } catch (error) {
      console.error('Error actualizando el telefono', error)
      throw error
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  if (!isFormPage) return null

  return (
    <motion.nav 
      className="fixed top-4 left-0 right-0 z-50"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-lg shadow-lg p-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1">
              {showLeftScroll && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                >
                  <ChevronLeft size={20} className="text-green-700" />
                </button>
              )}
              {showRightScroll && (
                <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-1 shadow-md z-10"
                >
                  <ChevronRight size={20} className="text-green-700" />
                </button>
              )}
              <motion.div 
                ref={scrollContainerRef}
                className="flex space-x-2 overflow-x-auto scrollbar-hide"
                animate={controls}
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <Link href="/solicitud-permisos" passHref>
                  <Button 
                    variant="ghost" 
                    className={`whitespace-nowrap text-green-700 hover:text-green-800 hover:bg-green-100/50 transition-all duration-300 ${
                      pathname === '/solicitud-permisos' ? 'bg-green-100/50 font-medium scale-105' : ''
                    }`}
                  >
                    Permisos
                  </Button>
                </Link>
                <Link href="/solicitud-equipo" passHref>
                  <Button 
                    variant="ghost" 
                    className={`whitespace-nowrap text-green-700 hover:text-green-800 hover:bg-green-100/50 transition-all duration-300 ${
                      pathname === '/solicitud-equipo' ? 'bg-green-100/50 font-medium scale-105' : ''
                    }`}
                  >
                    Postulaciones
                  </Button>
                </Link>
                <Link href="/solicitudes-global" passHref>
                  <Button 
                    variant="ghost" 
                    className={`whitespace-nowrap text-green-700 hover:text-green-800 hover:bg-green-100/50 transition-all duration-300 ${
                      pathname === '/solicitudes-global' ? 'bg-green-100/50 font-medium scale-105' : ''
                    }`}
                  >
                    Historial
                  </Button>
                </Link>
              </motion.div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-green-600 hover:text-green-700 hover:bg-green-100/50 transition-all duration-300"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </Button>
              {userData && (
                <ProfileMenu
                  code={userData.code}
                  name={userData.name}
                  phone={userData.phone}
                  onPhoneUpdate={handlePhoneUpdate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      {showNotifications && (
        <NotificationsPanel 
          onClose={() => setShowNotifications(false)} 
          onMarkAllAsRead={() => {
            const userCode = localStorage.getItem('userCode')
            const permitRequests = JSON.parse(localStorage.getItem('permitRequests') || '[]')
            const equipmentRequests = JSON.parse(localStorage.getItem('equipmentRequests') || '[]')
            
            const allNotificationIds = [
              ...permitRequests
                .filter((req: any) => req.code === userCode && req.status !== 'pending')
                .map((req: any) => req.id),
              ...equipmentRequests
                .filter((req: any) => req.code === userCode && req.status !== 'pending')
                .map((req: any) => req.id)
            ]
            
            localStorage.setItem('readNotifications', JSON.stringify(allNotificationIds))
            setUnreadCount(0)
          }}
        />
      )}
    </motion.nav>
  )
}

