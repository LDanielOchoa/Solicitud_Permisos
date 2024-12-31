'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertCircle, Video, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function VideoAlert() {
  const [isOpen, setIsOpen] = useState(false)
  const [showToast, setShowToast] = useState(true)

  useEffect(() => {
    // Auto-hide toast after 10 seconds if not interacted with
    const timer = setTimeout(() => {
      if (!isOpen) setShowToast(false)
    }, 10000)

    return () => clearTimeout(timer)
  }, [isOpen])

  return (
    <>
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 flex justify-center"
          >
            <motion.div
              className="bg-green-50 border border-green-200 rounded-lg shadow-lg max-w-xl w-full"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="relative p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2 text-green-700 hover:text-green-900 hover:bg-green-100"
                  onClick={() => setShowToast(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsOpen(true)}>
                  <div className="bg-green-100 p-2 rounded-full">
                    <Video className="h-5 w-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800">¡Instrucciones Importantes!</h3>
                    <p className="text-green-600 text-sm">
                      Haga clic aquí para ver el video instructivo antes de continuar
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[700px] p-0 gap-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-t-lg">
              <DialogHeader className="space-y-3">
                <motion.div 
                  className="flex items-center justify-center gap-3"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="bg-white/20 p-2 rounded-full">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                  <DialogTitle className="text-2xl font-bold">
                    Instrucciones Importantes
                  </DialogTitle>
                </motion.div>
                <motion.p 
                  className="text-green-50 text-center text-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Por favor, vea este video con instrucciones importantes antes de continuar
                </motion.p>
              </DialogHeader>
            </div>

            <div className="p-8 space-y-6 bg-gradient-to-b from-green-50 to-white">
              <motion.div 
                className="relative aspect-video w-full overflow-hidden rounded-xl border shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <iframe
                  src="https://www.youtube.com/embed/bn3xJSZunOo"
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  loading="lazy"
                />
              </motion.div>

              <motion.div 
                className="flex justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button 
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 rounded-full"
                  onClick={() => {
                    setIsOpen(false)
                    setShowToast(false)
                  }}
                >
                  He visto el video y deseo continuar
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
}

