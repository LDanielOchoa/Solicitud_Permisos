'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Clock, Phone, FileText, User, Code, Type } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

type Request = {
  id: string
  code: string
  name: string
  type: string
  status: string
  createdAt: string
  [key: string]: any
}

type RequestDetailsProps = {
  request: Request
  onClose: () => void
  onAction: (id: string, action: 'approve' | 'reject', reason: string) => void
}

export default function RequestDetails({ request, onClose, onAction }: RequestDetailsProps) {
  const [reason, setReason] = useState('')

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
        className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b z-10">
          <div className="flex justify-between items-center p-6">
            <div>
              <h2 className="text-2xl font-bold">Detalles de la Solicitud</h2>
              <p className="text-gray-500">ID: {request.id}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

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
                  <span>{request.code}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Nombre:</span>
                  <span>{request.name}</span>
                </div>
                {request.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Teléfono:</span>
                    <span>{request.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center space-x-2">
                <FileText className="w-4 h-4" />
                <div>
                  <CardTitle>Detalles de la Solicitud</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Tipo:</span>
                  <span>{request.type || request.noveltyType}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Fecha:</span>
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Estado:</span>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {request.description && (
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.description}</p>
              </CardContent>
            </Card>
          )}

          {request.dates && (
            <Card>
              <CardHeader>
                <CardTitle>Fechas Solicitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(request.dates) && request.dates.length > 0 ? (
                    request.dates.map((date: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {format(new Date(date), 'PPP', { locale: es })}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500">No hay fechas disponibles</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          {request.files && request.files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Archivos Adjuntos</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(request.files) && request.files.length > 0 ? (
                  request.files.map((file: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {file}
                    </Badge>
                  ))
                ) : (
                  <p className="text-gray-500">No hay archivos adjuntos</p>
                )}
              </div>
            </CardContent>
            </Card>
          )}
          {request.status === 'pending' && (
            <Card>
              <CardHeader>
                <CardTitle>Acción</CardTitle>
                <CardDescription>
                  Proporcione una razón para aprobar o rechazar esta solicitud
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Razón de aprobación o rechazo"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end space-x-4">
                  <Button 
                    variant="destructive"
                    onClick={() => onAction(request.id, 'reject', reason)}
                  >
                    Rechazar
                  </Button>
                  <Button 
                    variant="default"
                    onClick={() => onAction(request.id, 'approve', reason)}
                  >
                    Aprobar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {request.reason && (
            <Card>
              <CardHeader>
                <CardTitle>Razón de la Decisión</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{request.reason}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

