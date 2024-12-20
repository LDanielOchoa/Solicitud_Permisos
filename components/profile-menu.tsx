'use client'

import { useState } from 'react'
import { User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from 'framer-motion'

interface ProfileMenuProps {
  code: string
  name: string
  phone: string | null
  onPhoneUpdate: (newPhone: string) => Promise<void>
}

export default function ProfileMenu({ code, name, phone, onPhoneUpdate }: ProfileMenuProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newPhone, setNewPhone] = useState(phone || '')
  const [isLoading, setIsLoading] = useState(false)

  const handlePhoneUpdate = async () => {
    try {
      setIsLoading(true)
      await onPhoneUpdate(newPhone)
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating phone:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700 hover:bg-green-100">
            <User size={24} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 md:w-64">
          <DropdownMenuLabel>Mi Perfil</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="flex flex-col items-start">
            <span className="text-sm font-medium">Código</span>
            <span className="text-sm text-muted-foreground">{code}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex flex-col items-start">
            <span className="text-sm font-medium">Nombre</span>
            <span className="text-sm text-muted-foreground">{name}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsEditing(true)}>
            <div className="flex flex-col items-start w-full">
              <span className="text-sm font-medium">Teléfono</span>
              <span className="text-sm text-muted-foreground">{phone || 'No registrado'}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AnimatePresence>
        {isEditing && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogContent className="sm:max-w-[425px] bg-green-50 border-green-200">
                <DialogHeader>
                  <DialogTitle className="text-green-700">Actualizar teléfono</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Ingrese su teléfono"
                    type="tel"
                    className="border-green-300 focus:ring-green-500"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handlePhoneUpdate}
                      disabled={isLoading}
                      className="bg-green-600 text-white hover:bg-green-700"
                    >
                      {isLoading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </motion.div>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
}

