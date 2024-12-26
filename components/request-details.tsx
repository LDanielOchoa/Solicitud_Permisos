'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Calendar, Clock, Phone, FileText, User, Code, Type, CheckCircle, XCircle, Paperclip, CalendarIcon, MapPin, Users } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO, isValid } from 'date-fns'
import { es } from 'date-fns/locale'
import FilePreviewModal from './file-preview-modal'
import FilePreviewThumbnail from './file-preview-thumbnail'
import { toast } from 'sonner'

type FileInfo = {
  fileName: string
  fileUrl: string
}

type Request = {
  id: string
  code: string
  name: string
  type: string
  status: string
  createdAt: string
  description?: string
  zona?: string
  codeAM?: string
  codePM?: string
  shift?: string
  dates?: string[] | string
  files?: string[] | FileInfo[]
  file_name?: string[]
  file_url?: string[]
  noveltyType?: string
  reason?: string
  [key: string]: any
}

type RequestDetailsProps = {
  request: Request
  onClose: () => void
  onAction: (id: string, action: 'approve' | 'reject', reason: string) => void
}

function processFiles(request: Request): FileInfo[] {
  if (!request.files && !request.file_name && !request.file_url) return []

  try {
    if (Array.isArray(request.files) && request.files.length > 0 && typeof request.files[0] === 'object') {
      return request.files as FileInfo[]
    }

    if (Array.isArray(request.file_name) && Array.isArray(request.file_url)) {
      return request.file_name.map((name, index) => ({
        fileName: name,
        fileUrl: request.file_url![index]
      }))
    }

    if (Array.isArray(request.files)) {
      return request.files.map(file => ({
        fileName: Array.isArray(file) ? file[0] : file,
        fileUrl: Array.isArray(file) ? file[0] : file
      }))
    }
  } catch (error) {
    console.error('Error processing files:', error)
    toast.error('Error al procesar los archivos')
  }

  return []
}

const MotionCard = motion(Card)

export default function RequestDetails({ request, onClose, onAction }: RequestDetailsProps) {
  const [reason, setReason] = useState('')
  const [activeSection, setActiveSection] = useState('info')
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const isEquipmentRequest = !('noveltyType' in request)
  const processedFiles = useMemo(() => processFiles(request), [request])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const renderSections = useMemo(() => {
    const sections = ['info']
    
    if (!isEquipmentRequest) {
      sections.push('dates', 'files')
    }
    
    if (request.status === 'pending') {
      sections.push('action')
    }

    return (
      <div className="flex space-x-4 mt-4">
        {sections.map(section => (
          <Button
            key={section}
            variant={activeSection === section ? "default" : "outline"}
            onClick={() => setActiveSection(section)}
          >
            {section === 'info' ? 'Información' :
             section === 'dates' ? 'Fechas' :
             section === 'files' ? 'Archivos' :
             'Acción'}
          </Button>
        ))}
      </div>
    )
  }, [activeSection, isEquipmentRequest, request.status])

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Fecha no disponible';
    
    const dates = dateString.split(',');
    return dates.map(date => {
      const parsedDate = parseISO(date.trim());
      return isValid(parsedDate) ? format(parsedDate, 'PPP', { locale: es }) : 'Fecha inválida';
    }).join('     -    ');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b z-10 p-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Badge 
                variant="outline" 
                className={`mb-2 ${
                  isEquipmentRequest ? 'bg-blue-50 text-blue-700 border-blue-300' : 
                  'bg-purple-50 text-purple-700 border-purple-300'
                }`}
              >
                {isEquipmentRequest ? 'Solicitud de Equipo' : 'Solicitud de Permiso'}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {request.type}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">ID: {request.id}</p>
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
          {renderSections}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <AnimatePresence mode="wait">
            {activeSection === 'info' && (
              <motion.div
                key="section-info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                      <span>{request.type}</span>
                    </motion.div>
                    <motion.div
                      className="flex items-center space-x-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">Fecha:</span>
                      <span>{formatDate(request.createdAt)}</span>
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
                    {request.zona && (
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <MapPin className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Zona:</span>
                        <span>{request.zona}</span>
                      </motion.div>
                    )}
                    {(request.codeAM || request.codePM) && (
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Users className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Códigos:</span>
                        <span>
                          {request.codeAM && `AM: ${request.codeAM}`}
                          {request.codeAM && request.codePM && ', '}
                          {request.codePM && `PM: ${request.codePM}`}
                        </span>
                      </motion.div>
                    )}
                    {request.shift && (
                      <motion.div
                        className="flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                      >
                        <Clock className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">Turno:</span>
                        <span>{request.shift}</span>
                      </motion.div>
                    )}
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

            {!isEquipmentRequest && activeSection === 'dates' && (
              <motion.div
                key="section-dates"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
                      {Array.isArray(request.dates) ? (
                        request.dates.map((date: string, index: number) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge className="date-badge">
                              {formatDate(date)}
                            </Badge>
                          </motion.div>
                        ))
                      ) : typeof request.dates === 'string' ? (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Badge className="date-badge">
                            {formatDate(request.dates)}
                          </Badge>
                        </motion.div>
                      ) : (
                        <p className="text-gray-500">No hay fechas disponibles</p>
                      )}
                    </div>
                  </CardContent>
                </MotionCard>
              </motion.div>
            )}

            {!isEquipmentRequest && activeSection === 'files' && (
              <motion.div
                key="section-files"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <MotionCard>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Paperclip className="w-5 h-5 text-orange-500" />
                      <span>Archivos Adjuntos</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {processedFiles.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {processedFiles.map((file, index) => (
                          <motion.div
                            key={file.fileUrl}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative"
                          >
                            <Card className="overflow-hidden">
                              <CardContent className="p-3">
                                <FilePreviewThumbnail
                                  fileName={file.fileName}
                                  fileUrl={file.fileUrl}
                                  onClick={() => setSelectedFile(file)}
                                />
                                <p className="mt-2 text-sm text-muted-foreground truncate">
                                  {file.fileName}
                                </p>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay archivos adjuntos</p>
                    )}
                  </CardContent>
                </MotionCard>
              </motion.div>
            )}

            {activeSection === 'action' && request.status === 'pending' && (
              <motion.div
                key="section-action"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
            <MotionCard>
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
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </motion.div>
  )
}


