'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BarChart, Clock, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PermitsManagement from './permits-management'
import Indicators from './indicators'
import PermitRequestForm from './request-form'
import './page.css'

const MotionCard = motion(Card)

type SectionType = 'permits' | 'indicators' | 'extemporaneous'

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<SectionType>('permits')

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const stats = [
    {
      title: "Gestión de Permisos",
      icon: FileText,
      value: "Administrar",
      description: "Gestione solicitudes de permisos y equipos",
      color: "text-green-600",
    },
    {
      title: "Indicadores",
      icon: BarChart,
      value: "Ver Estadísticas",
      description: "Visualice métricas y tendencias",
      color: "text-green-600",
    },
    {
      title: "Permisos Extemporáneos",
      icon: AlertTriangle,
      value: "Gestionar",
      description: "Administre solicitudes fuera de plazo",
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="admin-dashboard">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="dashboard-header"
      >
        <h1 className="dashboard-title">Panel de Administración</h1>
        <p className="text-center text-gray-600 mb-8">
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <MotionCard
            key={stat.title}
            variants={cardVariants}
            className="dashboard-card cursor-pointer"
            onClick={() => setActiveSection(index === 0 ? 'permits' : index === 1 ? 'indicators' : 'extemporaneous')}
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
          className="section-container"
        >
          {activeSection === 'permits' && <PermitsManagement />}
          {activeSection === 'indicators' && <Indicators />}
          {activeSection === 'extemporaneous' && <PermitRequestForm />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

