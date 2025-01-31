"use client"

import { motion } from "framer-motion"
import { AlertCircle, Clock } from "lucide-react"
import Navigation from "../../components/navigation"

export default function ModuloDesactivadoConNav() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-grow flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-emerald-600 rounded-3xl shadow-2xl p-8 max-w-md w-full relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-40 h-40 bg-emerald-500 rounded-full"
            style={{ filter: "blur(60px)" }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <AlertCircle className="w-16 h-16 text-white" />
          </motion.div>

          <motion.h1
            className="text-4xl font-bold text-white mb-6 relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Módulo Temporalmente Desactivado
          </motion.h1>

          <motion.div
            className="bg-white rounded-xl p-6 mb-6 relative z-10"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <p className="text-lg text-gray-800 mb-4">Las postulaciones estuvieron abiertas hasta el día 30.</p>
            <p className="text-lg font-semibold text-emerald-700">El módulo está desactivado hasta nuevo aviso.</p>
          </motion.div>

          <motion.div
            className="flex items-center justify-center text-white mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Clock className="w-6 h-6 mr-2" />
            <p className="text-sm font-medium">Estaremos de vuelta pronto</p>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <p className="text-sm text-emerald-100">Gracias por su comprensión y paciencia.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

