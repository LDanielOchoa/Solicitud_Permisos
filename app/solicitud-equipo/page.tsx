'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from '../../components/navigation'

const FloatingLeaf = ({ delay }: { delay: number }) => (
  <motion.div
    className="absolute w-8 h-8 bg-blue-500 rounded-full opacity-50"
    initial={{ y: -20, x: Math.random() * 100 - 50, opacity: 0 }}
    animate={{
      y: ['0%', '100%'],
      x: ['-50%', '50%', '-50%'],
      opacity: [0, 1, 0],
      scale: [0.8, 1, 0.8],
    }}
    transition={{
      duration: 15,
      repeat: Infinity,
      delay: delay,
    }}
  />
)

export default function EquipmentRequestForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [userData, setUserData] = useState({ code: '', name: '' })
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('http://127.0.0.1:8000/auth/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.status === 401) {
          localStorage.removeItem('accessToken')
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario')
        }

        const data = await response.json()
        setUserData({ code: data.code, name: data.name })
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('No se pudieron cargar los datos del usuario. Por favor, inicie sesión nuevamente.')
      }
    }

    fetchUserData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = {
      type: (e.target as HTMLFormElement).type.value,
      description: (e.target as HTMLFormElement).description.value,
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No se encontró el token de acceso')
      }

      const response = await fetch('http://127.0.0.1:8000/equipment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Error al enviar la solicitud: ${errorData.detail}`)
      }

      setIsSuccess(true);
      // Reset the form
      (e.target as HTMLFormElement).reset()
    } catch (error) {
      console.error('Error:', error)
      setError('Ocurrió un error al enviar la solicitud. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
      // Reset success after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-40 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => router.push('/login')}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center p-4 relative overflow-hidden">
      <Navigation />
      
      {[...Array(10)].map((_, i) => (
        <FloatingLeaf key={i} delay={i * 0.5} />
      ))}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white bg-opacity-40 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-4xl font-bold text-blue-700 text-center mb-8"
          >
            Solicitud de Equipo
          </motion.h1>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-blue-700">Código</Label>
              <Input
                id="code"
                value={userData.code}
                readOnly
                className="border-blue-300 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-700">Nombre y Apellido</Label>
              <Input
                id="name"
                value={userData.name}
                readOnly
                className="border-blue-300 focus:ring-blue-500 bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-blue-700">Tipo de equipo</Label>
              <Select required name="type">
                <SelectTrigger className="border-blue-300 focus:ring-blue-500">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="computadora">Turno pareja</SelectItem>
                  <SelectItem value="telefono">Tabla partida</SelectItem>
                  <SelectItem value="herramientas">Disponible fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-blue-700">Descripción de la solicitud</Label>
              <Textarea
                id="description"
                placeholder="Ingrese el detalle de tu solicitud de equipo"
                className="min-h-[100px] border-blue-300 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              className="bg-blue-500 text-white hover:bg-blue-600 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isLoading ? 'Enviando...' : 'Enviar Solicitud'}
            </Button>
          </div>
        </form>
      </motion.div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-blue-500 text-white p-4 rounded-lg shadow-lg"
          >
            ¡Solicitud de equipo enviada con éxito!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

