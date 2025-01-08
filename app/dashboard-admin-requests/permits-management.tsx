'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { FileText, Laptop, Filter, ChevronLeft, ChevronRight, Clock, Trash2, Check, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import RequestDetails from '../../components/request-details'
import { fetchRequests, updateRequestStatus, deleteRequest } from '../utils/api'
import './permits-management.css'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { motion, AnimatePresence } from 'framer-motion'
import { groupBy } from 'lodash'
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"

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
  noveltyType?: string
  reason?: string
  [key: string]: string | undefined
}

type GroupedRequests = {
  [key: string]: Request[]
}

type RequestStats = {
  total: number
  approved: number
  pending: number
  rejected: number
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="loading-spinner"></div>
  </div>
)

export default function PermitsManagement() {
  const [activeTab, setActiveTab] = useState('permits')
  const [requests, setRequests] = useState<Request[]>([])
  const [groupedRequests, setGroupedRequests] = useState<GroupedRequests>({})
  const [filteredRequests, setFilteredRequests] = useState<GroupedRequests>({})
  const [filterType, setFilterType] = useState('all')
  const [filterName, setFilterName] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedRequests, setSelectedRequests] = useState<Request[] | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [requestToDelete, setRequestToDelete] = useState<Request | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requestStats, setRequestStats] = useState<RequestStats>({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [isVerticalView, setIsVerticalView] = useState(false)
  const [selectedZone, setSelectedZone] = useState('all')
  const [selectedRequestIds, setSelectedRequestIds] = useState<Set<string>>(new Set())
  const [isShiftKeyPressed, setIsShiftKeyPressed] = useState(false)
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<'approve' | 'reject' | null>(null)
  const [bulkActionProgress, setBulkActionProgress] = useState(0)
  const [isBulkActionProcessing, setIsBulkActionProcessing] = useState(false)
  const [customResponse, setCustomResponse] = useState('')
  const [weekFilter, setWeekFilter] = useState<string | null>(null)
  const requestsPerPage = 8

  const zones = [
    "Acevedo",
    "Tricentenario",
    "Universidad-gardel",
    "Hospital",
    "Prado",
    "Cruz",
    "San Antonio",
    "Exposiciones",
    "Alejandro"
  ]

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchRequests()
      setRequests(data)
      
      // Calculate request stats
      const stats = data.reduce((acc: RequestStats, req: Request) => {
        acc.total++
        if (req.status === 'approved') acc.approved++
        else if (req.status === 'pending') acc.pending++
        else if (req.status === 'rejected') acc.rejected++
        return acc
      }, { total: 0, approved: 0, pending: 0, rejected: 0 })
      setRequestStats(stats)
      
      // Filter requests based on active tab and status
      const filteredData = data.filter((req: Request) => {
        const isPermit = 'noveltyType' in req
        return (activeTab === 'permits' ? isPermit : !isPermit) && req.status === 'pending'
      })
      
      // Group by name instead of code
      const grouped = groupBy(filteredData, 'name')
      setGroupedRequests(grouped)
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast({
        title: "Error",
        description: "Error al cargar las solicitudes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    loadRequests()
  }, [activeTab])

  useEffect(() => {
    let filtered = { ...groupedRequests }
    
    if (filterType !== 'all') {
      filtered = Object.entries(filtered).reduce((acc, [name, reqs]) => {
        const filteredReqs = reqs.filter(req => req.type === filterType)
        if (filteredReqs.length > 0) {
          acc[name] = filteredReqs
        }
        return acc
      }, {} as GroupedRequests)
    }

    if (filterName) {
      filtered = Object.entries(filtered).reduce((acc, [name, reqs]) => {
        if (name.toLowerCase().includes(filterName.toLowerCase())) {
          acc[name] = reqs
        }
        return acc
      }, {} as GroupedRequests)
    }

    if (selectedZone !== 'all') {
      filtered = Object.entries(filtered).reduce((acc, [name, reqs]) => {
        const filteredReqs = reqs.filter(req => req.zona === selectedZone)
        if (filteredReqs.length > 0) {
          acc[name] = filteredReqs
        }
        return acc
      }, {} as GroupedRequests)
    }

    if (weekFilter) {
      filtered = Object.entries(filtered).reduce((acc, [name, reqs]) => {
        const filteredReqs = reqs.filter(req => {
          const requestDate = new Date(req.createdAt)
          const [start, end] = weekFilter.split(' - ').map(date => new Date(date))
          return requestDate >= start && requestDate <= end
        })
        if (filteredReqs.length > 0) {
          acc[name] = filteredReqs
        }
        return acc
      }, {} as GroupedRequests)
    }

    Object.keys(filtered).forEach(name => {
      filtered[name].sort((a, b) => {
        if (sortOrder === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        } else {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        }
      })
    })

    setFilteredRequests(filtered)
    
    // Calculate the new total pages
    const newTotalPages = Math.ceil(Object.keys(filtered).length / requestsPerPage)

    // Adjust current page if it's greater than the new total pages
    if (currentPage > newTotalPages) {
      setCurrentPage(Math.max(newTotalPages, 1))
    }
  }, [groupedRequests, filterType, filterName, sortOrder, currentPage, selectedZone, weekFilter])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftKeyPressed(true)
      if (e.key === 'Escape') setSelectedRequestIds(new Set())
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsShiftKeyPressed(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const handleRequestAction = async (id: string, action: 'approve' | 'reject', reason: string) => {
    try {
      await updateRequestStatus(id, action, reason || customResponse)
      await loadRequests()
      setSelectedRequests(null)
      setCustomResponse('')
      toast({
        title: "Éxito",
        description: `Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
      })
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        title: "Error",
        description: `Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud. Por favor, inténtelo de nuevo.`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteRequest = async (request: Request) => {
    try {
      await deleteRequest(request.id)
      await loadRequests()
      
      // Calculate the number of requests on the current page after deletion
      const currentPageRequests = Object.values(filteredRequests).flat().length - (currentPage - 1) * requestsPerPage

      // If the current page is empty after deletion and it's not the first page, go to the previous page
      if (currentPageRequests <= 1 && currentPage > 1 && Object.keys(filteredRequests).length > 0) {
        setCurrentPage(prev => Math.max(1, prev - 1))
      }

      toast({
        title: "Éxito",
        description: "Solicitud eliminada exitosamente",
      })
    } catch (error) {
      console.error('Error deleting request:', error)
      toast({
        title: "Error",
        description: "Error al eliminar la solicitud",
        variant: "destructive",
      })
    } finally {
      setRequestToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "EEEE d 'de' MMMM, yyyy", { locale: es })
  }

  const handleRequestClick = (request: Request) => {
    if (isShiftKeyPressed) {
      setSelectedRequestIds(prev => {
        const newSet = new Set(prev)
        if (newSet.has(request.id)) {
          newSet.delete(request.id)
        } else {
          newSet.add(request.id)
        }
        return newSet
      })
    } else {
      setSelectedRequests([request])
    }
  }

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    setIsBulkActionProcessing(true)
    setBulkActionProgress(0)
    const totalRequests = selectedRequestIds.size
    let processedRequests = 0

    const message = await new Promise<string>((resolve) => {
      const response = prompt(`Ingrese el motivo para ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud:`)
      resolve(response || (action === 'approve' ? 'Su solicitud ha sido aprobada.' : 'Lo sentimos, su solicitud ha sido rechazada.'))
    })
    try {
      for (const id of selectedRequestIds) {
        await handleRequestAction(id, action, message)
        processedRequests++
        setBulkActionProgress((processedRequests / totalRequests) * 100)
      }
      
      setSelectedRequestIds(new Set())
      toast({
        title: "Éxito",
        description: `${totalRequests} solicitudes ${action === 'approve' ? 'aprobadas' : 'rechazadas'} exitosamente`,
      })
    } catch (error) {
      console.error('Error en acción masiva:', error)
      toast({
        title: "Error",
        description: `Hubo un problema al procesar las solicitudes. Por favor, inténtelo de nuevo.`,
        variant: "destructive",
      })
    } finally {
      setIsBulkActionProcessing(false)
      setBulkActionDialogOpen(false)
      setBulkActionType(null)
    }
  }

  const renderGroupedRequestCard = ([name, requests]: [string, Request[]]) => {
    const isEquipmentRequest = !('noveltyType' in requests[0])

    return (
      <motion.div
        key={`${name}-${requests[0].id}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="group h-full"
      >
        <ContextMenu>
          <ContextMenuTrigger>
            <Card className={`h-full bg-white shadow-sm hover:shadow-md transition-all duration-300 ${
              requests.some(req => selectedRequestIds.has(req.id))
            }`}>
              <CardHeader className="space-y-2">
                <div className="flex justify-between items-start">
                  <Badge 
                    variant="outline" 
                    className={`${
                      isEquipmentRequest ? 'bg-blue-50 text-blue-700 border-blue-300' : 
                      'bg-purple-50 text-purple-700 border-purple-300'
                    }`}
                  >
                    {isEquipmentRequest ? 'Equipo' : 'Permiso'}
                  </Badge>
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Pendiente
                  </Badge>
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {requests.map((request) => (
                    <div key={request.id} className="space-y-2">
                      <button
                        className={`w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3 ${
                          selectedRequestIds.has(request.id) ? 'bg-green-100' : ''
                        }`}
                        onClick={() => handleRequestClick(request)}
                      >
                        <div className="flex-shrink-0">
                          <Clock className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {request.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(request.createdAt), "d MMM, yyyy", { locale: es })}
                          </p>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </ContextMenuTrigger>
          <ContextMenuContent>
            {requests.map((request) => (
              <ContextMenuItem
                key={request.id}
                onClick={() => {
                  setRequestToDelete(request)
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar solicitud de {request.type}
              </ContextMenuItem>
            ))}
          </ContextMenuContent>
        </ContextMenu>
      </motion.div>
    )
  }

  const renderPaginationButton = (page: number) => (
    <Button
      key={page}
      variant={currentPage === page ? "default" : "outline"}
      className={`w-10 h-10 rounded-full ${
        currentPage === page
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      }`}
      onClick={() => setCurrentPage(page)}
    >
      {page}
    </Button>
  )

  const renderPagination = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(renderPaginationButton(i))
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(renderPaginationButton(i))
        }
        pageNumbers.push(<span key="ellipsis-end" className="mx-1">...</span>)
        pageNumbers.push(renderPaginationButton(totalPages))
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(renderPaginationButton(1))
        pageNumbers.push(<span key="ellipsis-start" className="mx-1">...</span>)
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(renderPaginationButton(i))
        }
      } else {
        pageNumbers.push(renderPaginationButton(1))
        pageNumbers.push(<span key="ellipsis-start" className="mx-1">...</span>)
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(renderPaginationButton(i))
        }
        pageNumbers.push(<span key="ellipsis-end" className="mx-1">...</span>)
        pageNumbers.push(renderPaginationButton(totalPages))
      }
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="rounded-full w-10 h-10"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pageNumbers}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="rounded-full w-10 h-10"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const totalPages = Math.ceil(Object.keys(filteredRequests).length / requestsPerPage)
  const currentRequests = Object.entries(filteredRequests).slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  )

  const totalFilteredRequests = Object.values(filteredRequests).reduce((sum, requests) => sum + requests.length, 0)
  const startIndex = (currentPage - 1) * requestsPerPage + 1
  const endIndex = Math.min(startIndex + currentRequests.length - 1, totalFilteredRequests)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-center text-gray-900"
        >
          Gestión de Solicitudes Pendientes
        </motion.h1>

        <div className="mb-6 flex flex-wrap items-center justify-between">
          <div className="w-full md:w-auto mb-4 md:mb-0">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total de solicitudes</p>
                    <p className="text-2xl font-bold">{requestStats.total}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Aprobadas</p>
                    <p className="text-2xl font-bold text-green-600">{requestStats.approved}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{requestStats.pending}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rechazadas</p>
                    <p className="text-2xl font-bold text-red-600">{requestStats.rejected}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full md:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            {isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full mb-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="permits" className="data-[state=active]:bg-purple-100">
              <FileText className="w-5 h-5 mr-2" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="equipment" className="data-[state=active]:bg-blue-100">
              <Laptop className="w-5 h-5 mr-2" />
              Postulaciones
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="grid gap-4 sm:grid-cols-4 mb-6 bg-white p-4 rounded-lg shadow-sm"
            >
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de solicitud" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {activeTab === 'permits' ? (
                    <>
                      <SelectItem value="descanso">Descanso</SelectItem>
                      <SelectItem value="audiencia">Audiencia</SelectItem>
                      <SelectItem value="cita">Cita médica</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Turno pareja">Turno pareja</SelectItem>
                      <SelectItem value="Tabla partida">Tabla partida</SelectItem>
                      <SelectItem value="Disponible fijo">Disponible fijo</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>

              <Input 
                placeholder="Buscar por nombre"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
              />

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Más recientes</SelectItem>
                  <SelectItem value="oldest">Más antiguos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedZone} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por zona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las zonas</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={weekFilter || ''} onValueChange={setWeekFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por semana" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las semanas</SelectItem>
                  {Array.from({ length: 4 }).map((_, i) => {
                    const start = startOfWeek(addWeeks(new Date(), i), { weekStartsOn: 1 })
                    const end = endOfWeek(start, { weekStartsOn: 1 })
                    const value = `${format(start, 'yyyy-MM-dd')} - ${format(end, 'yyyy-MM-dd')}`
                    return (
                      <SelectItem key={`week-${i}-${value}`} value={value}>
                        {format(start, 'd MMM')} - {format(end, 'd MMM')}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setIsVerticalView(!isVerticalView)}
            className="w-full md:w-auto"
          >
            {isVerticalView ? 'Vista paginada' : 'Vista vertical'}
          </Button>
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : Object.keys(filteredRequests).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-lg shadow-sm"
          >
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay solicitudes pendientes
            </h3>
            <p className="text-gray-500">
              No se encontraron solicitudes que coincidan con los filtros seleccionados
            </p>
          </motion.div>
        ) : (
          <>
            {isVerticalView ? (
              <div className="space-y-4">
                {Object.entries(filteredRequests).map(renderGroupedRequestCard)}
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-500">
                  Mostrando solicitudes {startIndex} - {endIndex} de {totalFilteredRequests}
                </div>
                <div className="relative">
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
                    <AnimatePresence>
                      {currentRequests.map(renderGroupedRequestCard)}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            )}
          </>
        )}

        {!isVerticalView && totalPages > 1 && renderPagination()}
      </div>

      {selectedRequests && (
        <RequestDetails
          requests={selectedRequests}
          onClose={() => setSelectedRequests(null)}
          onAction={handleRequestAction}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la solicitud
              {requestToDelete && ` de ${requestToDelete.type} para ${requestToDelete.name}`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => requestToDelete && handleDeleteRequest(requestToDelete)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar acción masiva</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas {bulkActionType === 'approve' ? 'aprobar' : 'rechazar'} las siguientes solicitudes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-60 overflow-y-auto">
            {Array.from(selectedRequestIds).map(id => {
              const request = requests.find(r => r.id === id)
              return request ? (
                <div key={id} className="py-2 border-b last:border-b-0">
                  <p className="font-medium">{request.name}</p>
                  <p className="text-sm text-gray-500">{request.code} - {request.type}</p>
                </div>
              ) : null
            })}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => bulkActionType && handleBulkAction(bulkActionType)}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedRequestIds.size > 0 && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50">
          <h3 className="text-lg font-semibold mb-2">Acciones masivas ({selectedRequestIds.size} seleccionadas)</h3>
          <div className="flex space-x-2">
            <Button onClick={() => {
              setBulkActionType('approve')
              setBulkActionDialogOpen(true)
            }}>Aprobar seleccionados</Button>
            <Button onClick={() => {
              setBulkActionType('reject')
              setBulkActionDialogOpen(true)
            }} variant="destructive">Rechazar seleccionados</Button>
          </div>
        </div>
      )}

      {isBulkActionProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Procesando solicitudes...</h3>
            <Progress value={bulkActionProgress} className="w-64 mb-4" />
            <p className="text-sm text-gray-500">{Math.round(bulkActionProgress)}% completado</p>
          </div>
        </div>
      )}
    </div>
  )
}

