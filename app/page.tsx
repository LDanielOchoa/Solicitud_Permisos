'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import LoadingOverlay from '../components/loading-overlay'

export default function LoginPage() {
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, password }),
      })
      
      const data = await response.json()

      if (response.ok) {
        // Guardar el token de acceso, el rol y el código en localStorage
        localStorage.setItem('accessToken', data.access_token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userCode', code)  // Guardar el código del usuario
        
        // Redirigir según el rol
        if (data.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/dashboard')
        }
      } else {
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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white bg-opacity-40 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden relative z-10"
      >
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <motion.h1
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-4xl font-bold text-green-700 text-center mb-8"
          >
            Iniciar Sesión
          </motion.h1>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-green-700">Código</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingrese su código"
                className="border-green-300 focus:ring-green-500"
                required
              />
            </div>
            {code !== 'sao6admin' && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-700">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="border-green-300 focus:ring-green-500"
                  required
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-green-500 text-white hover:bg-green-600 px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
          </Button>
          
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        </form>
      </motion.div>

      {isLoading && <LoadingOverlay />}
    </div>
  )
}

