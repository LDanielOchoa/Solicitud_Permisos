'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Menu } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  const pathname = usePathname()
  const notificationsPanelRef = useRef<HTMLDivElement>(null)

  const navItems = [
    { href: '/solicitud-permisos', label: 'Permisos' },
    { href: '/solicitud-equipo', label: 'Postulaciones' },
    { href: '/solicitudes-global', label: 'Historial' },
  ]

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const response = await fetch('https://solicitud-permisos.onrender.com/auth/user', {
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsPanelRef.current && !notificationsPanelRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handlePhoneUpdate = async (newPhone: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) throw new Error('El token no funciona')

      const response = await fetch('https://solicitud-permisos.onrender.com/auth/update-phone', {
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

  const isFormPage = navItems.some(item => item.href === pathname)

  if (!isFormPage) return null

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-md"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col space-y-4 mt-8">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href} passHref>
                    <Button 
                      variant="ghost" 
                      className={`justify-start text-green-700 hover:text-green-800 hover:bg-green-100/50 transition-all duration-300 ${
                        pathname === item.href ? 'bg-green-100/50 font-medium' : ''
                      }`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="hidden lg:flex space-x-2 overflow-x-auto scrollbar-hide">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button 
                  variant="ghost" 
                  className={`whitespace-nowrap text-green-700 hover:text-green-800 hover:bg-green-100/50 transition-all duration-300 ${
                    pathname === item.href ? 'bg-green-100/50 font-medium scale-105' : ''
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
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
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    ref={notificationsPanelRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50"
                    style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}
                  >
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
    </motion.nav>
  )
}