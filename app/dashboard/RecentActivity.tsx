'use client'

import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ActivityItem {
  status: 'approved' | 'rejected'
  message: string
  date: string
  type: string
  isNew?: boolean
}

export function RecentActivity({ notifications }: { notifications: ActivityItem[] }) {
  if (!notifications || notifications.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-green-100/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
            <Clock className="w-6 h-6" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No hay actividad reciente para mostrar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-100/50">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {notifications.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-[80%] bg-gradient-to-b from-green-400 to-green-600 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-200" />
                <div className={`p-4 bg-white dark:bg-green-800/50 rounded-lg shadow-sm border ${
                  item.isNew 
                    ? 'border-green-400 dark:border-green-500' 
                    : 'border-green-100 dark:border-green-700'
                } hover:shadow-md transition-all duration-200`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-full ${
                      item.status === 'approved' 
                        ? 'bg-green-100 dark:bg-green-700/50' 
                        : 'bg-red-100 dark:bg-red-900/50'
                    }`}>
                      {item.status === 'approved' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-medium ${
                          item.status === 'approved'
                            ? 'text-green-700 dark:text-green-300'
                            : 'text-red-700 dark:text-red-300'
                        }`}>
                          {item.type}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.date}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {item.message}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
