'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Laptop, Filter, ChevronLeft, ChevronRight, Clock, MapPin, Users, Trash2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RequestDetails from '../../components/request-details'
import { fetchRequests, updateRequestStatus, deleteRequest } from '../utils/api'
import './permits-management.css'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

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
  [key: string]: string | undefined
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="loading-spinner"></div>
  </div>
)

export default function PermitsManagement() {
  const [activeTab, setActiveTab] = useState('permits')
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCode, setFilterCode] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const requestsPerPage = 9

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await fetchRequests()
      setRequests(data)
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
  }, [])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  useEffect(() => {
    let filtered = requests.filter(req => activeTab === 'permits' ? 'noveltyType' in req : !('noveltyType' in req))

    if (filterType !== 'all') {
      filtered = filtered.filter(req => req.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    if (filterCode) {
      filtered = filtered.filter(req => req.code.toLowerCase().includes(filterCode.toLowerCase()))
    }

    filtered.sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
    })

    setFilteredRequests(filtered)
    setCurrentPage(1)
  }, [requests, activeTab, filterType, filterStatus, filterCode, sortOrder])

  const handleRequestAction = async (id: string, action: 'approve' | 'reject', reason: string) => {
    try {
      await updateRequestStatus(id, action, reason)
      await loadRequests()
      setSelectedRequest(null)
      toast({
        title: "Éxito",
        description: `Solicitud ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente`,
      })
    } catch (error) {
      console.error('Error updating request:', error)
      toast({
        title: "Error",
        description: `Error al ${action === 'approve' ? 'aprobar' : 'rechazar'} la solicitud`,
        variant: "destructive",
      })
    }
  }

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteRequest(id)
      await loadRequests()
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
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-200 text-yellow-800'
      case 'approved': return 'bg-green-200 text-green-800'
      case 'rejected': return 'bg-red-200 text-red-800'
      default: return 'bg-gray-200 text-gray-800'
    }
  }

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  )

  const renderRequestCard = (request: Request) => {
    const isEquipmentRequest = !('noveltyType' in request)

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <Card
            key={request.id}
            className="card hover:shadow-lg transition-all cursor-pointer"
            onClick={() => setSelectedRequest(request)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Badge 
                  variant="outline" 
                  className={`mb-2 text-sm font-medium ${
                    isEquipmentRequest ? 'bg-blue-50 text-blue-700 border-blue-300' : 
                    'bg-purple-50 text-purple-700 border-purple-300'
                  }`}
                >
                  {request.type}
                </Badge>
                <Badge className={`status-badge ${getStatusColor(request.status)}`}>
                  {request.status === 'approved' ? 'Aprobada' :
                   request.status === 'rejected' ? 'Rechazada' :
                   'Pendiente'}
                </Badge>
              </div>
              <CardTitle className="text-lg">
                {request.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Código: {request.code}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-2 h-4 w-4" />
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
                
                {isEquipmentRequest && (
                  <>
                    {request.zona && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-2 h-4 w-4" />
                        Zona: {request.zona}
                      </div>
                    )}
                    {(request.codeAM || request.codePM) && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="mr-2 h-4 w-4" />
                        {request.codeAM && `AM: ${request.codeAM}`}
                        {request.codeAM && request.codePM && ' | '}
                        {request.codePM && `PM: ${request.codePM}`}
                      </div>
                    )}
                    {request.shift && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-2 h-4 w-4" />
                        Turno: {request.shift}
                      </div>
                    )}
                  </>
                )}
                
                {request.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {request.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => handleDeleteRequest(request.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return (
    <div className="permits-management">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Gestión de Solicitudes</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto tabs-list">
          <TabsTrigger value="permits" className="tab-trigger">
            <FileText className="w-5 h-5 mr-2" />
            Permisos
          </TabsTrigger>
          <TabsTrigger value="equipment" className="tab-trigger">
            <Laptop className="w-5 h-5 mr-2" />
            Postulaciones
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="button button-outline flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          {isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {isFilterOpen && (
        <div className="filter-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="select-trigger">
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

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="select-trigger">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>

            <Input 
              placeholder="Buscar por código"
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              className="input"
            />

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="select-trigger">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <p className="text-gray-600 mb-4">
        Mostrando {currentRequests.length} de {filteredRequests.length} solicitudes
      </p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="request-grid">
          {currentRequests.map(request => renderRequestCard(request))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="button button-outline"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "button button-primary" : "button button-outline"}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="button button-outline"
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleRequestAction}
        />
      )}
    </div>
  )
}

