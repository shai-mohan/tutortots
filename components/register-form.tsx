"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Mail, Lock, GraduationCap, Phone } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    phone: "",
    studentId: "",
    subjects: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
          },
        },
      })

      if (signUpError) {
        setError(signUpError.message)
        return
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: formData.fullName,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          student_id: formData.studentId,
          subjects: formData.role === "tutor" ? formData.subjects : null,
        })

        if (profileError) {
          setError("Failed to create profile")
          return
        }

        // Redirect based on role
        if (formData.role === "student") {
          router.push("/student")
        } else if (formData.role === "tutor") {
          router.push("/tutor")
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
        <CardTitle className="text-2xl font-bold text-dark-blue-gray">Join Tutortots</CardTitle>
        <CardDescription className="text-blue-gray">Create your account to start learning</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-dark-blue-gray font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                />
              </div>
            </div>

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
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-dark-blue-gray font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-dark-blue-gray font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  required
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-dark-blue-gray font-medium">
                I am a
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-dark-blue-gray font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentId" className="text-dark-blue-gray font-medium">
              Student ID
            </Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
              <Input
                id="studentId"
                placeholder="Enter your Sunway student ID"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                required
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
              />
            </div>
          </div>

          {formData.role === "tutor" && (
            <div className="space-y-2">
              <Label htmlFor="subjects" className="text-dark-blue-gray font-medium">
                Subjects You Can Teach
              </Label>
              <Input
                id="subjects"
                placeholder="e.g., Mathematics, Physics, Chemistry"
                value={formData.subjects}
                onChange={(e) => handleInputChange("subjects", e.target.value)}
                className="border-gray-300 focus:border-orange focus:ring-orange"
              />
            </div>
          )}

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-gray">
            Already have an account?{" "}
            <button onClick={onSwitchToLogin} className="text-orange hover:underline font-medium">
              Sign in here
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
