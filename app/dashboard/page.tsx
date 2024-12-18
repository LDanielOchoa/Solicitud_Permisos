'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import Navigation from '../../components/navigation'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex flex-col p-4 relative overflow-hidden">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/solicitud-permisos" className="block">
              <Button className="w-full h-full p-8 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Solicitud de Permisos</h2>
                  <p>Gestione sus solicitudes de permisos y ausencias laborales.</p>
                </div>
              </Button>
            </Link>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/solicitud-equipo" className="block">
              <Button className="w-full h-full p-8 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Solicitud de Equipo</h2>
                  <p>Solicite equipos y herramientas necesarias para su trabajo.</p>
                </div>
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

