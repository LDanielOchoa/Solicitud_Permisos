'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    window.location.href = 'https://solicitud-permisos.sao6.com.co/'
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirigiendo...</p>
    </div>
  )
}
