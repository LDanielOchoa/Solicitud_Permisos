'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X, Upload, FileText, AlertCircle } from 'lucide-react'
import { format, addDays, isSameDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Alert, AlertDescription } from "@/components/ui/alert"
import Navigation from '../../components/navigation'
import LoadingOverlay from '../../components/loading-overlay'

export default function PermitRequestForm() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [noveltyType, setNoveltyType] = useState('')
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
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  if (isLoading) {
    return <LoadingOverlay />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-40 backdrop-blur-lg rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 flex justify-center">
            <Button 
              onClick={() => router.push('/login')}
              className="bg-green-500 text-white hover:bg-green-600"
            >
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDates(prev => {
      const isAlreadySelected = prev.some(d => isSameDay(d, date))
      if (isAlreadySelected) {
        return prev.filter(d => !isSameDay(d, date))
      } else {
        return [...prev, date]
      }
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setSelectedFiles(prevFiles => {
        const updatedFiles = [...prevFiles, ...newFiles]
        return updatedFiles.slice(0, 5) // Limit to 5 files
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = {
      code: userData.code,
      name: userData.name,
      phone: (e.target as HTMLFormElement).phone.value,
      dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
      noveltyType,
      time: (e.target as HTMLFormElement).time?.value || '',
      description: (e.target as HTMLFormElement).description.value,
      files: selectedFiles.map(file => file.name),
    }

    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No se encontró el token de acceso')
      }

      const response = await fetch('http://127.0.0.1:8000/permit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud')
      }

      setIsSuccess(true)
      // Resetear el formulario
      e.target.reset()
      setSelectedDates([])
      setSelectedFiles([])
      setNoveltyType('')
    } catch (error) {
      console.error('Error:', error)
      setError('Ocurrió un error al enviar la solicitud. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
      // Resetear el éxito después de 3 segundos
      setTimeout(() => setIsSuccess(false), 3000)
    }
  }

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i))

  return (
    <div className="min-h-screen via-white to-green-200 flex items-center justify-center p-4 relative overflow-hidden">
      <Navigation />
      {isLoading && <LoadingOverlay />}
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
            className="text-4xl font-bold text-green-700 text-center mb-8"
          >
            Solicitud de Permiso
          </motion.h1>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-green-700">Código</Label>
              <Input
                id="code"
                value={userData.code}
                readOnly
                className="border-green-300 focus:ring-green-500 bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-green-700">Nombre y Apellido</Label>
              <Input
                id="name"
                value={userData.name}
                readOnly
                className="border-green-300 focus:ring-green-500 bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-green-700">Teléfono de contacto</Label>
              <Input id="phone" type="tel" placeholder="Ingrese su teléfono" className="border-green-300 focus:ring-green-500" required />
            </div>
            <div className="space-y-2">
              <Label className="text-green-700">Fechas de solicitud</Label>
              <div className="grid grid-cols-7 gap-2">
                {weekDates.map((date, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedDates.some(d => isSameDay(d, date)) ? "default" : "outline"}
                    className={`p-2 h-auto flex flex-col items-center justify-center ${
                      selectedDates.some(d => isSameDay(d, date)) ? 'bg-green-500 text-white' : ''
                    }`}
                    onClick={() => handleDateSelect(date)}
                  >
                    <span className="text-xs">{format(date, 'EEE', { locale: es })}</span>
                    <span className="text-lg font-bold">{format(date, 'd')}</span>
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-green-700">Tipo de novedad</Label>
              <Select required onValueChange={(value) => setNoveltyType(value)}>
                <SelectTrigger className="border-green-300 focus:ring-green-500">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="descanso">Descanso</SelectItem>
                  <SelectItem value="audiencia">Audiencia o curso de tránsito</SelectItem>
                  <SelectItem value="cita">Cita médica</SelectItem>
                  <SelectItem value="licencia">Licencia no remunerada</SelectItem>
                  <SelectItem value="semanaAM">Semana A.M.</SelectItem>
                  <SelectItem value="semanaPM">Semana P.M.</SelectItem>
                  <SelectItem value="diaAM">Día A.M.</SelectItem>
                  <SelectItem value="diaPM">Día P.M.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(noveltyType === 'cita' || noveltyType === 'audiencia') && (
              <div className="space-y-2">
                <Label htmlFor="time" className="text-green-700">Hora de la novedad</Label>
                <Input id="time" type="time" className="border-green-300 focus:ring-green-500" required />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-green-700">Descripción de la solicitud</Label>
              <Textarea
                id="description"
                placeholder="Ingrese el detalle de tu solicitud"
                className="min-h-[100px] border-green-300 focus:ring-green-500"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file" className="text-green-700">Adjuntar archivos (Máximo 5)</Label>
              <div className="flex items-center justify-center w-full">
                <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-green-500" />
                    <p className="mb-2 text-sm text-green-700"><span className="font-bold">Haga clic para cargar</span> o arrastre y suelte</p>
                    <p className="text-xs text-green-600">{5 - selectedFiles.length} archivo(s) restante(s)</p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                </label>
              </div>
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {selectedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center justify-between p-2 bg-green-100 rounded-lg"
                    >
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-green-600" />
                        <span className="text-sm text-green-700">{file.name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
              {selectedFiles.length >= 5 && (
                <p className="text-sm text-yellow-600 mt-2">
                  Has alcanzado el límite de 5 archivos.
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-600 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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
            className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-lg shadow-lg"
          >
            ¡Solicitud de permiso enviada con éxito!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

