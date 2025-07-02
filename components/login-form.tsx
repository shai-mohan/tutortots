"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Mail, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Get user profile to determine role
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

        if (profile) {
          // Redirect based on role
          if (profile.role === "admin") {
            router.push("/admin")
          } else if (profile.role === "student") {
            router.push("/student")
          } else if (profile.role === "tutor") {
            router.push("/tutor")
          }
        }

        onSuccess?.()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
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
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark-blue-gray font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
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
              <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
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

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-gray">
            Don't have an account?{" "}
            <button onClick={onSwitchToRegister} className="text-orange hover:underline font-medium">
              Sign up here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
