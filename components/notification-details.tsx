'use client'

import { motion } from 'framer-motion'
import { X, Calendar, Clock, FileText, User, Code, Type, Phone } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface NotificationDetailsProps {
  notification: any
  onClose: () => void
}

export default function NotificationDetails({ notification, onClose }: NotificationDetailsProps) {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-bold">Detalles de la Solicitud</h2>
              <p className="text-gray-500">
                {notification.type === 'permiso' ? 'Solicitud de Permiso' : 'Solicitud de Equipo'}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center space-x-2">
                  <User className="w-4 h-4" />
                  <div>
                    <CardTitle>Información del Solicitante</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Code className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Código:</span>
                    <span>{notification.request.code}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Nombre:</span>
                    <span>{notification.request.name}</span>
                  </div>
                  {notification.request.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">Teléfono:</span>
                      <span>{notification.request.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <div>
                    <CardTitle>Estado de la Solicitud</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Tipo:</span>
                    <span>
                      {notification.type === 'permiso' 
                        ? notification.request.noveltyType 
                        : notification.request.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Fecha:</span>
                    <span>
                      {format(new Date(notification.date), 'PPP', { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Estado:</span>
                    <Badge className={getStatusColor(notification.status)}>
                      {getStatusText(notification.status)}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {notification.request.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{notification.request.description}</p>
                </CardContent>
              </Card>
            )}

            {notification.request.dates && (
              <Card>
                <CardHeader>
                  <CardTitle>Fechas Solicitadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {notification.request.dates.map((date: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {format(new Date(date), 'PPP', { locale: es })}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {notification.request.files && notification.request.files.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Archivos Adjuntos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {notification.request.files.map((file: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {notification.reason && (
              <Card>
                <CardHeader>
                  <CardTitle>Razón de la Decisión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{notification.reason}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  )
}

