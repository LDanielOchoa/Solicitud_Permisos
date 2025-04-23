'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User, Lock, CheckCircle } from 'lucide-react'
import LoadingOverlay from '@/components/loading-overlay'
import Image from 'next/image'
import { ErrorModal } from '@/components/error-modal'
import jwt from 'jsonwebtoken'

// JWT Secret - must match the one in your SAO6 application
const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET || 'your_jwt_secret_key_change_in_production'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [tokenProcessing, setTokenProcessing] = useState(false)
  const [tokenMessage, setTokenMessage] = useState('')
  const [tokenVerified, setTokenVerified] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()

  // Check for token on component mount
  useEffect(() => {
    const token = searchParams.get('token')
    
    if (token) {
      verifyToken(token)
    }
  }, [searchParams])

  const verifyToken = async (token: string) => {
    setTokenProcessing(true)
    setTokenMessage('Verificando credenciales...')
    setError('')
    
    try {
      // Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as {
        code: string
        password: string
        origin?: string
        exp?: number
      }
      
      // Check if token has required data
      if (decoded && decoded.code && decoded.password) {
        // Check if token is from the expected origin
        if (decoded.origin !== 'sao6_system') {
          console.warn('Token from unexpected origin:', decoded.origin)
          // Continue anyway, but log the warning
        }
        
        setTokenVerified(true)
        setTokenMessage('Credenciales verificadas. Iniciando sesión automáticamente...')
        
        // Set the credentials from the token
        setCode(decoded.code)
        setPassword(decoded.password)
        
        // Submit the form automatically after a short delay
        setTimeout(() => {
          handleAutoLogin(decoded.code, decoded.password)
        }, 1500)
      } else {
        setError('El enlace de acceso no contiene credenciales válidas.')
        setTokenProcessing(false)
        setTokenMessage('')
      }
    } catch (error) {
      console.error('Error al verificar el token:', error)
      setError('El enlace de acceso ha expirado o no es válido. Por favor, inicie sesión manualmente.')
      setTokenProcessing(false)
      setTokenMessage('')
    }
  }

  const validateCode = (code: string): boolean => {
    if (code.length !== 4) return false;
    const numCode = parseInt(code, 10);
    if (numCode < 10 && code.startsWith('000')) return true;
    if (numCode < 100 && code.startsWith('00')) return true;
    if (numCode < 1000 && code.startsWith('0')) return true;
    if (numCode >= 1000) return true;
    return false;
  }

  const handleAutoLogin = async (userCode: string, userPassword: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('https://solicitud-permisos.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: userCode, password: userPassword }),
      })
      
      const data = await response.json()

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('accessToken', data.access_token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userCode', userCode)
        
        // Also store the origin of the login
        localStorage.setItem('loginOrigin', 'sao6_redirect')
        
        // Redirect based on role
        if (data.role === 'admin' || data.role === 'testers') {
          router.push('/dashboard-admin-requests')
        } else {
          router.push('/dashboard')
        }
      } else {
        setTokenProcessing(false)
        setLoginAttempts(prevAttempts => {
          const newAttempts = prevAttempts + 1
          if (newAttempts >= 3) {
            setShowErrorModal(true)
          }
          return newAttempts
        })
        setError(data.msg || 'Las credenciales proporcionadas no son válidas')
        setIsLoading(false)
      }
    } catch (error) {
      setTokenProcessing(false)
      setError('Ocurrió un error al procesar el inicio de sesión automático. Por favor, intente manualmente.')
      console.error('Error de inicio de sesión automático:', error)
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!validateCode(code)) {
      setError('El código debe tener 4 dígitos. Use ceros a la izquierda si es necesario (ej: 0025, 0125, 1111).')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('https://solicitud-permisos.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, password }),
      })
      
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('accessToken', data.access_token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userCode', code)
        
        if (data.role === 'admin' || data.role === 'testers') {
          router.push('/dashboard-admin-requests')
        } else {
          router.push('/dashboard')
        }
      } else {
        setLoginAttempts(prevAttempts => {
          const newAttempts = prevAttempts + 1
          if (newAttempts >= 3) {
            setShowErrorModal(true)
          }
          return newAttempts
        })
        setError(data.msg || 'Credenciales inválidas')
      }
    } catch (error) {
      setError('Ocurrió un error. Por favor, intente nuevamente.')
      console.error('Error de inicio de sesión:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen from-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Left side - Login Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex justify-center mb-6">
              <Image src="/sao6.png" alt="Logo" width={100} height={100} />
            </div>
            <h2 className="text-3xl font-bold text-green-700 text-center">Sao6</h2>
            <p className="text-green-600 text-center">Inicia sesión en tu cuenta</p>

            {tokenProcessing ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-center space-x-2 text-green-700"
              >
                {tokenVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <div className="animate-spin h-5 w-5 border-2 border-green-500 border-t-transparent rounded-full" />
                )}
                <span>{tokenMessage}</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Label htmlFor="code" className="text-green-700">Código</Label>
                    <div className="relative mt-1">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 h-5 w-5" />
                      <Input
                        id="code"
                        type="text"
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                          setCode(value)
                        }}
                        className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                        placeholder="Ingrese su código (ej: 0025, 0125, 1111)"
                        required
                        maxLength={4}
                      />
                    </div>
                  </div>

                  {code !== 'sao6admin' && (
                    <div className="relative">
                      <Label htmlFor="password" className="text-green-700">Contraseña</Label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 h-5 w-5" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                          placeholder="Ingrese su contraseña"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 hover:text-green-600"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                  </Button>
                </motion.div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </form>
            )}
          </motion.div>
        </div>

        {/* Right side - Welcome Message */}
        <div className="w-full md:w-1/2 bg-green-500 text-white p-12 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">¡Bienvenido!</h2>
            <p className="text-green-100">
              Sistema de gestión integrado para el control y seguimiento de actividades.
            </p>
          </motion.div>
        </div>
      </motion.div>

      {isLoading && <LoadingOverlay />}
      <ErrorModal isOpen={showErrorModal} onClose={() => setShowErrorModal(false)} /> 
    </div>
  )
}
