'use client'

import { useState, useEffect } from 'react'
import { Filter, Calendar, Clock, FileText, MapPin } from 'lucide-react'
import Navigation from '../../components/navigation'
import LoadingOverlay from '../../components/loading-overlay'
import { RequestDetailsDialog } from './request-details-dialog'
import { Button } from '@/components/ui/button'
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Request {
  id: number
  code: string
  name: string
  tipo_novedad: string
  description: string
  status: 'approved' | 'rejected'
  respuesta: string
  zona?: string
  createdAt: string
  request_type: 'permiso' | 'postlaciones'
  fecha?: string
  comp_am?: string
  comp_pm?: string
  [key: string]: string | number | undefined
}

export default function Solicitudes() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const response = await fetch('http://127.0.0.1:8000/solicitudes', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const data = await response.json()
          const typedData = data.map((req: any) => ({
            ...req,
            status: req.status as 'approved' | 'rejected'
          }))
          setRequests(typedData)
          setFilteredRequests(typedData)
        }
      } finally {
        setIsLoading(false)
      }
    }

    setIsLoading(true)
    fetchRequests()
  }, [])

  useEffect(() => {
    let filtered = [...requests]

    // Filter by period
    if (filterPeriod !== 'all') {
      const now = new Date()
      const periodStart = new Date()
      switch (filterPeriod) {
        case 'day':
          periodStart.setDate(now.getDate() - 1)
          break
        case 'week':
          periodStart.setDate(now.getDate() - 7)
          break
        case 'month':
          periodStart.setMonth(now.getMonth() - 1)
          break
        case 'year':
          periodStart.setFullYear(now.getFullYear() - 1)
          break
      }
      filtered = filtered.filter(req => new Date(req.createdAt) >= periodStart)
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(req => req.status === filterStatus)
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(req => req.request_type === filterType)
    }

    // Sort
    filtered.sort((a, b) => {
      return sortOrder === 'desc'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    setFilteredRequests(filtered)
  }, [requests, filterPeriod, filterStatus, filterType, sortOrder])

  const renderRequestCard = (request: Request) => {
    const isPermitRequest = request.request_type === 'permiso'
    const isApproved = request.status === 'approved'

    return (
      <Card 
        key={request.id}
        className={`cursor-pointer transition-all hover:shadow-lg ${
          isApproved ? 'bg-green-50 hover:bg-green-100' : 'bg-red-50 hover:bg-red-100'
        }`}
        onClick={() => setSelectedRequest(request)}
      >
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center text-lg">
            <Badge 
              variant="outline" 
              className={`
                ${isPermitRequest 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-blue-100 text-blue-800 border-blue-300'}
              `}
            >
              {isPermitRequest ? 'Permiso' : 'Postulaciones'}
            </Badge>
            <Badge 
              className={
                isApproved
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }
            >
              {isApproved ? 'Aprobada' : 'Rechazada'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">{request.tipo_novedad}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
            {request.fecha && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                <span>{request.fecha}</span>
              </div>
            )}
            {request.zona && (
              <div className="flex items-center col-span-2">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <span>{request.zona}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center text-sm text-gray-600">
                  <FileText className="w-4 h-4 mr-2" />
                  <p className="line-clamp-1">{request.description || 'Sin descripción'}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{request.description || 'Sin descripción'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-20 px-4 max-w-7xl mx-auto w-full">
        {isLoading && <LoadingOverlay />}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-800">Mis Solicitudes</h2>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Resumen de Solicitudes</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-green-100">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-green-800">
                    {filteredRequests.filter(r => r.status === 'approved').length}
                  </p>
                  <p className="text-sm text-green-600">Aprobadas</p>
                </CardContent>
              </Card>
              <Card className="bg-red-100">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-red-800">
                    {filteredRequests.filter(r => r.status === 'rejected').length}
                  </p>
                  <p className="text-sm text-red-600">Rechazadas</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-100">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-blue-800">{filteredRequests.length}</p>
                  <p className="text-sm text-blue-600">Total</p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-6">
            <Select onValueChange={setFilterPeriod} defaultValue="all">
              <SelectTrigger className="w-[180px] border-green-300">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setFilterStatus} defaultValue="all">
              <SelectTrigger className="w-[180px] border-green-300">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprobadas</SelectItem>
                <SelectItem value="rejected">Rechazadas</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setFilterType} defaultValue="all">
              <SelectTrigger className="w-[180px] border-green-300">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="permiso">Permisos</SelectItem>
                <SelectItem value="postlaciones">Postulaciones</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <Filter className="mr-2 h-4 w-4" />
              {sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRequests.length === 0 ? (
              <p className="col-span-full text-center py-8 text-gray-500">
                No hay solicitudes para mostrar
              </p>
            ) : (
              filteredRequests.map(request => renderRequestCard(request))
            )}
          </div>
        </div>
      </main>
      {selectedRequest && (
        <RequestDetailsDialog
          request={selectedRequest}
          open={!!selectedRequest}
          onOpenChange={(open) => !open && setSelectedRequest(null)}
        />
      )}
    </div>
  )
}

