'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Notification {
  id: string
  status: 'approved' | 'rejected'
  message: string
  type: string
  date: string
  isNew: boolean
}

export function EnhancedNotifications({ 
  hasNewNotification, 
  userName, 
  notifications,
  onClose 
}: { 
  hasNewNotification: boolean
  userName: string
  notifications: Notification[]
  onClose: () => void
}) {
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (hasNewNotification) {
      setShowNotification(true)
    }
  }, [hasNewNotification])

  const handleClose = () => {
    setShowNotification(false)
    onClose()
  }

  if (!showNotification || !hasNewNotification || notifications.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <Card className="max-w-md mx-auto overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-green-400 to-green-600 p-4">
              <div className="flex items-center justify-between mb-4">
                <motion.div
                  className="flex items-center space-x-2 text-white"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                >
                  <Bell className="h-6 w-6" />
                  <h3 className="text-lg font-semibold">¡Nuevas Actualizaciones!</h3>
                </motion.div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="text-white hover:bg-white/20"
                >
                  <motion.span
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    ✕
                  </motion.span>
                </Button>
              </div>
              <p className="text-white/90 text-sm mb-4">
                Hola {userName}, tienes nuevas actualizaciones en tus solicitudes:
              </p>
            </div>
            <div className="bg-white dark:bg-green-900 p-4 space-y-3">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    notification.status === 'approved'
                      ? 'bg-green-50 dark:bg-green-800/50'
                      : 'bg-red-50 dark:bg-red-900/50'
                  }`}
                >
                  {notification.status === 'approved' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      notification.status === 'approved'
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {notification.date}
                    </p>
                  </div>
                </motion.div>
              ))}
              <Button
                onClick={() => {
                  handleClose()
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }}
                className="w-full bg-green-600 text-white hover:bg-green-700 transition-colors duration-300"
              >
                Ver Todas las Actualizaciones
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

