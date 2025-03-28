'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search } from 'lucide-react'

interface User {
  code: string
  name: string
}

interface UserSelectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (user: User) => void
  users: User[]
  currentUser: User
  title: string
}

export function UserSelectDialog({
  open,
  onOpenChange,
  onSelect,
  users,
  currentUser,
  title
}: UserSelectDialogProps) {
  const [search, setSearch] = useState('')
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])

  useEffect(() => {
    // Filter and sort users
    const filtered = users
      .filter(user => 
        user.code.toLowerCase().includes(search.toLowerCase()) ||
        user.name.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => {
        // Put current user first
        if (a.code === currentUser.code) return -1
        if (b.code === currentUser.code) return 1
        // Sort others by code in descending order
        return b.code.localeCompare(a.code)
      })

    setFilteredUsers(filtered)
  }, [search, users, currentUser])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <button
                key={user.code}
                onClick={() => {
                  onSelect(user)
                  onOpenChange(false)
                }}
                className="w-full p-2 text-left hover:bg-accent rounded-md transition-colors flex items-center space-x-2"
              >
                <div>
                  <div className="font-medium">{user.code}</div>
                  <div className="text-sm text-muted-foreground">{user.name}</div>
                </div>
                {user.code === currentUser.code && (
                  <span className="ml-auto text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Actual
                  </span>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

