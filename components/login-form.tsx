"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GraduationCap, Mail, Lock } from "lucide-react"

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!email.endsWith("@imail.sunway.edu.my")) {
      setError("Please use your institutional email (@imail.sunway.edu.my)")
      setLoading(false)
      return
    }

    const success = await login(email, password)
    if (success) {
      onSuccess()
      router.push("/")
    } else {
      setError("Invalid credentials or account not verified")
    }
    setLoading(false)
  }

  return (
    <>
      <DialogHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
        </div>
        <DialogTitle className="text-2xl text-dark-blue-gray">Welcome Back</DialogTitle>
        <p className="text-blue-gray">Sign in to your Tutortots account</p>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark-blue-gray font-medium">
              Institutional Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="email"
                type="email"
                placeholder="your.name@imail.sunway.edu.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-dark-blue-gray font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="text-center space-y-4 pt-4 border-t border-gray-200">
          <p className="text-blue-gray">
            Don't have an account?{" "}
            <button type="button" onClick={onSwitchToRegister} className="text-orange hover:underline font-medium">
              Create one here
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
