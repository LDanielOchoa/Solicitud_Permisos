'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, X, Upload, FileText, AlertCircle, Calendar } from 'lucide-react'
import { format, addDays, isSameDay, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import Navigation from '../../components/navigation'
import LoadingOverlay from '../../components/loading-overlay'

export default function PermitRequestForm() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [noveltyType, setNoveltyType] = useState('')
  const [userData, setUserData] = useState({ code: '', name: '', phone: '' })
  const [error, setError] = useState('')
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
  const [newPhoneNumber, setNewPhoneNumber] = useState('')
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [isLicenseNotificationOpen, setIsLicenseNotificationOpen] = useState(false)
  const [hasShownLicenseNotification, setHasShownLicenseNotification] = useState(false)
  const router = useRouter()
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        
        if (!token) {
          router.push('/')
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
          router.push('/')
          return
        }

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario')
        }

        const data = await response.json()
        setUserData({ code: data.code, name: data.name, phone: data.phone || '' })
      } catch (error) {
        console.error('Error fetching user data:', error)
        setError('No se pudieron cargar los datos del usuario. Por favor, inicie sesión nuevamente.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  const handlePhoneDoubleClick = () => {
    setIsPhoneDialogOpen(true)
    setNewPhoneNumber(userData.phone)
  }

  const updatePhoneNumber = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('accessToken')
      if (!token) {
        throw new Error('No se encontró el token de acceso')
      }

      const response = await fetch('http://127.0.0.1:8000/update-phone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: newPhoneNumber }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar el número de teléfono')
      }

      setUserData(prev => ({ ...prev, phone: newPhoneNumber }))
      setIsPhoneDialogOpen(false)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error('Error:', error)
      setError('Ocurrió un error al actualizar el número de teléfono. Por favor, inténtelo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

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
              onClick={() => router.push('/')}
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
      const isAlreadySelected = prev.some(d => isSameDay(d, date));
      let newDates;
    
      if (noveltyType === 'audiencia' || noveltyType === 'cita') {
        newDates = isAlreadySelected ? [] : [date];
      } else {
        newDates = isAlreadySelected
          ? prev.filter(d => !isSameDay(d, date))
          : [...prev, date];
        
        if (newDates.length >= 2 && noveltyType === 'descanso') {
          setIsConfirmationDialogOpen(true);
        }

        if (noveltyType === 'licencia' && newDates.length === 3 && !hasShownLicenseNotification) {
          setIsLicenseNotificationOpen(true);
          setHasShownLicenseNotification(true);
        }
      }
    
      return newDates;
    });
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
  
    const formData = new FormData(e.target as HTMLFormElement)
    const time = formData.get('time') as string | null
    const description = formData.get('description') as string | null
  
    const data = {
      code: userData.code,
      name: userData.name,
      phone: userData.phone,
      dates: selectedDates.map(date => format(date, 'yyyy-MM-dd')),
      noveltyType,
      time: time || '',
      description: description || '',
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
        body: JSON.stringify(data),
      })
  
      if (!response.ok) {
        throw new Error('Error al enviar la solicitud')
      }
  
      setIsSuccess(true)
      // Resetear el formulario
      const form = e.target as HTMLFormElement
      form.reset()  // Aquí verificamos que `e.target` es un formulario
  
      setSelectedDates([])
      setSelectedFiles([])
      setNoveltyType('')
      setHasShownLicenseNotification(false)
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

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      setNoveltyType('licencia')
    } else {
      setSelectedDates(prev => prev.slice(0, -1))
    }
    setIsConfirmationDialogOpen(false)
  }

  return (
    <div className="min-h-screen via-white to-green-200 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <Navigation />
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white bg-opacity-40 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden relative z-10 px-4 sm:px-6 md:px-8"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-4 sm:space-y-6">
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-3xl sm:text-4xl font-bold text-green-700 text-center mb-6 sm:mb-8"
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
              <Input
                id="phone"
                type="tel"
                value={userData.phone}
                onDoubleClick={handlePhoneDoubleClick}
                readOnly
                placeholder="Haga doble clic para editar"
                className="border-green-300 focus:ring-green-500 cursor-pointer"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-green-700">Tipo de novedad</Label>
              <Select 
                required 
                onValueChange={(value) => {
                  if (value === 'descanso' && selectedDates.length >= 2) {
                    setIsErrorDialogOpen(false);
                  } else {
                    setNoveltyType(value)
                    setError('')
                    setHasShownLicenseNotification(false)
                  }
                }}
                value={noveltyType}
              >
                <SelectTrigger className="border-green-300 focus:ring-green-500">
                  <SelectValue placeholder="Seleccione el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="descanso">Descanso</SelectItem>
                  <SelectItem value="licencia">Licencia no remunerada</SelectItem>
                  <SelectItem value="audiencia">Audiencia o curso de tránsito</SelectItem>
                  <SelectItem value="cita">Cita médica</SelectItem>
                  <SelectItem value="semanaAM">Semana A.M.</SelectItem>
                  <SelectItem value="semanaPM">Semana P.M.</SelectItem>
                  <SelectItem value="diaAM">Día A.M.</SelectItem>
                  <SelectItem value="diaPM">Día P.M.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-green-700">Fechas de solicitud</Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
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
                <label htmlFor="file" className="flex flex-col items-center justify-center w-full h-24 sm:h-32 border-2 border-green-300 border-dashed rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors duration-300">
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

          <div className="mt-6 sm:mt-8 flex justify-center">
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg w-full sm:w-auto"
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

      <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualizar número de teléfono</DialogTitle>
          </DialogHeader>
          <Input
            type="tel"
            value={newPhoneNumber}
            onChange={(e) => setNewPhoneNumber(e.target.value)}
            placeholder="Ingrese el nuevo número de teléfono"
            className="mt-2"
            ref={phoneInputRef}
          />
          <DialogFooter>
            <Button onClick={() => setIsPhoneDialogOpen(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={updatePhoneNumber} className="bg-green-500 text-white hover:bg-green-600">
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cambio de tipo de solicitud</DialogTitle>
          </DialogHeader>
          <p>Ha seleccionado 2 o más fechas para un descanso. Su solicitud cambiará a Licencia no remunerada. ¿Desea continuar?</p>
          <DialogFooter>
            <Button onClick={() => handleConfirmation(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={() => handleConfirmation(true)} className="bg-green-500 text-white hover:bg-green-600">
              Aceptar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error en la selección</DialogTitle>
          </DialogHeader>
          <p>{error}</p>
        </DialogContent>
      </Dialog>
      <Dialog open={isLicenseNotificationOpen} onOpenChange={setIsLicenseNotificationOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-green-700">Notificación Importante</DialogTitle>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-6"
          >
            <Calendar className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-center text-lg font-semibold mb-4">
              Ha seleccionado 3 o más días para una licencia no remunerada.
            </p>
            <motion.p
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, yoyo: Infinity, repeatDelay: 0.5 }}
              className="text-center text-green-600 font-bold"
            >
              Este requerimiento será evaluado por el coordinador de operaciones.
            </motion.p>
            <p className="text-center mt-4">
              La respuesta a su solicitud se le notificará oportunamente.
            </p>
          </motion.div>
          <DialogFooter>
            <Button 
              onClick={() => setIsLicenseNotificationOpen(false)} 
              className="bg-green-500 text-white hover:bg-green-600 px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

