'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LayoutDashboard, FileText, Laptop, Clock, CheckCircle, XCircle, LinkIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"
import RequestDetails from '../../components/request-details'
import LinkManager from '../../components/link-manager'
import CustomPieChart from '../../components/pie-chart'
import CustomBarChart from '../../components/bar-chart'
import CustomLineChart from '../../components/line-chart'

type Request = {
  id: string
  code: string
  name: string
  type: string
  status: string
  createdAt: string
  [key: string]: any
}

type Stats = {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('permits')
  const [activeSection, setActiveSection] = useState('requests')
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCode, setFilterCode] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, approved: 0, rejected: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const requestsPerPage = 5

  useEffect(() => {
    const permitRequests = JSON.parse(localStorage.getItem('permitRequests') || '[]')
    const equipmentRequests = JSON.parse(localStorage.getItem('equipmentRequests') || '[]')
    setRequests([...permitRequests, ...equipmentRequests].map((req, index) => ({ ...req, id: `${index}` })))
  }, [])

  useEffect(() => {
    let filtered = requests.filter(req => activeTab === 'permits' ? 'noveltyType' in req : !('noveltyType' in req))

    if (filterType !== 'all') {
      filtered = filtered.filter(req => req.type === filterType || req.noveltyType === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    if (filterCode) {
      filtered = filtered.filter(req => req.code.includes(filterCode))
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

    const newStats = {
      total: filtered.length,
      pending: filtered.filter(req => req.status === 'pending').length,
      approved: filtered.filter(req=> req.status === 'approved').length,
      rejected: filtered.filter(req => req.status === 'rejected').length,
    }
    setStats(newStats)
  }, [requests, activeTab, filterType, filterStatus, filterCode, sortOrder])

  const handleRequestAction = (id: string, action: 'approve' | 'reject', reason: string) => {
    const updatedRequests = requests.map(req => 
      req.id === id ? { ...req, status: action === 'approve' ? 'approved' : 'rejected', reason } : req
    )
    setRequests(updatedRequests)
    localStorage.setItem('permitRequests', JSON.stringify(updatedRequests.filter(req => 'noveltyType' in req)))
    localStorage.setItem('equipmentRequests', JSON.stringify(updatedRequests.filter(req => !('noveltyType' in req))))
    setSelectedRequest(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage)
  const currentRequests = filteredRequests.slice(
    (currentPage - 1) * requestsPerPage,
    currentPage * requestsPerPage
  )

  const getChartData = (type: 'codes' | 'types' | 'dates') => {
    const data: { [key: string]: number } = {}
    filteredRequests.forEach(req => {
      const key = type === 'codes' ? req.code :
                  type === 'types' ? (req.type || req.noveltyType) :
                  new Date(req.createdAt).toLocaleDateString()
      data[key] = (data[key] || 0) + 1
    })
    return Object.entries(data).map(([name, value]) => ({ name, value }))
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar collapsible="icon">
          <SidebarHeader className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold">Panel Admin</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeSection === 'requests'}
                  onClick={() => setActiveSection('requests')}
                  tooltip="Solicitudes"
                >
                  <button>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Solicitudes</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeSection === 'links'}
                  onClick={() => setActiveSection('links')}
                  tooltip="Gestión de Enlaces"
                >
                  <button>
                    <LinkIcon className="h-4 w-4" />
                    <span>Gestión de Enlaces</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {activeSection === 'requests' ? (
              <>
                <div className="mb-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList>
                      <TabsTrigger value="permits" className="min-w-[150px]">
                        <FileText className="w-4 h-4 mr-2" />
                        Permisos
                      </TabsTrigger>
                      <TabsTrigger value="equipment" className="min-w-[150px]">
                        <Laptop className="w-4 h-4 mr-2" />
                        Equipos
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Aprobadas</CardTitle>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Rechazadas</CardTitle>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Códigos más frecuentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomPieChart data={getChartData('codes')} title="Códigos más frecuentes" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Tipos de solicitud</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomBarChart data={getChartData('types')} title="Tipos de solicitud" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle>Solicitudes por fecha</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CustomLineChart data={getChartData('dates')} title="Solicitudes por fecha" />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-4 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {currentRequests.map(request => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`
                        relative overflow-hidden rounded-lg border p-4 cursor-pointer
                        transition-all duration-300 hover:shadow-lg
                        ${getStatusColor(request.status)}
                      `}
                      onClick={() => setSelectedRequest(request)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">{request.name}</h3>
                          <p className="text-sm opacity-90">Código: {request.code}</p>
                        </div>
                        <Badge variant={
                          request.status === 'approved' ? 'success' :
                          request.status === 'rejected' ? 'destructive' :
                          'warning'
                        }>
                          {request.status === 'approved' ? 'Aprobada' :
                           request.status === 'rejected' ? 'Rechazada' :
                           'Pendiente'}
                        </Badge>
                      </div>
                      <div className="space-y-1">
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
                    </motion.div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
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
              </>
            ) : (
              <LinkManager />
            )}
          </div>
        </div>
      </div>

      {selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onAction={handleRequestAction}
        />
      )}
    </SidebarProvider>
  )
}

