"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, AlertCircle, Calendar, Clock, FileText, Tag, CheckCircle, Info } from "lucide-react"
import { format, addDays, isSameDay, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import LoadingOverlay from "../../components/loading-overlay"
import BottomNavigation from "../../components/bottom-navigation"
import UserInfoCard from "@/components/user-info-card"
import { toast } from "@/components/ui/use-toast"

const getCurrentWeekDates = (testDate = null) => {
  const now = testDate || new Date() // Permitir una fecha de prueba o usar la actual
  const currentDay = now.getDay() // 0 (domingo) a 6 (sábado)
  const currentHour = now.getHours()

  // Encuentra el lunes de la próxima semana
  const startOfNextWeek = new Date(now)
  const daysUntilNextMonday = 8 - (currentDay === 0 ? 7 : currentDay)
  startOfNextWeek.setDate(now.getDate() + daysUntilNextMonday)

  // Si es miércoles a las 12 pm o después, avanza otra semana
  if (currentDay > 3 || (currentDay === 3 && currentHour >= 12)) {
    startOfNextWeek.setDate(startOfNextWeek.getDate() + 7)
  }

  return startOfNextWeek
}

const isHoliday = (date: Date): boolean => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  if (month === 0 && day === 1) return true

  return false
}

const checkExistingPermits = async (dates: string[]) => {
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      throw new Error("No se encontró el token de acceso")
    }

    const response = await fetch("https://solicitud-permisos.onrender.com/check-existing-permits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ dates }),
    })

    if (!response.ok) {
      throw new Error("Error al verificar permisos existentes")
    }

    const data = await response.json()
    return data.hasExistingPermit
  } catch (error) {
    console.error("Error:", error)
    return false
  }
}

