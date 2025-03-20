"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import LoadingOverlay from "@/components/loading-overlay";
import Image from "next/image";
import { ErrorModal } from "@/components/error-modal";

function LoginPage() {
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar si hay parámetros de autenticación en la URL
  useEffect(() => {
    const urlCode = searchParams?.get("code");
    const urlPassword = searchParams?.get("password");

    if (urlCode && urlPassword) {
      // Si hay credenciales en la URL, establecerlas y enviar el formulario automáticamente
      setCode(urlCode);
      setPassword(urlPassword);

      // Pequeño retraso para asegurar que los estados se actualicen
      setTimeout(() => {
        const form = document.querySelector("form");
        if (form) {
          form.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }
      }, 500);
    }
  }, [searchParams]);

  const validateCode = (code: string): boolean => {
    if (code.length !== 4) return false;
    const numCode = Number.parseInt(code, 10);
    if (numCode < 10 && code.startsWith("000")) return true;
    if (numCode < 100 && code.startsWith("00")) return true;
    if (numCode < 1000 && code.startsWith("0")) return true;
    if (numCode >= 1000) return true;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateCode(code)) {
      setError("El código debe tener 4 dígitos. Use ceros a la izquierda si es necesario (ej: 0025, 0125, 1111).");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      fetch("https://solicitud-permisos.onrender.com/auth/user", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        if (!response.ok) throw new Error("No autorizado");
        return response.json();
      })
      .then(data => console.log("Usuario:", data))
      .catch(error => console.error("Error:", error));



      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("accessToken", data.access_token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userCode", code);

        if (data.role === "admin" || data.role === "testers") {
          router.push("/dashboard-admin-requests");
        } else {
          router.push("/dashboard");
        }
      } else {
        setLoginAttempts((prevAttempts) => {
          const newAttempts = prevAttempts + 1;
          if (newAttempts >= 3) {
            setShowErrorModal(true);
          }
          return newAttempts;
        });
        setError(data.msg || "Credenciales inválidas");
      }
    } catch (error) {
      setError("Ocurrió un error. Por favor, intente nuevamente.");
      console.error("Error de inicio de sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen from-green-50 flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10"
      >
        {/* Lado izquierdo - Formulario de inicio de sesión */}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Label htmlFor="code" className="text-green-700">
                    Código
                  </Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 h-5 w-5" />
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setCode(value);
                      }}
                      className="pl-10 border-green-300 focus:border-green-500 focus:ring-green-500"
                      placeholder="Ingrese su código (ej: 0025, 0125, 1111)"
                      required
                      maxLength={4}
                    />
                  </div>
                </div>

                {code !== "sao6admin" && (
                  <div className="relative">
                    <Label htmlFor="password" className="text-green-700">
                      Contraseña
                    </Label>
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
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Button
                  type="submit"
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
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
          </motion.div>
        </div>

        {/* Lado derecho - Mensaje de bienvenida */}
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
  );
}

// Componente wrapper que envuelve LoginPage en un Suspense para evitar el error con useSearchParams
export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <LoginPage />
    </Suspense>
  );
}
