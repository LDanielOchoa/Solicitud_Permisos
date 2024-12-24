'use client'

import { useState, useEffect, useCallback } from 'react'
import { FileText, Laptop, Filter } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import RequestDetails from '../../components/request-details'
import { fetchRequests, updateRequestStatus } from '../utils/api'
import './permits-management.css'

type Request = {
  id: string
  code: string
  name: string
  type: string
  status: string
  createdAt: string
  description?: string
  [key: string]: any
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
      filtered = filtered.filter(req => req.type === filterType || req.noveltyType === filterType)
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

  return (
    <div className="permits-management p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-black">Gestión de Solicitudes</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-gray-100">
          <TabsTrigger value="permits" className="text-lg py-3">
            <FileText className="w-5 h-5 mr-2" />
            Permisos
          </TabsTrigger>
          <TabsTrigger value="equipment" className="text-lg py-3">
            <Laptop className="w-5 h-5 mr-2"  />
            Equipos
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center"
        >
          <Filter className="w-4 h-4 mr-2" />
          {isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </Button>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                  <SelectItem value="computadora">Computadora</SelectItem>
                  <SelectItem value="telefono">Teléfono</SelectItem>
                  <SelectItem value="herramientas">Herramientas</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
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
        </div>
      )}

      <p className="text-black mb-4">
        Mostrando {currentRequests.length} de {filteredRequests.length} solicitudes
      </p>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentRequests.map(request => (
            <div
              key={request.id}
              className="bg-white shadow-md rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{request.name}</h3>
                  <p className="text-sm text-gray-500">Código: {request.code}</p>
                </div>
                <Badge className={`${getStatusColor(request.status)} px-2 py-1 rounded-full text-xs`}>
                  {request.status === 'approved' ? 'Aprobada' :
                   request.status === 'rejected' ? 'Rechazada' :
                   'Pendiente'}
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Tipo:</strong> {request.type || request.noveltyType}
                </p>
                <p className="text-sm">
                  <strong>Fecha:</strong> {new Date(request.createdAt).toLocaleDateString()}
                </p>
                {request.description && (
                  <p className="text-sm line-clamp-2">
                    <strong>Descripción:</strong> {request.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
              className={currentPage === page ? "bg-primary text-primary-foreground" : ""}
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
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

