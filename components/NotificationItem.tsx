import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

interface NotificationItemProps {
  notification: {
    id: number
    uniqueId: string
    type: 'permiso' | 'equipo'
    status: 'pending' | 'approved' | 'rejected'
    date: string
    description: string
    reason?: string
    isRead: boolean
    notifications: number
  }
  onMarkAsRead: (id: number) => void
  onUpdateStatus: (id: number, status: number) => Promise<void>
}

export default function NotificationItem({ notification, onMarkAsRead, onUpdateStatus }: NotificationItemProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className={`
        relative p-4 rounded-lg border transition-all cursor-pointer
        ${notification.isRead ? 'opacity-70' : ''}
        ${getStatusColor(notification.status)}
        hover:shadow-md
      `}
      onClick={() => {
        onMarkAsRead(notification.id)
        if (notification.notifications === 0 && notification.status !== 'pending') {
          onUpdateStatus(notification.id, notification.notifications)
            .catch(error => {
              console.error('Failed to update notification status:', error)
              toast({
                title: "Error",
                description: "No se pudo actualizar el estado de la notificación. Por favor, intente de nuevo.",
                variant: "destructive",
              })
            })
        }
      }}
      onDoubleClick={() => {
        if (notification.status !== 'pending') {
          onUpdateStatus(notification.id, notification.notifications)
            .catch(error => {
              console.error('Failed to update notification status:', error)
              toast({
                title: "Error",
                description: "No se pudo actualizar el estado de la notificación. Por favor, intente de nuevo.",
                variant: "destructive",
              })
            })
        }
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
        <Badge className={getStatusColor(notification.status)}>
          {getStatusText(notification.status)}
        </Badge>
      </div>
      {notification.reason && (
        <div className="mt-2 text-sm">
          <strong>Razón:</strong> {notification.reason}
        </div>
      )}
      {!notification.isRead && notification.status !== 'pending' && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <span className="flex h-2 w-2 rounded-full bg-green-600" />
        </motion.div>
      )}
    </motion.div>
  )
}

