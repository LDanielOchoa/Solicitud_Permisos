export type Request = {
    id: string
    code: string
    name: string
    type: string
    status: string
    createdAt: string
    description?: string
    noveltyType?: string
    telefono?: string
    fecha?: string
    hora?: string
    files?: string
    respuesta?: string
  }
  
  export type Stats = {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  
  