"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Phone, MapPin, Users, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { motion, AnimatePresence } from "framer-motion"

interface Request {
  request_type: "permiso" | string
  tipo_novedad: string
  createdAt: string
  status: "approved" | "rejected" | "pending"
  telefono?: string
  fecha?: string
  hora?: string
  zona?: string
  comp_am?: string
  comp_pm?: string
  turno?: string
  description?: string
  respuesta?: string
}

interface RequestDetailsProps {
  request: Request
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RequestDetailsDialog({ request, open, onOpenChange }: RequestDetailsProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["general"])
  const isPermitRequest = request.request_type === "permiso"

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <div className="flex items-center justify-between cursor-pointer py-2" onClick={() => toggleSection(section)}>
      <h3 className="font-semibold text-green-800 text-lg">{title}</h3>
      {expandedSections.includes(section) ? <ChevronUp /> : <ChevronDown />}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-green-50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-green-800 mb-4">Detalles de la Solicitud</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-full max-h-[70vh] pr-4">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-md border border-green-200"
            >
              <SectionHeader title="Información General" section="general" />
              <AnimatePresence>
                {expandedSections.includes("general") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 mt-4"
                  >
                    <div className="flex items-center text-green-700">
                      <FileText className="w-6 h-6 mr-3 text-green-600" />
                      <span className="font-medium mr-2">Tipo:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{request.tipo_novedad}</span>
                    </div>
                    <div className="flex items-center text-green-700">
                      <Clock className="w-6 h-6 mr-3 text-green-600" />
                      <span className="font-medium mr-2">Fecha de creación:</span>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                        {format(new Date(request.createdAt), "PPP", { locale: es })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Badge
                        className={`text-lg px-4 py-2 ${
                          request.status === "approved"
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : request.status === "pending"
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {request.status === "approved"
                          ? "Aprobada"
                          : request.status === "pending"
                            ? "Pendiente"
                            : "Rechazada"}
                      </Badge>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-md border border-green-200"
            >
              <SectionHeader
                title={isPermitRequest ? "Detalles del Permiso" : "Detalles del Equipo"}
                section="details"
              />
              <AnimatePresence>
                {expandedSections.includes("details") && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid gap-4 mt-4"
                  >
                    {isPermitRequest ? (
                      <>
                        {request.telefono && (
                          <div className="flex items-center text-green-700">
                            <Phone className="w-6 h-6 mr-3 text-green-600" />
                            <span className="font-medium mr-2">Teléfono:</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                              {request.telefono}
                            </span>
                          </div>
                        )}
                        {request.fecha && (
                          <div className="flex items-center text-green-700">
                            <Calendar className="w-6 h-6 mr-3 text-green-600" />
                            <span className="font-medium mr-2">Fecha solicitada:</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{request.fecha}</span>
                          </div>
                        )}
                        {request.hora && (
                          <div className="flex items-center text-green-700">
                            <Clock className="w-6 h-6 mr-3 text-green-600" />
                            <span className="font-medium mr-2">Hora:</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{request.hora}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {request.zona && (
                          <div className="flex items-center text-green-700">
                            <MapPin className="w-6 h-6 mr-3 text-green-600" />
                            <span className="font-medium mr-2">Zona:</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{request.zona}</span>
                          </div>
                        )}
                        <div className="flex items-center text-green-700">
                          <Users className="w-6 h-6 mr-3 text-green-600" />
                          <span className="font-medium mr-2">Códigos:</span>
                          <div className="flex gap-2">
                            {request.comp_am && (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                AM: {request.comp_am}
                              </span>
                            )}
                            {request.comp_am && request.comp_pm && " | "}
                            {request.comp_pm && (
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                PM: {request.comp_pm}
                              </span>
                            )}
                          </div>
                        </div>
                        {request.turno && (
                          <div className="flex items-center text-green-700">
                            <Clock className="w-6 h-6 mr-3 text-green-600" />
                            <span className="font-medium mr-2">Turno:</span>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">{request.turno}</span>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {request.description && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white p-6 rounded-lg shadow-md border border-green-200"
              >
                <SectionHeader title="Descripción" section="description" />
                <AnimatePresence>
                  {expandedSections.includes("description") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <p className="text-green-700 whitespace-pre-wrap bg-green-50 p-4 rounded-lg">
                        {request.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {request.respuesta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-white p-6 rounded-lg shadow-md border border-green-200"
              >
                <SectionHeader title="Respuesta" section="response" />
                <AnimatePresence>
                  {expandedSections.includes("response") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4"
                    >
                      <p className="text-green-700 bg-green-50 p-4 rounded-lg">{request.respuesta}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
