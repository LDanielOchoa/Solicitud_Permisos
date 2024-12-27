'use client'

import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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

  const renderRequestRow = (request: Request) => {
    const isPermitRequest = request.request_type === 'permiso'
    const isApproved = request.status === 'approved'

    return (
      <TableRow 
        key={request.id}
        className={`cursor-pointer ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}
        onClick={() => setSelectedRequest(request)}
      >
        <TableCell>
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
        </TableCell>
        <TableCell>{request.tipo_novedad}</TableCell>
        <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
        <TableCell>
          <Badge 
            className={
              isApproved
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {isApproved ? 'Aprobada' : 'Rechazada'}
          </Badge>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-grow pt-20 px-4 max-w-7xl mx-auto w-auto">
        {isLoading && <LoadingOverlay />}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-green-800">Mis Solicitudes</h2>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Resumen de Solicitudes</h3>
              <div className="flex gap-4">
                <div className="bg-green-100 p-3 rounded-md">
                  <p className="text-green-800 font-bold">{filteredRequests.filter(r => r.status === 'approved').length}</p>
                  <p className="text-sm text-green-600">Aprobadas</p>
                </div>
                <div className="bg-red-100 p-3 rounded-md">
                  <p className="text-red-800 font-bold">{filteredRequests.filter(r => r.status === 'rejected').length}</p>
                  <p className="text-sm text-red-600">Rechazadas</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-md">
                  <p className="text-blue-800 font-bold">{filteredRequests.length}</p>
                  <p className="text-sm text-blue-600">Total</p>
                </div>
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

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Novedad</TableHead>
                  <TableHead>Fecha de Creación</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                      No hay solicitudes para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map(request => renderRequestRow(request))
                )}
              </TableBody>
            </Table>
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

