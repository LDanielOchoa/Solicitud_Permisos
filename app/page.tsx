'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    router.push('https://solicitud-permisos.sao6.com.co/')
  }, [])

  return null
}
