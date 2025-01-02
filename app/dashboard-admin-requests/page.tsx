'use client'  // Marca este archivo como un Client Component

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BarChart, AlertTriangle, Database, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import PermitsManagement from './permits-management'
import Indicators from './indicators'
import PermitRequestForm from './request-form'
import HistoricalRecords from '../excel/page'
import { useRouter } from 'next/navigation' 
import UserManagementPage from '../user-management/page'

export default function AdminDashboard() {
  type SectionType = 'permits' | 'indicators' | 'extemporaneous' | 'history' | 'users' | 'exit'
  const MotionCard = motion(Card) 
  const [activeSection, setActiveSection] = useState<SectionType>('permits')

  const router = useRouter()  // useRouter de 'next/navigation'

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const stats = [
    {
      title: "Gestión de Permisos",
      icon: FileText,
      value: "Administrar",
      description: "Gestione solicitudes de permisos y postulaciones ",
      color: "text-green-600",
      section: 'permits' as SectionType
    },
    {
      title: "Indicadores",
      icon: BarChart,
      value: "Ver Estadísticas",
      description: "Visualice métricas y tendencias",
      color: "text-purple-600",
      section: 'indicators' as SectionType
    },
    {
      title: "Permisos Extemporáneos",
      icon: AlertTriangle,
      value: "Gestionar",
      description: "Administre solicitudes fuera de plazo",
      color: "text-yellow-600",
      section: 'extemporaneous' as SectionType
    },
    {
      title: "Registro Historico",
      icon: Database,
      value: "Obtener",
      description: "Registro de solicitudes y respuestas",
      color: "text-blue-600",
      section: 'history' as SectionType
    },
    {
      title: "Gestión de Usuarios",
      icon: Users,
      value: "Administrar",
      description: "Gestione los usuarios del sistema",
      color: "text-indigo-600",
      section: 'users' as SectionType
    },
    {
      title: "Salir",
      icon: AlertTriangle,
      value: "Cerrar Sesión",
      description: "Regresar a la página de inicio",
      color: "text-red-600",
      section: 'exit' as SectionType
    },
  ]

  const handleSectionChange = (section: SectionType) => {
    if (section === 'exit') {
      router.push('/') // Redirigir a la página de inicio
    } else {
      setActiveSection(section)
    }
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-center mb-2">Panel de Administración</h1>
        <p className="text-center text-muted-foreground">
          Gestione solicitudes y visualice estadísticas del sistema
        </p>
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
      >
        {stats.map((stat) => (
          <MotionCard
            key={stat.title}
            variants={cardVariants}
            className="cursor-pointer transition-colors hover:bg-accent"
            onClick={() => handleSectionChange(stat.section)} // Cambiar a la función de redirección
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stat.value}</div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </MotionCard>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border bg-card"
        >
          {activeSection === 'permits' && <PermitsManagement />}
          {activeSection === 'indicators' && <Indicators />}
          {activeSection === 'extemporaneous' && <PermitRequestForm />}
          {activeSection === 'history' && <HistoricalRecords />}
          {activeSection === 'users' && <UserManagementPage />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
