'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, Phone, FileText, User, Code, Type, CheckCircle, XCircle, Paperclip, CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import './request-details.css'

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

const MotionCard = motion(Card)

export default function RequestDetails({ request, onClose, onAction }: RequestDetailsProps) {
  const [reason, setReason] = useState('')
  const [activeSection, setActiveSection] = useState('info')

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'pending'
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      default:
        return ''
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 request-details-overlay flex items-center justify-center z-50 p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 15 }}
          className="request-details-container rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b z-10 p-6">
            <div className="flex justify-between items-center">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
                  Detalles de la Solicitud
                </h2>
                <p className="text-gray-500">ID: {request.id}</p>
              </motion.div>
              <motion.div
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-6 w-6" />
                </Button>
              </motion.div>
            </div>
            <div className="flex space-x-4 mt-4">
              <Button
                variant={activeSection === 'info' ? "default" : "outline"}
                onClick={() => setActiveSection('info')}
              >
                Información
              </Button>
              <Button
                variant={activeSection === 'dates' ? "default" : "outline"}
                onClick={() => setActiveSection('dates')}
              >
                Fechas
              </Button>
              <Button
                variant={activeSection === 'files' ? "default" : "outline"}
                onClick={() => setActiveSection('files')}
              >
                Archivos
              </Button>
              {request.status === 'pending' && (
                <Button
                  variant={activeSection === 'action' ? "default" : "outline"}
                  onClick={() => setActiveSection('action')}
                >
                  Acción
                </Button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <AnimatePresence mode="wait">
              {activeSection === 'info' && (
                <motion.div
                  key="info"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
                  }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center space-x-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <CardTitle>Información del Solicitante</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Code className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Código:</span>
                        <span>{request.code}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Nombre:</span>
                        <span>{request.name}</span>
                      </motion.div>
                      {request.phone && (
                        <motion.div
                          className="flex items-center space-x-2"
                          whileHover={{ scale: 1.05 }}
                        >
                          <Phone className="w-5 h-5 text-gray-500" />
                          <span className="font-medium">Teléfono:</span>
                          <span>{request.phone}</span>
                        </motion.div>
                      )}
                    </CardContent>
                  </MotionCard>

                  <MotionCard variants={cardVariants}>
                    <CardHeader className="flex flex-row items-center space-x-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      <CardTitle>Detalles de la Solicitud</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Type className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Tipo:</span>
                        <span>{request.type || request.noveltyType}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Calendar className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Fecha:</span>
                        <span>{format(new Date(request.createdAt), 'PPP', { locale: es })}</span>
                      </motion.div>
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Estado:</span>
                        <Badge className={`status-badge ${getStatusColor(request.status)}`}>
                          {request.status}
                        </Badge>
                      </motion.div>
                    </CardContent>
                  </MotionCard>

                  {request.description && (
                    <MotionCard variants={cardVariants} className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Descripción</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{request.description}</p>
                      </CardContent>
                    </MotionCard>
                  )}
                </motion.div>
              )}

              {activeSection === 'dates' && (
                <motion.div
                  key="dates"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardVariants}
                >
                  <MotionCard>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CalendarIcon className="w-5 h-5 text-purple-500" />
                        <span>Fechas Solicitadas</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {Array.isArray(request.dates) && request.dates.length > 0 ? (
                          request.dates.map((date: string, index: number) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge className="date-badge">
                                {format(new Date(date), 'PPP', { locale: es })}
                              </Badge>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-500">No hay fechas disponibles</p>
                        )}
                      </div>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              )}

              {activeSection === 'files' && (
                <motion.div
                  key="files"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardVariants}
                >
                  <MotionCard>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Paperclip className="w-5 h-5 text-orange-500" />
                        <span>Archivos Adjuntos</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3">
                        {Array.isArray(request.files) && request.files.length > 0 ? (
                          request.files.map((file: string, index: number) => (
                            <motion.div
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Badge className="file-badge">
                                {file}
                              </Badge>
                            </motion.div>
                          ))
                        ) : (
                          <p className="text-gray-500">No hay archivos adjuntos</p>
                        )}
                      </div>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              )}

              {activeSection === 'action' && request.status === 'pending' && (
                <motion.div
                  key="action"
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardVariants}
                >
                  <MotionCard>
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
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="destructive"
                            onClick={() => onAction(request.id, 'reject', reason)}
                            className="action-button"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="default"
                            onClick={() => onAction(request.id, 'approve', reason)}
                            className="action-button"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Aprobar
                          </Button>
                        </motion.div>
                      </div>
                    </CardContent>
                  </MotionCard>
                </motion.div>
              )}
            </AnimatePresence>

            {request.reason && (
              <MotionCard variants={cardVariants}>
                <CardHeader>
                  <CardTitle>Razón de la Decisión</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{request.reason}</p>
                </CardContent>
              </MotionCard>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

