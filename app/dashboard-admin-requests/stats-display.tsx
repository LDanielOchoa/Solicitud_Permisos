'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsDisplayProps {
  stats: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  className?: string
}

export function StatsDisplay({ stats, className }: StatsDisplayProps) {
  const statItems = [
    {
      label: "Total de solicitudes",
      value: stats.total,
      className: "text-gray-900 bg-gradient-to-br from-gray-50 to-gray-100",
      valueClassName: "text-gray-900"
    },
    {
      label: "Aprobadas",
      value: stats.approved,
      className: "text-emerald-900 bg-gradient-to-br from-emerald-50 to-emerald-100",
      valueClassName: "text-emerald-600"
    },
    {
      label: "Pendientes",
      value: stats.pending,
      className: "text-amber-900 bg-gradient-to-br from-amber-50 to-amber-100",
      valueClassName: "text-amber-600"
    },
    {
      label: "Rechazadas",
      value: stats.rejected,
      className: "text-red-900 bg-gradient-to-br from-red-50 to-red-100",
      valueClassName: "text-red-600"
    }
  ]

  return (
    <Card className={cn("bg-white shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          <AnimatePresence mode="wait">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
              >
                <div className={cn(
                  "rounded-lg p-4 transition-all duration-200 hover:shadow-md",
                  item.className
                )}>
                  <p className="text-sm font-medium mb-1">
                    {item.label}
                  </p>
                  <motion.p 
                    className={cn(
                      "text-3xl font-bold tracking-tight",
                      item.valueClassName
                    )}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.1 + 0.2
                    }}
                  >
                    {item.value}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

