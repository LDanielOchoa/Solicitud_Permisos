'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, BarChart, BarChartIcon as Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PermitsManagement from './permits-management'
import Indicators from './indicators'
import './permits-management.css'

const MotionCard = motion(Card)

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<'permits' | 'indicators'>('permits')

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
      color: "text-blue-600",
    },
    {
      title: "Indicadores",
      icon: BarChart,
      value: "Ver Estadísticas",
      description: "Visualice métricas y tendencias",
      color: "text-green-600",
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
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <MotionCard
            key={stat.title}
            variants={cardVariants}
            className="dashboard-card cursor-pointer"
            onClick={() => setActiveSection(index < 2 ? (index === 0 ? 'permits' : 'indicators') : undefined)}
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

      <div className="flex justify-center space-x-4 mb-8">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant={activeSection === 'permits' ? "default" : "outline"}
            className="nav-button"
            onClick={() => setActiveSection('permits')}
          >
            <FileText className="mr-2 h-4 w-4" />
            Gestión de Permisos
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant={activeSection === 'indicators' ? "default" : "outline"}
            className="nav-button"
            onClick={() => setActiveSection('indicators')}
          >
            <BarChart className="mr-2 h-4 w-4" />
            Indicadores
          </Button>
        </motion.div>
      </div>

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
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