export default function PermitRequestForm() {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [noveltyType, setNoveltyType] = useState("")
  const [userData, setUserData] = useState({ code: "", name: "", phone: "" })
  const [error, setError] = useState("")
  const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false)
  const [newPhoneNumber, setNewPhoneNumber] = useState("")
  const [isNoveltyTypeDialogOpen, setIsNoveltyTypeDialogOpen] = useState(false)
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false)
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [isLicenseNotificationOpen, setIsLicenseNotificationOpen] = useState(false)
  const [hasShownLicenseNotification, setHasShownLicenseNotification] = useState(false)
  const [weekDates, setWeekDates] = useState<Date[]>([])
  const [showValidationDialog, setShowValidationDialog] = useState(false)
  const [hasNewNotification, setHasNewNotification] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const router = useRouter()
  const phoneInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("accessToken")

        if (!token) {
          router.push("/")
          return
        }

        const response = await fetch("https://solicitud-permisos.onrender.com/auth/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.status === 401) {
          localStorage.removeItem("accessToken")
          router.push("/")
          return
        }

        if (!response.ok) {
          throw new Error("Error al obtener datos del usuario")
        }

        const data = await response.json()
        setUserData({ code: data.code, name: data.name, phone: data.phone || "" })

        // Check for notifications
        const storedNotifications = localStorage.getItem("dashboardNotifications")
        if (storedNotifications) {
          const parsedNotifications = JSON.parse(storedNotifications)
          setHasNewNotification(parsedNotifications.some((n: any) => n.isNew))
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("No se pudieron cargar los datos del usuario. Por favor, inicie sesión nuevamente.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router])

  useEffect(() => {
    const updateDates = () => {
      const startDate = getCurrentWeekDates()
      setWeekDates(Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(startDate, { weekStartsOn: 1 }), i)))
    }

    updateDates() // Initial update
    const timer = setInterval(updateDates, 60000) // Check every minute

    return () => clearInterval(timer)
  }, [])

  // Calculate form progress
  useEffect(() => {
    let progress = 0

    // User data is loaded
    if (userData.code && userData.name && userData.phone) {
      progress += 30
    }

    // Novelty type is selected
    if (noveltyType) {
      progress += 30
    }

    // Dates are selected (if required)
    if (noveltyType === "semanaAM" || noveltyType === "semanaPM" || selectedDates.length > 0) {
      progress += 40
    }

    setFormProgress(progress)
  }, [userData, noveltyType, selectedDates])

  const handlePhoneDoubleClick = () => {
    setIsPhoneDialogOpen(true)
    setNewPhoneNumber(userData.phone)
  }

  const updatePhoneNumber = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No se encontró el token de acceso")
      }

      const response = await fetch("https://solicitud-permisos.onrender.com/update-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: newPhoneNumber }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar el número de teléfono")
      }

      setUserData((prev) => ({ ...prev, phone: newPhoneNumber }))
      setIsPhoneDialogOpen(false)
      setIsSuccess(true)
      setTimeout(() => setIsSuccess(false), 3000)
    } catch (error) {
      console.error("Error:", error)
      setError("Ocurrió un error al actualizar el número de teléfono. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateSelect = (date: Date) => {
    if (noveltyType === "semanaAM" || noveltyType === "semanaPM") {
      return // Do nothing if semana AM or PM is selected
    }

    setSelectedDates((prev) => {
      const isAlreadySelected = prev.some((d) => isSameDay(d, date))
      let newDates

      if (noveltyType === "audiencia" || noveltyType === "cita") {
        newDates = isAlreadySelected ? [] : [date]
      } else {
        newDates = isAlreadySelected ? prev.filter((d) => !isSameDay(d, date)) : [...prev, date]

        if (newDates.length >= 2 && noveltyType === "descanso") {
          setIsConfirmationDialogOpen(true)
        }

        if (noveltyType === "licencia" && newDates.length === 3 && !hasShownLicenseNotification) {
          setIsLicenseNotificationOpen(true)
          setHasShownLicenseNotification(true)
        }
      }

      return newDates
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((selectedDates.length === 0 && noveltyType !== "semanaAM" && noveltyType !== "semanaPM") || !noveltyType) {
      setShowValidationDialog(true)
      return
    }

    // Check for existing permits
    const formattedDates = selectedDates.map((date) => format(date, "yyyy-MM-dd"))
    const hasExistingPermit = await checkExistingPermits(formattedDates)

    if (hasExistingPermit && ["descanso", "cita", "licencia", "audiencia", "diaAM", "diaPM"].includes(noveltyType)) {
      toast({
        title: "Advertencia",
        description: "Ya existe un permiso para la fecha seleccionada. No se puede realizar esta solicitud.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    formData.append("code", userData.code)
    formData.append("name", userData.name)
    formData.append("phone", userData.phone)
    formData.append("dates", JSON.stringify(selectedDates.map((date) => format(date, "yyyy-MM-dd"))))
    formData.append("noveltyType", noveltyType)
    formData.append("time", (e.target as HTMLFormElement).time?.value || "")
    formData.append("description", (e.target as HTMLFormElement).description?.value || "")

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        throw new Error("No se encontró el token de acceso")
      }

      console.log("Sending request to server...")
      const response = await fetch("https://solicitud-permisos.onrender.com/permit-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      console.log("Response status:", response.status)
      const responseData = await response.json()
      console.log("Response data:", responseData)

      if (!response.ok) {
        throw new Error("Error al enviar la solicitud")
      }

      setIsSuccess(true)
      // Resetear el formulario
      const form = e.target as HTMLFormElement
      form.reset()

      setSelectedDates([])
      setNoveltyType("")
      setHasShownLicenseNotification(false)
    } catch (error) {
      console.error("Error:", error)
      setError("Ocurrió un error al enviar la solicitud. Por favor, inténtelo de nuevo.")
    } finally {
      setIsLoading(false)
      // Resetear el éxito después de 5 segundos
      setTimeout(() => setIsSuccess(false), 5000)
    }
  }

  const handleConfirmation = (confirmed: boolean) => {
    if (confirmed) {
      setNoveltyType("licencia")
    } else {
      setSelectedDates((prev) => prev.slice(0, -1))
    }
    setIsConfirmationDialogOpen(false)
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
            <Button onClick={() => router.push("/")} className="bg-green-500 text-white hover:bg-green-600">
              Volver al inicio de sesión
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[url('/pattern-bg.svg')] bg-cover bg-fixed flex flex-col items-center justify-center p-2 sm:p-4 relative overflow-hidden pb-16 md:pb-4">
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 via-white/80 to-green-100/90 backdrop-blur-[2px]"></div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(0, 128, 0, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0, 128, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .calendar-day {
          aspect-ratio: 1/1;
        }
        
        @media (max-width: 640px) {
          .form-container {
            padding: 1.25rem !important;
          }
          
          .form-title {
            font-size: 1.5rem !important;
            margin-bottom: 1rem !important;
          }
          
          .form-spacing > div {
            margin-bottom: 0.75rem !important;
          }
          
          .calendar-grid button {
            padding: 0.5rem !important;
          }
          
          .calendar-grid .date-text {
            font-size: 0.875rem !important;
          }
          
          .success-icon {
            width: 80px !important;
            height: 80px !important;
          }
          
          .success-title {
            font-size: 1.5rem !important;
          }
        }
        
        /* Scrollbar personalizado */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
        
        /* Animaciones */
        @keyframes pulse-soft {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        .animate-pulse-soft {
          animation: pulse-soft 3s ease-in-out infinite;
        }
        
        /* Efectos de hover mejorados */
        .hover-scale {
          transition: transform 0.3s ease;
        }
        
        .hover-scale:hover {
          transform: scale(1.03);
        }
        
        /* Animación de progreso */
        @keyframes progress-fill {
          from { width: 0%; }
          to { width: var(--progress-width); }
        }
        
        .progress-animation {
          animation: progress-fill 1.5s ease-out forwards;
        }
        
        /* Efecto de brillo */
        @keyframes shine {
          0% {
            background-position: -100px;
          }
          40%, 100% {
            background-position: 300px;
          }
        }
        
        .shine-effect {
          background: linear-gradient(to right, 
                      rgba(255,255,255,0) 0%,
                      rgba(255,255,255,0.8) 50%, 
                      rgba(255,255,255,0) 100%);
          background-size: 200px 100%;
          background-repeat: no-repeat;
          animation: shine 2s infinite;
        }
      `}</style>


      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-green-100 overflow-hidden relative z-10 px-2 sm:px-6 md:px-8"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-green-400 to-green-600"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-50 rounded-full opacity-30 transform translate-x-20 -translate-y-20"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-50 rounded-full opacity-30 transform -translate-x-20 translate-y-20"></div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-3 sm:space-y-6 form-container">

          {/* User Info Card */}
          <UserInfoCard
            code={userData.code}
            name={userData.name}
            phone={userData.phone}
            onPhoneEdit={handlePhoneDoubleClick}
          />

          <div className="space-y-3 sm:space-y-6 form-spacing">
            {/* Novelty Type Section */}
            <motion.div
              className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <h3 className="text-green-700 font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Tipo de Solicitud
              </h3>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-between border-green-200 focus:ring-green-500 text-left font-normal bg-white/90 shadow-sm hover:bg-green-50 hover:border-green-400 transition-all duration-300 h-12 rounded-xl group"
                    onClick={() => setIsNoveltyTypeDialogOpen(true)}
                  >
                    <div className="flex items-center">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-1.5 mr-3 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      {noveltyType ? (
                        <span className="font-medium">
                          {noveltyType === "descanso" && "Descanso"}
                          {noveltyType === "licencia" && "Licencia no remunerada"}
                          {noveltyType === "audiencia" && "Audiencia o curso de tránsito"}
                          {noveltyType === "cita" && "Cita médica"}
                          {noveltyType === "semanaAM" && "Semana A.M."}
                          {noveltyType === "semanaPM" && "Semana P.M."}
                          {noveltyType === "diaAM" && "Día A.M."}
                          {noveltyType === "diaPM" && "Día P.M."}
                        </span>
                      ) : (
                        <span className="text-gray-500">Seleccione el tipo de novedad</span>
                      )}
                    </div>
                    <div className="bg-green-50 rounded-full p-1 group-hover:bg-green-100 transition-all duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Calendar Section */}
            <motion.div
              className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h3 className="text-green-700 font-medium mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-600" />
                Fechas de Solicitud
              </h3>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
              >

                {!noveltyType ? (
                  <motion.div
                    className="bg-white/90 p-6 rounded-xl shadow-sm border border-green-100 flex items-center justify-center hover-scale"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center p-6">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-full p-4 inline-block mb-4 shadow-inner">
                        <Calendar className="h-8 w-8 text-green-600 animate-pulse-soft" />
                      </div>
                      <h3 className="text-green-700 font-medium text-lg mb-2">Seleccione primero el tipo de novedad</h3>
                      <p className="text-sm text-gray-500">Para visualizar el calendario de fechas</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="bg-white/90 p-4 rounded-xl shadow-sm border border-green-100 hover:border-green-200 transition-colors duration-300 hover-scale"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="text-center mb-4 relative">
                      <div className="inline-block bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-1.5 rounded-full mb-2 shadow-sm">
                        <h3 className="font-medium">{format(weekDates[0], "MMMM yyyy", { locale: es })}</h3>
                      </div>
                      <p className="text-xs text-green-600 flex items-center justify-center">
                        <Info className="h-3 w-3 mr-1" />
                        Seleccione las fechas para su solicitud
                      </p>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 calendar-grid">
                      {weekDates.map((date, index) => {
                        const isDateSelected = selectedDates.some((d) => isSameDay(d, date))
                        const isDateHoliday = isHoliday(date)
                        const isDisabled = noveltyType === "semanaAM" || noveltyType === "semanaPM"
                        return (
                          <motion.button
                            key={index}
                            type="button"
                            whileHover={{ scale: isDisabled ? 1 : 1.05, y: isDisabled ? 0 : -2 }}
                            whileTap={{ scale: isDisabled ? 1 : 0.95 }}
                            className={`calendar-day p-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                              isDateSelected
                                ? "bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg"
                                : "bg-white hover:bg-green-50 border border-green-200 hover:border-green-300 hover:shadow-md"
                            } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => handleDateSelect(date)}
                            disabled={isDisabled}
                          >
                            {isDateHoliday && (
                              <span className="text-[10px] bg-red-100 text-red-600 font-medium px-2 py-0.5 rounded-full -mt-1 mb-1">
                                Festivo
                              </span>
                            )}
                            <span
                              className={`text-xs font-medium ${isDateSelected ? "text-green-100" : "text-green-600"} date-text`}
                            >
                              {format(date, "EEE", { locale: es })}
                            </span>
                            <span className="text-lg font-bold mt-1">{format(date, "d")}</span>
                            {isDateSelected && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-1 bg-white bg-opacity-30 rounded-full p-0.5"
                              >
                                <CheckCircle className="h-3 w-3" />
                              </motion.div>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                    {selectedDates.length > 0 && (
                      <motion.div
                        className="mt-4 bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200 shadow-inner"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex items-center mb-2">
                          <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-sm text-green-700 font-medium">Fechas seleccionadas:</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedDates.map((date, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                              className="text-xs bg-white text-green-700 px-3 py-1.5 rounded-full border border-green-300 shadow-sm flex items-center hover:bg-green-50 hover:border-green-400 transition-all duration-300"
                            >
                              <Calendar className="h-3 w-3 mr-1 text-green-500" />
                              {format(date, "dd/MM/yyyy", { locale: es })}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                    {(noveltyType === "semanaAM" || noveltyType === "semanaPM") && (
                      <motion.div
                        className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-200 shadow-inner"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                      >
                        <div className="flex items-center">
                          <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
                            <Info className="h-4 w-4 text-blue-600" />
                          </div>
                          <p className="text-sm text-blue-700">
                            No es necesario seleccionar fechas para Semana A.M. o Semana P.M.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>

            {/* Time Section - Only for specific novelty types */}
            {(noveltyType === "cita" || noveltyType === "audiencia") && (
              <motion.div
                className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.4 }}
              >
                <h3 className="text-green-700 font-medium mb-4 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-green-600" />
                  Hora de la Novedad
                </h3>

                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="relative">
                    <Input
                      id="time"
                      type="time"
                      className="pl-10 border-green-200 focus:ring-green-500 bg-white shadow-sm rounded-lg"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500">
                      <Clock className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Description Section */}
            <motion.div
              className="bg-gradient-to-r from-green-50 to-white p-4 rounded-xl border border-green-100 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h3 className="text-green-700 font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-600" />
                Detalles Adicionales
              </h3>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <div className="relative group">
                  <Textarea
                    id="description"
                    placeholder="Ingrese el detalle de tu solicitud"
                    className="min-h-[120px] border-green-200 focus:ring-green-500 bg-white/90 shadow-sm rounded-xl pl-10 pt-8 group-hover:border-green-300 transition-all duration-300"
                  />
                  <div className="absolute left-3 top-3 text-green-500">
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <motion.div
            className="mt-10 flex justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-600 to-green-400 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <Button
                type="submit"
                className="relative bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 px-10 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl w-full sm:w-auto flex items-center justify-center gap-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="bg-white bg-opacity-20 rounded-full p-1"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </motion.div>
                )}
                <span className="relative">
                  {isLoading ? "Enviando solicitud..." : "Enviar Solicitud"}
                  {!isLoading && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-0.5 bg-white"
                      initial={{ width: 0 }}
                      whileHover={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </span>
              </Button>
            </div>
          </motion.div>
        </form>
      </motion.div>

      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 backdrop-blur-sm"
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 border border-green-100 relative overflow-hidden"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-100 rounded-full opacity-20"></div>
              <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-green-100 rounded-full opacity-20"></div>

              <div className="flex flex-col items-center text-center relative z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", damping: 10 }}
                  className="relative mb-6"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg success-icon">
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-white"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </motion.svg>
                  </div>
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-green-200 border-t-transparent"
                    initial={{ rotate: 0 }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  ></motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="w-full"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-green-500 mb-3 success-title">
                    ¡Solicitud Enviada!
                  </h2>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 mb-6 border border-green-200 shadow-inner">
                    <div className="flex items-start mb-3">
                      <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
                        <Info className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-green-800 text-sm">Su solicitud de permiso ha sido enviada correctamente.</p>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-white rounded-full p-1 mr-2 shadow-sm">
                        <Clock className="h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-green-800 text-sm">
                        Recibirá una notificación cuando su solicitud sea procesada.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={() => setIsSuccess(false)}
                        className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 shadow-lg flex items-center gap-2"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Entendido
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All dialogs remain the same - omitted for brevity */}
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
          <p>
            Ha seleccionado 2 o más fechas para un descanso. Su solicitud cambiará a Licencia no remunerada. ¿Desea
            continuar?
          </p>
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
              transition={{ duration: 0.3, yoyo: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
              className="text-center text-green-600 font-bold"
            >
              Este requerimiento será evaluado por el coordinador de operaciones.
            </motion.p>
            <p className="text-center mt-4">La respuesta a su solicitud se le notificará oportunamente.</p>
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

      <Dialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <DialogContent className="bg-white rounded-xl border border-green-100 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-green-700 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
              Error de Validación
            </DialogTitle>
          </DialogHeader>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
            <p className="text-yellow-800 font-medium mb-2">
              Por favor, asegúrese de completar los siguientes campos obligatorios:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {selectedDates.length === 0 && noveltyType !== "semanaAM" && noveltyType !== "semanaPM" && (
                <li className="text-yellow-700">Seleccione al menos una fecha</li>
              )}
              {!noveltyType && <li className="text-yellow-700">Seleccione el tipo de novedad</li>}
            </ul>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setShowValidationDialog(false)}
              className="bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 rounded-full"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNoveltyTypeDialogOpen} onOpenChange={setIsNoveltyTypeDialogOpen}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-green-50 border border-green-100 p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4">
            <DialogTitle className="text-xl text-white flex items-center justify-center">
              <div className="bg-white bg-opacity-20 p-2 rounded-full mr-2">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Seleccione el tipo de novedad
            </DialogTitle>
          </div>
          <div className="grid gap-3 py-4 px-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {[
              { id: "descanso", label: "Descanso", description: "Para un día de descanso", icon: Calendar },
              {
                id: "licencia",
                label: "Licencia no remunerada",
                description: "Solicitud de días sin remuneración",
                icon: Calendar,
              },
              {
                id: "audiencia",
                label: "Audiencia o curso de tránsito",
                description: "Para asistir a audiencias o cursos",
                icon: Calendar,
              },
              { id: "cita", label: "Cita médica", description: "Para asistir a citas médicas", icon: Clock },
              { id: "semanaAM", label: "Semana A.M.", description: "Jornada de mañana toda la semana", icon: Calendar },
              { id: "semanaPM", label: "Semana P.M.", description: "Jornada de tarde toda la semana", icon: Calendar },
              { id: "diaAM", label: "Día A.M.", description: "Jornada de mañana un día específico", icon: Calendar },
              { id: "diaPM", label: "Día P.M.", description: "Jornada de tarde un día específico", icon: Calendar },
            ].map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setNoveltyType(item.id)
                  setError("")
                  setHasShownLicenseNotification(false)
                  if (item.id === "semanaAM" || item.id === "semanaPM") {
                    setSelectedDates([])
                  }
                  setIsNoveltyTypeDialogOpen(false)
                }}
                className={`flex items-center gap-3 p-4 rounded-xl border shadow-sm ${
                  noveltyType === item.id
                    ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-green-600"
                    : "bg-white border-gray-200 hover:bg-green-50 hover:border-green-300"
                } transition-all duration-200 hover-scale`}
              >
                <div
                  className={`rounded-full p-2 ${noveltyType === item.id ? "bg-white bg-opacity-20" : "bg-green-100"}`}
                >
                  <item.icon className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-medium">{item.label}</span>
                  <span className={`text-xs ${noveltyType === item.id ? "text-green-100" : "text-gray-500"}`}>
                    {item.description}
                  </span>
                </div>
                {noveltyType === item.id && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="ml-auto bg-white bg-opacity-20 text-white rounded-full p-1.5"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation hasNewNotification={hasNewNotification} />
    </div>
  )
}
