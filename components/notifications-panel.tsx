'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Bell, Calendar, Filter, SortDesc, CheckCheck } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Notification {
  id: string
  type: 'permiso' | 'equipo'
  status: 'pending' | 'approved' | 'rejected'
  date: string
  description: string
  reason?: string
  request: any
  isRead: boolean
}

interface NotificationsPanelProps {
  onClose: () => void
  onMarkAllAsRead: () => void
}

export default function NotificationsPanel({ onClose, onMarkAllAsRead }: NotificationsPanelProps) {
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const notificationsPerPage = 5

  useEffect(() => {
    const userCode = localStorage.getItem('userCode')
    const permitRequests = JSON.parse(localStorage.getItem('permitRequests') || '[]')
    const equipmentRequests = JSON.parse(localStorage.getItem('equipmentRequests') || '[]')
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]')

    const userNotifications = [
      ...permitRequests
        .filter((req: any) => req.code === userCode)
        .map((req: any) => ({
          id: req.id,
          type: 'permiso',
          status: req.status,
          date: req.createdAt,
          description: `Solicitud de ${req.noveltyType}`,
          reason: req.reason,
          request: req,
          isRead: readNotifications.includes(req.id)
        })),
      ...equipmentRequests
        .filter((req: any) => req.code === userCode)
        .map((req: any) => ({
          id: req.id,
          type: 'equipo',
          status: req.status,
          date: req.createdAt,
          description: `Solicitud de ${req.type}`,
          reason: req.reason,
          request: req,
          isRead: readNotifications.includes(req.id)
        }))
    ]

    setNotifications(userNotifications)
  }, [])

  const markAsRead = (notificationId: string) => {
    const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]')
    if (!readNotifications.includes(notificationId)) {
      const updatedReadNotifications = [...readNotifications, notificationId]
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadNotifications))
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      )
    }
  }

  const filteredNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true
      return notification.type === filter
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime()
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    })

  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage)
  const currentNotifications = filteredNotifications.slice(
    (currentPage - 1) * notificationsPerPage,
    currentPage * notificationsPerPage
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'approved':
        return 'Aprobada'
      case 'rejected':
        return 'Rechazada'
      default:
        return status
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="absolute top-16 right-0 w-[480px] bg-white shadow-xl rounded-lg overflow-hidden border"
      >
        <CardHeader className="border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <CardTitle>Notificaciones</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={onMarkAllAsRead}
                className="text-sm"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                Marcar todo como leído
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 flex-1">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="permiso">Permisos</SelectItem>
                  <SelectItem value="equipo">Equipos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 flex-1">
              <SortDesc className="w-4 h-4 text-gray-500" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {currentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentNotifications.map(notification => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`
                      relative p-4 rounded-lg border transition-all
                      ${notification.isRead ? 'bg-white' : 'bg-blue-50'}
                      ${getStatusColor(notification.status)}
                    `}
                    onClick={() => {
                      setSelectedNotification(notification)
                      markAsRead(notification.id)
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <h3 className="font-medium">{notification.description}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(notification.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Badge variant={
                        notification.status === 'approved' ? 'success' :
                        notification.status === 'rejected' ? 'destructive' :
                        'warning'
                      }>
                        {getStatusText(notification.status)}
                      </Badge>
                    </div>
                    {notification.reason && (
                      <div className="mt-2 text-sm">
                        <strong>Razón:</strong> {notification.reason}
                      </div>
                    )}
                    {!notification.isRead && (
                      <div className="absolute top-2 right-2">
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {totalPages > 1 && (
          <div className="border-t p-4">
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Siguiente
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  )
}

