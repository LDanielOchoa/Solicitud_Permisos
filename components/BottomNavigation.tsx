"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, FileText, Briefcase, List, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface BottomNavigationProps {
  hasNewNotification?: boolean
}

export function BottomNavigation({ hasNewNotification = false }: BottomNavigationProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const navItems = [
    {
      icon: Home,
      label: "Inicio",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      icon: FileText,
      label: "Permisos",
      href: "/solicitud-permisos",
      active: pathname === "/solicitud-permisos",
    },
    {
      icon: Briefcase,
      label: "Postulaciones",
      href: "/solicitud-equipo",
      active: pathname === "/solicitud-equipo",
    },
    {
      icon: List,
      label: "Solicitudes",
      href: "/solicitudes-global",
      active: pathname === "/solicitudes-global",
      badge: hasNewNotification,
    },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-green-100 py-2 px-4 md:hidden z-40">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <Link href={item.href} key={item.label} className="flex flex-col items-center relative">
              <motion.div
                initial={false}
                animate={item.active ? { y: -5 } : { y: 0 }}
                className={`p-2 rounded-full ${
                  item.active ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md" : "bg-transparent"
                } transition-colors duration-300`}
              >
                <item.icon className={`h-5 w-5 ${!item.active && "text-gray-500"}`} />
                {item.badge && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-2 w-2 p-0 rounded-full" />
                )}
              </motion.div>
              <span className={`text-xs ${item.active ? "text-emerald-800 font-medium" : "text-gray-500"}`}>
                {item.label}
              </span>
              {item.active && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -bottom-2 w-12 h-1 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md border border-green-100 rounded-full shadow-lg py-2 px-6 z-40">
        <div className="flex items-center space-x-1">
          {navItems.map((item) => (
            <Link href={item.href} key={item.label} className="relative px-4 py-2 group">
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={false}
                  animate={item.active ? { scale: 1.1 } : { scale: 1 }}
                  className={`p-2 rounded-full ${
                    item.active
                      ? "bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md"
                      : "bg-transparent group-hover:bg-green-50"
                  } transition-all duration-300`}
                >
                  <item.icon className={`h-5 w-5 ${!item.active && "text-gray-500 group-hover:text-emerald-600"}`} />
                  {item.badge && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white h-2 w-2 p-0 rounded-full" />
                  )}
                </motion.div>
                <span
                  className={`text-sm ${item.active ? "text-emerald-800 font-medium" : "text-gray-500 group-hover:text-emerald-600"}`}
                >
                  {item.label}
                </span>
              </div>
              {item.active && (
                <motion.div
                  layoutId="desktopNavIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-green-500"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
