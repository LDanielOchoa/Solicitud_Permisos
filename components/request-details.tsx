"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  X,
  Calendar,
  Clock,
  Phone,
  FileText,
  User,
  Code,
  Type,
  CheckCircle,
  XCircle,
  Paperclip,
  CalendarIcon,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format, parseISO, isValid } from "date-fns"
import { es } from "date-fns/locale"
import FilePreviewModal from "./file-preview-modal"
import FilePreviewThumbnail from "./file-preview-thumbnail"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type FileInfo = {
  fileName: string
  fileUrl: string
}

type Request = {
  id: string
  code: string
  name: string
  type: string
  time: string
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

type HistoryItem = {
  id: string
  type: string
  createdAt: string
  status: string
}

type RequestDetailsProps = {
  requests: Request[]
  onClose: () => void
  onAction: (id: string, action: "approve" | "reject", reason: string) => void
}

const MotionCard = motion(Card)

function processFiles(request: Request): FileInfo[] {
  if (!request.files && !request.file_name && !request.file_url) return []

  try {
    if (Array.isArray(request.files) && request.files.length > 0 && typeof request.files[0] === "object") {
      return request.files as FileInfo[]
    }

    if (Array.isArray(request.file_name) && Array.isArray(request.file_url)) {
      return request.file_name.map((name, index) => ({
        fileName: name,
        fileUrl: request.file_url![index],
      }))
    }

    if (Array.isArray(request.files)) {
      return request.files.map((file) => ({
        fileName: Array.isArray(file) ? file[0] : file,
        fileUrl: Array.isArray(file) ? file[0] : file,
      }))
    }
  } catch (error) {
    console.error("Error processing files:", error)
    toast.error("Error al procesar los archivos")
  }

  return []
}

export default function RequestDetails({ requests, onClose, onAction }: RequestDetailsProps) {
  const [reason, setReason] = useState("")
  const [selectedFile, setSelectedFile] = useState<FileInfo | null>(null)
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)
  const currentRequest = requests[currentRequestIndex]
  const isEquipmentRequest = !("noveltyType" in currentRequest)
  const processedFiles = useMemo(() => processFiles(currentRequest), [currentRequest])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    const fetchHistory = async () => {
      setIsLoadingHistory(true)
      setHistoryError(null)
      try {
        const response = await fetch(`https://solicitud-permisos.onrender.com/api/history/${currentRequest.code}`)
        if (!response.ok) {
          throw new Error("Failed to fetch history")
        }
        const data = await response.json()
        console.log("Historial recibido:", data)
        setHistory(data)
      } catch (error) {
        console.error("Error fetching history:", error)
        setHistoryError("Error al cargar el historial. Por favor, intente de nuevo.")
        toast.error("Error al cargar el historial")
      } finally {
        setIsLoadingHistory(false)
      }
    }
    fetchHistory()
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [currentRequest.code])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending"
      case "approved":
        return "approved"
      case "rejected":
        return "rejected"
      default:
        return ""
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Fecha no disponible"
    const date = parseISO(dateString)
    return isValid(date) ? format(date, "PPP", { locale: es }) : "Fecha inválida"
  }

  const renderInfoSection = () => (
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
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <Code className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Código:</span>
            <span>{currentRequest.code}</span>
          </motion.div>
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <User className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Nombre:</span>
            <span>{currentRequest.name}</span>
          </motion.div>
          {currentRequest.phone && (
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <Phone className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Teléfono:</span>
              <span>{currentRequest.phone}</span>
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
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <Type className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Tipo:</span>
            <span>{currentRequest.type}</span>
          </motion.div>
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Fecha:</span>
            <span>{formatDate(currentRequest.createdAt)}</span>
          </motion.div>
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Hora:</span>
            <span>{currentRequest.time}</span>
          </motion.div>
          <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Estado:</span>
            <Badge className={`status-badge ${getStatusColor(currentRequest.status)}`}>{currentRequest.status}</Badge>
          </motion.div>
          {currentRequest.zona && (
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <MapPin className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Zona:</span>
              <span>{currentRequest.zona}</span>
            </motion.div>
          )}
          {(currentRequest.codeAM || currentRequest.codePM) && (
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <Users className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Códigos:</span>
              <span>
                {currentRequest.codeAM && `AM: ${currentRequest.codeAM}`}
                {currentRequest.codeAM && currentRequest.codePM && ", "}
                {currentRequest.codePM && `PM: ${currentRequest.codePM}`}
              </span>
            </motion.div>
          )}
          {currentRequest.shift && (
            <motion.div className="flex items-center space-x-2" whileHover={{ scale: 1.05 }}>
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium">Turno:</span>
              <span>{currentRequest.shift}</span>
            </motion.div>
          )}
        </CardContent>
      </MotionCard>

      {currentRequest.description && (
        <MotionCard variants={cardVariants} className="md:col-span-2">
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{currentRequest.description}</p>
          </CardContent>
        </MotionCard>
      )}
    </motion.div>
  )

  const renderDatesSection = () => (
    <motion.div key="section-dates" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <MotionCard>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-purple-500" />
            <span>Fechas Solicitadas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {Array.isArray(currentRequest.dates) ? (
              currentRequest.dates.map((date: string, index: number) => (
                <motion.div key={index} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Badge className="date-badge">{formatDate(date)}</Badge>
                </motion.div>
              ))
            ) : typeof currentRequest.dates === "string" ? (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge className="date-badge">{formatDate(currentRequest.dates)}</Badge>
              </motion.div>
            ) : (
              <p className="text-gray-500">No hay fechas disponibles</p>
            )}
          </div>
        </CardContent>
      </MotionCard>
    </motion.div>
  )

  const renderFilesSection = () => (
    <motion.div key="section-files" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                      <p className="mt-2 text-sm text-muted-foreground truncate">{file.fileName}</p>
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
  )

  const renderActionSection = () => (
    <motion.div key="section-action" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <MotionCard>
        <CardHeader>
          <CardTitle>Acción</CardTitle>
          <CardDescription>Proporcione una razón para aprobar o rechazar esta solicitud</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Razón de aprobación o rechazo"
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end space-x-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="destructive"
                onClick={() => onAction(currentRequest.id, "reject", reason)}
                className="action-button"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="default"
                onClick={() => onAction(currentRequest.id, "approve", reason)}
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
  )

  const renderHistorySection = () => (
    <MotionCard>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span>Historial de Solicitudes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingHistory ? (
          <p>Cargando historial...</p>
        ) : historyError ? (
          <p className="text-red-500">{historyError}</p>
        ) : history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={`status-badge ${getStatusColor(item.status)}`}>{item.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No hay historial disponible para esta solicitud.</p>
        )}
      </CardContent>
    </MotionCard>
  )

  const renderSectionContent = (section: string) => {
    switch (section) {
      case "info":
        return renderInfoSection()
      case "dates":
        return renderDatesSection()
      case "files":
        return renderFilesSection()
      case "action":
        return renderActionSection()
      case "history":
        return renderHistorySection()
      default:
        return null
    }
  }

  const renderSections = useMemo(() => {
    const sections = ["info", "history"]

    if (!isEquipmentRequest) {
      sections.push("dates", "files")
    }

    if (currentRequest.status === "pending") {
      sections.push("action")
    }

    return (
      <Tabs defaultValue="info" className="w-full">
        <TabsList>
          {sections.map((section) => (
            <TabsTrigger key={section} value={section}>
              {section === "info"
                ? "Información"
                : section === "dates"
                  ? "Fechas"
                  : section === "files"
                    ? "Archivos"
                    : section === "history"
                      ? "Historial"
                      : "Acción"}
            </TabsTrigger>
          ))}
        </TabsList>
        {sections.map((section) => (
          <TabsContent key={section} value={section}>
            {renderSectionContent(section)}
          </TabsContent>
        ))}
      </Tabs>
    )
  }, [
    isEquipmentRequest,
    currentRequest.status,
    currentRequest,
    isLoadingHistory,
    historyError,
    history,
    processedFiles,
  ]) // Added processedFiles to dependencies

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
        transition={{ type: "spring", damping: 15 }}
        className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b z-10 p-6">
          <div className="flex justify-between items-center">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Badge
                variant="outline"
                className={`mb-2 ${
                  isEquipmentRequest
                    ? "bg-blue-50 text-blue-700 border-blue-300"
                    : "bg-purple-50 text-purple-700 border-purple-300"
                }`}
              >
                {isEquipmentRequest ? "Solicitud de Equipo" : "Solicitud de Permiso"}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentRequest.type}</h2>
              <p className="text-gray-500 dark:text-gray-400">ID: {currentRequest.id}</p>
            </motion.div>
            <motion.div whileHover={{ rotate: 90 }} whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-6 w-6" />
              </Button>
            </motion.div>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentRequestIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentRequestIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>
              {currentRequestIndex + 1} / {requests.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentRequestIndex((prev) => Math.min(requests.length - 1, prev + 1))}
              disabled={currentRequestIndex === requests.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {renderSections}
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* El contenido de las pestañas se renderiza automáticamente por el componente Tabs */}
        </div>
      </motion.div>
      {selectedFile && <FilePreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />}
    </motion.div>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 9f62569 (Add: Se agrego nueva funcioanlidad en request form)
