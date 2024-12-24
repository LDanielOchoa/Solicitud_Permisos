'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Phone, MapPin, Users } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface RequestDetailsProps {
  request: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDetailsDialog({ request, open, onOpenChange }: RequestDetailsProps) {
  const isPermitRequest = request.request_type === 'permiso'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-green-800">
            Detalles de la Solicitud
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Información General</h3>
              <div className="grid gap-3">
                <div className="flex items-center text-green-700">
                  <FileText className="w-5 h-5 mr-2" />
                  <span className="font-medium mr-2">Tipo:</span>
                  {request.tipo_novedad}
                </div>
                <div className="flex items-center text-green-700">
                  <Clock className="w-5 h-5 mr-2" />
                  <span className="font-medium mr-2">Fecha de creación:</span>
                  {format(new Date(request.createdAt), 'PPP', { locale: es })}
                </div>
                <Badge className={
                  request.status === 'approved' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                }>
                  {request.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                </Badge>
              </div>
            </div>

            {/* Detalles específicos según el tipo de solicitud */}
            {isPermitRequest ? (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Detalles del Permiso</h3>
                <div className="grid gap-3">
                  {request.telefono && (
                    <div className="flex items-center text-green-700">
                      <Phone className="w-5 h-5 mr-2" />
                      <span className="font-medium mr-2">Teléfono:</span>
                      {request.telefono}
                    </div>
                  )}
                  {request.fecha && (
                    <div className="flex items-center text-green-700">
                      <Calendar className="w-5 h-5 mr-2" />
                      <span className="font-medium mr-2">Fecha solicitada:</span>
                      {request.fecha}
                    </div>
                  )}
                  {request.hora && (
                    <div className="flex items-center text-green-700">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium mr-2">Hora:</span>
                      {request.hora}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Detalles del Equipo</h3>
                <div className="grid gap-3">
                  {request.zona && (
                    <div className="flex items-center text-green-700">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="font-medium mr-2">Zona:</span>
                      {request.zona}
                    </div>
                  )}
                  <div className="flex items-center text-green-700">
                    <Users className="w-5 h-5 mr-2" />
                    <span className="font-medium mr-2">Códigos:</span>
                    <div>
                      {request.comp_am && <div>AM: {request.comp_am}</div>}
                      {request.comp_pm && <div>PM: {request.comp_pm}</div>}
                    </div>
                  </div>
                  {request.turno && (
                    <div className="flex items-center text-green-700">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium mr-2">Turno:</span>
                      {request.turno}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            {request.description && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Descripción</h3>
                <p className="text-green-700 whitespace-pre-wrap">{request.description}</p>
              </div>
            )}

            {/* Respuesta */}
            {request.respuesta && (
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-3">Respuesta</h3>
                <p className="text-green-700">{request.respuesta}</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

