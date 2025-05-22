"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useInView } from "framer-motion"
import {
  Calendar,
  Clock,
  FileText,
  MapPin,
  ChevronDown,
  ChevronUp,
  List,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  Download,
  SlidersHorizontal,
  Plus,
  ArrowUpDown,
  Filter,
  Eye,
  ThumbsUp,
  MessageSquare,
  FileSpreadsheet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import LoadingOverlay from "../../components/loading-overlay"
import BottomNavigation from "../../components/bottom-navigation"
import { RequestDetailsDialog } from "./request-details-dialog"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/drawer"
import { Skeleton } from "@/components/ui/skeleton"

interface Request {
  id: number
  code: string
  name: string
  tipo_novedad: string
  description: string
  status: "approved" | "rejected" | "pending"
  respuesta: string
  zona?: string
  createdAt: string
  request_type: "permiso" | "postulaciones"
  fecha: string
  telefono?: string
  hora?: string
  comp_am?: string
  comp_pm?: string
  turno?: string
  [key: string]: string | number | undefined
}

export default function Solicitudes() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [expandedRequest, setExpandedRequest] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [userName, setUserName] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)
  const [isEmptyState, setIsEmptyState] = useState(false)

  // Referencias para animaciones de scroll
  const summaryRef = useRef(null)
  const filtersRef = useRef(null)
  const listRef = useRef(null)

  const summaryInView = useInView(summaryRef, { once: true, amount: 0.3 })
  const filtersInView = useInView(filtersRef, { once: true, amount: 0.3 })
  const listInView = useInView(listRef, { once: true, amount: 0.1 })

  const fetchRequests = async () => {
    try {
      setIsRefreshing(true)
      const token = localStorage.getItem("accessToken")
      if (!token) return

      // Intentar obtener datos del usuario
      try {
        const userResponse = await fetch("https://solicitud-permisos.sao6.com.co/api/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUserName(userData.name || "Usuario")
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setUserName("Usuario")
      }

      // Obtener solicitudes
      const response = await fetch("https://solicitud-permisos.sao6.com.co/api/solicitudes", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const typedData = data.map((req: any) => ({
          ...req,
          status: req.status as "approved" | "rejected" | "pending",
        }))
        setRequests(typedData)
        setFilteredRequests(typedData)
        setIsEmptyState(typedData.length === 0)
      }

      // Check for notifications
      const storedNotifications = localStorage.getItem("dashboardNotifications")
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications)
        setHasNewNotification(parsedNotifications.some((n: any) => n.isNew))
      }
    } catch (error) {
      console.error("Error fetching data:", error)

      // Datos de demostración en caso de error
      const mockData: Request[] = [
        {
          id: 1,
          code: "P001",
          name: "Carlos Rodríguez",
          tipo_novedad: "Permiso de vacaciones",
          description:
            "Solicitud de vacaciones para el período de verano. Necesito tomar dos semanas para un viaje familiar planificado con anticipación.",
          status: "approved",
          respuesta: "Aprobado según política de vacaciones. Disfrute su descanso.",
          createdAt: new Date().toISOString(),
          request_type: "permiso",
          fecha: "2023-07-15",
          telefono: "555-123-4567",
          hora: "09:00 - 18:00",
        },
        {
          id: 2,
          code: "P002",
          name: "Carlos Rodríguez",
          tipo_novedad: "Cambio de horario",
          description:
            "Solicitud de cambio de horario por motivos personales. Necesito ajustar mi horario para poder asistir a clases en la universidad.",
          status: "rejected",
          respuesta: "No es posible realizar el cambio por necesidades operativas del departamento en este momento.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          request_type: "permiso",
          fecha: "2023-07-10",
          telefono: "555-123-4567",
          hora: "10:00 - 19:00",
        },
        {
          id: 3,
          code: "P003",
          name: "Carlos Rodríguez",
          tipo_novedad: "Turno pareja",
          description:
            "Solicitud de turno pareja con Juan Pérez para el proyecto Acevedo. Hemos trabajado juntos anteriormente con buenos resultados.",
          status: "pending",
          respuesta: "",
          zona: "Acevedo",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          request_type: "postulaciones",
          fecha: "2023-07-05",
          comp_am: "Juan Pérez",
          comp_pm: "Carlos Rodríguez",
          turno: "Rotativo",
        },
        {
          id: 4,
          code: "P004",
          name: "Carlos Rodríguez",
          tipo_novedad: "Permiso médico",
          description: "Solicitud de permiso para cita médica programada. Adjunto comprobante de la cita.",
          status: "approved",
          respuesta: "Permiso aprobado. Por favor presente el comprobante de asistencia a su regreso.",
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          request_type: "permiso",
          fecha: "2023-07-03",
          telefono: "555-123-4567",
          hora: "11:00 - 13:00",
        },
        {
          id: 5,
          code: "P005",
          name: "Carlos Rodríguez",
          tipo_novedad: "Postulación proyecto especial",
          description:
            "Me interesa participar en el proyecto especial de innovación tecnológica. Tengo experiencia en proyectos similares y puedo aportar conocimientos en desarrollo de software.",
          status: "pending",
          respuesta: "",
          zona: "Central",
          createdAt: new Date(Date.now() - 345600000).toISOString(),
          request_type: "postulaciones",
          fecha: "2023-06-28",
          turno: "Diurno",
        },
      ]
      setRequests(mockData)
      setFilteredRequests(mockData)
      setIsEmptyState(false)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    fetchRequests()
  }, [])

  useEffect(() => {
    let filtered = [...requests]

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (req) =>
          req.tipo_novedad.toLowerCase().includes(term) ||
          req.description?.toLowerCase().includes(term) ||
          (req.zona && req.zona.toLowerCase().includes(term)),
      )
    }

    // Filtrar por período
    if (filterPeriod !== "all") {
      const now = new Date()
      const periodStart = new Date()
      switch (filterPeriod) {
        case "day":
          periodStart.setDate(now.getDate() - 1)
          break
        case "week":
          periodStart.setDate(now.getDate() - 7)
          break
        case "month":
          periodStart.setMonth(now.getMonth() - 1)
          break
        case "year":
          periodStart.setFullYear(now.getFullYear() - 1)
          break
      }
      filtered = filtered.filter((req) => new Date(req.createdAt) >= periodStart)
    }

    // Filtrar por estado
    if (filterStatus !== "all") {
      filtered = filtered.filter((req) => req.status === filterStatus)
    }

    // Filtrar por tipo
    if (filterType !== "all") {
      filtered = filtered.filter((req) => req.request_type === filterType)
    }

    // Filtrar por tab activo
    if (activeTab !== "all") {
      if (activeTab === "approved") {
        filtered = filtered.filter((req) => req.status === "approved")
      } else if (activeTab === "rejected") {
        filtered = filtered.filter((req) => req.status === "rejected")
      } else if (activeTab === "pending") {
        filtered = filtered.filter((req) => req.status === "pending")
      } else if (activeTab === "permisos") {
        filtered = filtered.filter((req) => req.request_type === "permiso")
      } else if (activeTab === "postulaciones") {
        filtered = filtered.filter((req) => req.request_type === "postulaciones")
      }
    }

    // Ordenar
    filtered.sort((a, b) => {
      return sortOrder === "desc"
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    setFilteredRequests(filtered)
  }, [requests, filterPeriod, filterStatus, filterType, sortOrder, searchTerm, activeTab])

  // Obtener iniciales del usuario para el avatar
  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "d 'de' MMMM, yyyy", { locale: es })
    } catch (error) {
      return dateString
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5" />
      case "rejected":
        return <XCircle className="h-5 w-5" />
      case "pending":
        return <AlertCircle className="h-5 w-5" />
      default:
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-600"
      case "rejected":
        return "bg-red-100 text-red-600"
      case "pending":
        return "bg-amber-100 text-amber-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobada"
      case "rejected":
        return "Rechazada"
      case "pending":
        return "Pendiente"
      default:
        return "Desconocido"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "permiso":
        return <Calendar className="h-5 w-5" />
      case "postulaciones":
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "permiso":
        return "bg-green-100 text-green-600"
      case "postulaciones":
        return "bg-blue-100 text-blue-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "permiso":
        return "Permiso"
      case "postulaciones":
        return "Postulación"
      default:
        return type
    }
  }

  const renderRequestCard = (request: Request, index: number) => {
    const isExpanded = expandedRequest === request.id
    const delay = Math.min(index * 0.05, 0.5)

    return (
      <motion.div
        key={request.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay }}
        className="mb-4"
      >
        <Card className="overflow-hidden border-green-100 hover:shadow-md transition-all duration-300 bg-white/90 backdrop-blur-sm rounded-3xl">
          <div
            className={`h-2 ${
              request.status === "approved"
                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                : request.status === "pending"
                  ? "bg-gradient-to-r from-amber-400 to-amber-600"
                  : "bg-gradient-to-r from-red-400 to-red-600"
            }`}
          ></div>
          <CardContent className="p-0">
            <div className="p-5 cursor-pointer" onClick={() => setExpandedRequest(isExpanded ? null : request.id)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                      request.status === "approved"
                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        : request.status === "pending"
                          ? "bg-gradient-to-br from-amber-400 to-amber-600"
                          : "bg-gradient-to-br from-red-400 to-red-600"
                    } text-white shadow-lg`}
                  >
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{request.tipo_novedad}</h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge
                        variant="outline"
                        className={`${getTypeColor(request.request_type)} border-none text-xs px-3 py-1 rounded-full`}
                      >
                        {getTypeText(request.request_type)}
                      </Badge>
                      <span className="text-xs text-gray-500">{formatDate(request.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge
                    className={`mr-3 px-3 py-1 rounded-full ${
                      request.status === "approved"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                        : request.status === "pending"
                          ? "bg-amber-100 text-amber-800 border-amber-200"
                          : "bg-red-100 text-red-800 border-red-200"
                    }`}
                  >
                    {getStatusText(request.status)}
                  </Badge>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-2 rounded-full ${
                      isExpanded ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-5 pb-5 border-t border-green-100 pt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {request.fecha && (
                      <div className="flex items-center bg-gray-50 p-3 rounded-2xl">
                        <Calendar className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-gray-600 mr-1">Fecha:</span>
                        <span className="font-medium text-gray-800">{request.fecha}</span>
                      </div>
                    )}
                    {request.zona && (
                      <div className="flex items-center bg-gray-50 p-3 rounded-2xl">
                        <MapPin className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-gray-600 mr-1">Zona:</span>
                        <span className="font-medium text-gray-800">{request.zona}</span>
                      </div>
                    )}
                    {request.hora && (
                      <div className="flex items-center bg-gray-50 p-3 rounded-2xl">
                        <Clock className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-gray-600 mr-1">Hora:</span>
                        <span className="font-medium text-gray-800">{request.hora}</span>
                      </div>
                    )}
                    {request.telefono && (
                      <div className="flex items-center bg-gray-50 p-3 rounded-2xl">
                        <Phone className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-gray-600 mr-1">Teléfono:</span>
                        <span className="font-medium text-gray-800">{request.telefono}</span>
                      </div>
                    )}
                    {(request.comp_am || request.comp_pm) && (
                      <div className="flex items-center col-span-2 bg-gray-50 p-3 rounded-2xl">
                        <Users className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-gray-600 mr-1">Compañeros:</span>
                        <span className="font-medium text-gray-800">
                          {request.comp_am && `AM: ${request.comp_am}`}
                          {request.comp_am && request.comp_pm && " | "}
                          {request.comp_pm && `PM: ${request.comp_pm}`}
                        </span>
                      </div>
                    )}
                    {request.description && (
                      <div className="col-span-2 bg-gray-50 p-3 rounded-2xl">
                        <div className="flex items-start">
                          <FileText className="w-5 h-5 mr-3 text-green-600 mt-1" />
                          <div>
                            <span className="text-gray-600 block font-medium">Descripción:</span>
                            <p className="text-gray-800 mt-2">{request.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones de interacción */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full rounded-xl hover:bg-green-50 text-green-700 flex items-center justify-center gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>Me gusta</span>
                      </Button>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full rounded-xl hover:bg-green-50 text-green-700 flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Comentar</span>
                      </Button>
                    </div>
                    <div className="flex-1 flex justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full rounded-xl hover:bg-green-50 text-green-700 flex items-center justify-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRequest(request)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span>Ver detalles</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-6 rounded-full mb-6 relative z-10 shadow-xl">
          <FileSpreadsheet className="h-16 w-16 text-white" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-emerald-800 mb-3">No hay solicitudes</h3>
      <p className="text-emerald-700 max-w-md mb-8">
        No se encontraron solicitudes que coincidan con los filtros seleccionados. Intenta con otros criterios de
        búsqueda o crea una nueva solicitud.
      </p>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-full px-8 py-6 text-lg font-medium shadow-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Crear nueva solicitud
        </Button>
      </motion.div>
    </motion.div>
  )

  const renderSkeletonCard = (index: number) => (
    <div key={index} className="mb-4">
      <Card className="overflow-hidden border-green-100 bg-white/90 backdrop-blur-sm rounded-3xl">
        <div className="h-2 bg-gray-200"></div>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-32" />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Skeleton className="h-8 w-24 mr-3" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 pb-16 md:pb-20">
      {isLoading && <LoadingOverlay />}

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-b-[40px] shadow-lg">
        <div className="container mx-auto max-w-7xl px-4 py-8 relative z-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-32 -mr-32"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -mb-16 -ml-16"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mr-4 bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-lg"
              >
                <List className="h-7 w-7" />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h1 className="text-3xl font-bold">Mis Solicitudes</h1>
                <p className="text-green-100 text-sm mt-1">Gestión de permisos y postulaciones</p>
              </motion.div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 rounded-full"
                        onClick={() => {
                          setIsRefreshing(true)
                          fetchRequests()
                        }}
                      >
                        <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Actualizar datos</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>

              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Avatar className="h-12 w-12 border-2 border-white/30 shadow-lg">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-green-600 text-white text-lg">
                    {getUserInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 -mt-6">
        {/* Resumen de Solicitudes */}
        <div ref={summaryRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={summaryInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-8"
          >
            <Card className="bg-white/90 backdrop-blur-md border-green-100 shadow-lg overflow-hidden rounded-3xl">
              <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-emerald-50 pt-6">
                <CardTitle className="text-xl font-semibold text-green-800 flex items-center">
                  <ChartBar className="h-6 w-6 mr-3 text-green-600" />
                  Resumen de Solicitudes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={summaryInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-3xl border border-green-200 shadow-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 rounded-full opacity-20 -mt-10 -mr-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="bg-white p-2 rounded-xl shadow-md">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-green-100 text-green-800 border-green-200 rounded-full px-2.5"
                      >
                        {Math.round(
                          (filteredRequests.filter((r) => r.status === "approved").length /
                            Math.max(filteredRequests.length, 1)) *
                            100,
                        )}
                        %
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-green-800 mb-1 relative z-10">
                      {filteredRequests.filter((r) => r.status === "approved").length}
                    </p>
                    <p className="text-sm text-green-600 font-medium relative z-10">Aprobadas</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={summaryInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-3xl border border-red-200 shadow-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-red-200 rounded-full opacity-20 -mt-10 -mr-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="bg-white p-2 rounded-xl shadow-md">
                        <XCircle className="h-6 w-6 text-red-600" />
                      </div>
                      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 rounded-full px-2.5">
                        {Math.round(
                          (filteredRequests.filter((r) => r.status === "rejected").length /
                            Math.max(filteredRequests.length, 1)) *
                            100,
                        )}
                        %
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-red-800 mb-1 relative z-10">
                      {filteredRequests.filter((r) => r.status === "rejected").length}
                    </p>
                    <p className="text-sm text-red-600 font-medium relative z-10">Rechazadas</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={summaryInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-gradient-to-br from-amber-50 to-amber-100 p-5 rounded-3xl border border-amber-200 shadow-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200 rounded-full opacity-20 -mt-10 -mr-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="bg-white p-2 rounded-xl shadow-md">
                        <AlertCircle className="h-6 w-6 text-amber-600" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-amber-100 text-amber-800 border-amber-200 rounded-full px-2.5"
                      >
                        {Math.round(
                          (filteredRequests.filter((r) => r.status === "pending").length /
                            Math.max(filteredRequests.length, 1)) *
                            100,
                        )}
                        %
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-amber-800 mb-1 relative z-10">
                      {filteredRequests.filter((r) => r.status === "pending").length}
                    </p>
                    <p className="text-sm text-amber-600 font-medium relative z-10">Pendientes</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={summaryInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-3xl border border-blue-200 shadow-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 rounded-full opacity-20 -mt-10 -mr-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="bg-white p-2 rounded-xl shadow-md">
                        <Calendar className="h-6 w-6 text-blue-600" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 text-blue-800 border-blue-200 rounded-full px-2.5"
                      >
                        {Math.round(
                          (filteredRequests.filter((r) => r.request_type === "permiso").length /
                            Math.max(filteredRequests.length, 1)) *
                            100,
                        )}
                        %
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-blue-800 mb-1 relative z-10">
                      {filteredRequests.filter((r) => r.request_type === "permiso").length}
                    </p>
                    <p className="text-sm text-blue-600 font-medium relative z-10">Permisos</p>
                  </motion.div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={summaryInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-3xl border border-purple-200 shadow-md relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full opacity-20 -mt-10 -mr-10 group-hover:scale-150 transition-transform duration-500"></div>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className="bg-white p-2 rounded-xl shadow-md">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-purple-100 text-purple-800 border-purple-200 rounded-full px-2.5"
                      >
                        {Math.round(
                          (filteredRequests.filter((r) => r.request_type === "postulaciones").length /
                            Math.max(filteredRequests.length, 1)) *
                            100,
                        )}
                        %
                      </Badge>
                    </div>
                    <p className="text-3xl font-bold text-purple-800 mb-1 relative z-10">
                      {filteredRequests.filter((r) => r.request_type === "postulaciones").length}
                    </p>
                    <p className="text-sm text-purple-600 font-medium relative z-10">Postulaciones</p>
                  </motion.div>
                </div>
              </CardContent>
              <CardFooter className="bg-gradient-to-r from-green-50 to-emerald-50 py-4 px-6 border-t border-green-100">
                <p className="text-sm text-green-700 font-medium">Total de solicitudes: {filteredRequests.length}</p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200 rounded-xl"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exportar datos
                  </Button>
                </motion.div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Barra de búsqueda y filtros para móvil */}
        <div className="md:hidden mb-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar solicitudes..."
                className="pl-10 border-green-200 focus:border-green-500 rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Drawer open={isFilterDrawerOpen} onOpenChange={setIsFilterDrawerOpen}>
              <DrawerTrigger asChild>
                <Button variant="outline" className="border-green-200 text-green-700 rounded-xl">
                  <Filter className="h-4 w-4" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4 rounded-t-3xl bg-white">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-green-800 flex items-center">
                    <SlidersHorizontal className="h-5 w-5 mr-2 text-green-600" />
                    Filtros
                  </h3>

                  <div className="space-y-3">
                    <Select onValueChange={setFilterPeriod} defaultValue="all">
                      <SelectTrigger className="w-full border-green-200 rounded-xl">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="week">Última semana</SelectItem>
                        <SelectItem value="month">Último mes</SelectItem>
                        <SelectItem value="year">Último año</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select onValueChange={setFilterStatus} defaultValue="all">
                      <SelectTrigger className="w-full border-green-200 rounded-xl">
                        <AlertCircle className="h-4 w-4 mr-2 text-green-600" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="approved">Aprobadas</SelectItem>
                        <SelectItem value="pending">Pendientes</SelectItem>
                        <SelectItem value="rejected">Rechazadas</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select onValueChange={setFilterType} defaultValue="all">
                      <SelectTrigger className="w-full border-green-200 rounded-xl">
                        <FileText className="h-4 w-4 mr-2 text-green-600" />
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="permiso">Permisos</SelectItem>
                        <SelectItem value="postulaciones">Postulaciones</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                      className="w-full border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
                    >
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      {sortOrder === "desc" ? "Más recientes primero" : "Más antiguos primero"}
                    </Button>
                  </div>

                  <div className="pt-4">
                    <Button
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 rounded-xl"
                      onClick={() => setIsFilterDrawerOpen(false)}
                    >
                      Aplicar filtros
                    </Button>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Filtros para desktop */}
        <div className="hidden md:block" ref={filtersRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={filtersInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-white/90 backdrop-blur-md border-green-100 shadow-lg overflow-hidden rounded-3xl">
              <CardHeader className="pb-2 pt-5 px-6 flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold text-green-800 flex items-center">
                  <SlidersHorizontal className="h-6 w-6 mr-3 text-green-600" />
                  Filtros
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-green-700 hover:bg-green-100 hover:text-green-800 rounded-xl"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  {isFilterOpen ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Mostrar
                    </>
                  )}
                </Button>
              </CardHeader>

              <AnimatePresence>
                {isFilterOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Buscar solicitudes..."
                            className="pl-10 border-green-200 focus:border-green-500 rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Select onValueChange={setFilterPeriod} defaultValue="all">
                            <SelectTrigger className="w-[150px] border-green-200 rounded-xl">
                              <Calendar className="h-4 w-4 mr-2 text-green-600" />
                              <SelectValue placeholder="Período" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="week">Última semana</SelectItem>
                              <SelectItem value="month">Último mes</SelectItem>
                              <SelectItem value="year">Último año</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select onValueChange={setFilterStatus} defaultValue="all">
                            <SelectTrigger className="w-[150px] border-green-200 rounded-xl">
                              <AlertCircle className="h-4 w-4 mr-2 text-green-600" />
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="approved">Aprobadas</SelectItem>
                              <SelectItem value="pending">Pendientes</SelectItem>
                              <SelectItem value="rejected">Rechazadas</SelectItem>
                            </SelectContent>
                          </Select>

                          <Select onValueChange={setFilterType} defaultValue="all">
                            <SelectTrigger className="w-[150px] border-green-200 rounded-xl">
                              <FileText className="h-4 w-4 mr-2 text-green-600" />
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="permiso">Permisos</SelectItem>
                              <SelectItem value="postulaciones">Postulaciones</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                            className="border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
                          >
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            {sortOrder === "desc" ? "Recientes" : "Antiguos"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>

        {/* Tabs y Lista de Solicitudes */}
        <div ref={listRef}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={listInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="mb-6"
          >
            <Card className="bg-white/90 backdrop-blur-md border-green-100 shadow-lg overflow-hidden rounded-3xl">
              <CardHeader className="pb-2 pt-5 px-6">
                <CardTitle className="text-xl font-semibold text-green-800 flex items-center justify-between">
                  <div className="flex items-center">
                    <List className="h-6 w-6 mr-3 text-green-600" />
                    Listado de Solicitudes
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva solicitud
                    </Button>
                  </motion.div>
                </CardTitle>
              </CardHeader>

              <CardContent className="p-6">
                <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
                  <TabsList className="bg-green-100/50 p-1.5 mb-6 rounded-2xl">
                    <TabsTrigger
                      value="all"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <List className="h-4 w-4 mr-2" />
                      Todas
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobadas
                    </TabsTrigger>
                    <TabsTrigger
                      value="pending"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Pendientes
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazadas
                    </TabsTrigger>
                    <TabsTrigger
                      value="permisos"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Permisos
                    </TabsTrigger>
                    <TabsTrigger
                      value="postulaciones"
                      className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-green-600 data-[state=active]:text-white"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Postulaciones
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-0">
                    <ScrollArea className="h-[calc(100vh-450px)] min-h-[300px] pr-4">
                      {isLoading
                        ? Array(5)
                            .fill(0)
                            .map((_, index) => renderSkeletonCard(index))
                        : filteredRequests.length === 0
                          ? renderEmptyState()
                          : filteredRequests.map((request, index) => renderRequestCard(request, index))}
                    </ScrollArea>
                  </TabsContent>

                  {/* Contenido para otras pestañas */}
                  {["approved", "pending", "rejected", "permisos", "postulaciones"].map((tab) => (
                    <TabsContent key={tab} value={tab} className="mt-0">
                      <ScrollArea className="h-[calc(100vh-450px)] min-h-[300px] pr-4">
                        {isLoading
                          ? Array(5)
                              .fill(0)
                              .map((_, index) => renderSkeletonCard(index))
                          : filteredRequests.filter((r) =>
                                tab === "approved"
                                  ? r.status === "approved"
                                  : tab === "pending"
                                    ? r.status === "pending"
                                    : tab === "rejected"
                                      ? r.status === "rejected"
                                      : tab === "permisos"
                                        ? r.request_type === "permiso"
                                        : tab === "postulaciones"
                                          ? r.request_type === "postulaciones"
                                          : true,
                              ).length === 0
                            ? renderEmptyState()
                            : filteredRequests
                                .filter((r) =>
                                  tab === "approved"
                                    ? r.status === "approved"
                                    : tab === "pending"
                                      ? r.status === "pending"
                                      : tab === "rejected"
                                        ? r.status === "rejected"
                                        : tab === "permisos"
                                          ? r.request_type === "permiso"
                                          : tab === "postulaciones"
                                            ? r.request_type === "postulaciones"
                                            : true,
                                )
                                .map((request, index) => renderRequestCard(request, index))}
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Botón flotante para móvil */}
      <div className="fixed bottom-20 right-4 md:hidden z-20">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button className="h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg">
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>
      </div>

      {/* Diálogo de detalles */}
      {selectedRequest && (
        <RequestDetailsDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation hasNewNotification={hasNewNotification} />
    </div>
  )
}

// Componente Phone para iconos
function Phone(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

// Componente Users para iconos
function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

// Componente ChartBar para iconos
function ChartBar(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}
