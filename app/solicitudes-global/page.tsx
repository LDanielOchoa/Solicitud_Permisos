'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter } from 'lucide-react'
import Navigation from '../../components/navigation'
import LoadingOverlay from '../../components/loading-overlay'
import { Button } from '@/components/ui/button'
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
} from '@/components/ui/table'

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
}

export default function Solicitudes() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [filterPeriod, setFilterPeriod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('desc')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

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
    fetchUserData()
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

    // Sort
    filtered.sort((a, b) => {
      return sortOrder === 'desc'
        ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })

    setFilteredRequests(filtered)
  }, [requests, filterPeriod, filterStatus, sortOrder])

  return (
    <div className="min-h-screen flex flex-col p-4 overflow-hidden">
      <Navigation />
      
      {isLoading && <LoadingOverlay />}

      <div className="container mx-auto max-w-6xl">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white shadow-md rounded-lg p-6 mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Mis Solicitudes</h2>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <Select onValueChange={setFilterPeriod} defaultValue="all">
              <SelectTrigger className="w-[180px]">
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
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="aceptada">Aceptadas</SelectItem>
                <SelectItem value="rechazada">Rechazadas</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            >
              <Filter className="mr-2 h-4 w-4" />
              {sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguas primero'}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo de Novedad</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Respuesta</TableHead>
                  <TableHead>Zona</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      No hay solicitudes para mostrar
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.code}</TableCell>
                      <TableCell>{request.name}</TableCell>
                      <TableCell>{request.tipo_novedad}</TableCell>
                      <TableCell>{request.description}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          request.status === 'aceptada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {request.status}
                        </span>
                      </TableCell>
                      <TableCell>{request.respuesta || '-'}</TableCell>
                      <TableCell>{request.zona || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

