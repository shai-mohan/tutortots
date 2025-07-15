"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Eye, EyeOff, Mail, Lock, Loader2 } from "lucide-react"

interface LoginFormProps {
  onSuccess: () => void
  onSwitchToRegister: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const email = `${username}@imail.sunway.edu.my`
    try {
      const success = await login(email, password)
      if (success) {
        onSuccess()
      }
    } catch (error) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold text-dark-blue-gray">Welcome Back</CardTitle>
        <CardDescription className="text-blue-gray">Sign in to your Tutortots account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-dark-blue-gray font-medium">
              Email
            </Label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
              <Input
                id="username"
                type="text"
                placeholder="your.email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange pr-36"
                required
                autoComplete="username"
              />
              <span className="absolute right-4 text-blue-gray select-none pointer-events-none">
                @imail.sunway.edu.my
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-dark-blue-gray font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 border-gray-300 focus:border-orange focus:ring-orange"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-blue-gray hover:text-orange"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white py-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-blue-gray hover:text-orange text-sm transition-colors"
            >
              Don't have an account? <span className="font-medium">Sign up</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
