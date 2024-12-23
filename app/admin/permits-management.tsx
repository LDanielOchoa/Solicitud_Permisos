'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Laptop} from 'lucide-react'
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
  [key: string]: any
}

const MotionSelect = motion(Select)
const MotionInput = motion(Input)

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

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
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
  }

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

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  )

  return (
    <div className="permits-management">
      <div className="animated-bg"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-8 text-center text-black">Gestión de Solicitudes</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto bg-whitespace">
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

        <motion.div
          className="filter-container"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isFilterOpen ? 'auto' : 0, opacity: isFilterOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MotionSelect
              value={filterType}
              onValueChange={setFilterType}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
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
            </MotionSelect>

            <MotionSelect
              value={filterStatus}
              onValueChange={setFilterStatus}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </MotionSelect>

            <MotionInput 
              placeholder="Buscar por código"
              value={filterCode}
              onChange={(e) => setFilterCode(e.target.value)}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            />

            <MotionSelect
              value={sortOrder}
              onValueChange={setSortOrder}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="oldest">Más antiguos</SelectItem>
              </SelectContent>
            </MotionSelect>
          </div>
        </motion.div>

        <div className="mb-6 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="text-black border-white hover:bg-white hover:text-black"
          >
            {isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
          <p className="text-white">
            Mostrando {currentRequests.length} de {filteredRequests.length} solicitudes
          </p>
        </div>

        <AnimatePresence>
          <motion.div
            className="request-grid"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {currentRequests.map(request => (
              <motion.div
                key={request.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="card p-6 cursor-pointer"
                onClick={() => setSelectedRequest(request)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{request.name}</h3>
                    <p className="text-sm opacity-70">Código: {request.code}</p>
                  </div>
                  <Badge className={`status-badge ${getStatusColor(request.status)}`}>
                    {request.status === 'approved' ? 'Aprobada' :
                     request.status === 'rejected' ? 'Rechazada' :
                     'Pendiente'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p
 className="text-sm">
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
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {totalPages > 1 && (
          <div className="pagination">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <div className="flex items-center space-x-2 mx-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "bg-white text-black" : "text-white"}
                >
                  {page}
                </Button>
              ))}
            </div>
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
      </motion.div>
    </div>
  )
}

