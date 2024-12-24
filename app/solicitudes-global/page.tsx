'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Calendar, Clock, MapPin, Users } from 'lucide-react'
import Navigation from '../../components/navigation'
import LoadingOverlay from '../../components/loading-overlay'
import { RequestDetailsDialog } from './request-details-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Request {
  id: number
  code: string
  name: string
  tipo_novedad: string
  description: string
  status: string
  respuesta: string
  zona?: string
  createdAt: string
  request_type: 'permiso' | 'equipo'
  [key: string]: any
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
          setRequests(data)
          setFilteredRequests(data)
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        key={request.id}
        onClick={() => setSelectedRequest(request)}
        className="cursor-pointer"
      >
        <Card className={`
          border-l-4 
          ${isApproved ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}
        `}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <Badge 
                variant="outline" 
                className={`
                  ${isPermitRequest 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-blue-100 text-blue-800 border-blue-300'}
                `}
              >
                {isPermitRequest ? 'Permiso' : 'Equipo'}
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
            </div>
            <CardTitle className={`text-lg ${isApproved ? 'text-green-800' : 'text-red-800'}`}>
              {request.tipo_novedad}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-2 h-4 w-4" />
                {new Date(request.createdAt).toLocaleDateString()}
              </div>
              
              {isPermitRequest ? (
                request.fecha && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Fecha: {request.fecha}
                  </div>
                )
              ) : (
                <>
                  {request.zona && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2 h-4 w-4" />
                      Zona: {request.zona}
                    </div>
                  )}
                  {(request.comp_am || request.comp_pm) && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2 h-4 w-4" />
                      {request.comp_am && `AM: ${request.comp_am}`}
                      {request.comp_am && request.comp_pm && ' | '}
                      {request.comp_pm && `PM: ${request.comp_pm}`}
                    </div>
                  )}
                </>
              )}
              
              {request.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                  {request.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden">
      <Navigation />
      
      {isLoading && <LoadingOverlay />}

      <div className="container mx-auto max-w-6xl">
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-green-800">Mis Solicitudes</h2>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <Select onValueChange={setFilterPeriod} defaultValue="all">
              <SelectTrigger className="w-[180px] border-green-300">
                <SelectValue placeholder="Filtrar por período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="day">Último día</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
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
                <SelectItem value="equipo">Equipos</SelectItem>
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
              <div className="col-span-full text-center py-8 text-gray-500">
                No hay solicitudes para mostrar
              </div>
            ) : (
              filteredRequests.map(request => renderRequestCard(request))
            )}
          </div>
        </div>
      </div>

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

