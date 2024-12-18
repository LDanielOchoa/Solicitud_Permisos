'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import NotificationsPanel from './notifications-panel'

export default function Navigation() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()

  const isFormPage = pathname === '/solicitud-permisos' || pathname === '/solicitud-equipo'

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

  if (!isFormPage) return null

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white bg-opacity-70 backdrop-blur-lg shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/solicitud-permisos" className="text-green-700 hover:text-green-900 px-3 py-2 rounded-md text-sm font-medium">
              Solicitud de Permisos
            </Link>
            <Link href="/solicitud-equipo" className="text-green-700 hover:text-green-900 px-3 py-2 rounded-md text-sm font-medium">
              Solicitud de Equipo
            </Link>
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </Button>
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
    </nav>
  )
}

