"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import { User, Mail, Lock, Eye, EyeOff, Loader2, GraduationCap } from "lucide-react"

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Engineering",
  "Business",
  "Economics",
  "Accounting",
  "Psychology",
  "English",
  "History",
  "Geography",
  "Art & Design",
  "Music",
]

const ACADEMIC_YEARS = ["Foundation", "Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"]

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    academicYear: "",
    subjects: [] as string[],
    bio: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const { register } = useAuth()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.email.endsWith("@imail.sunway.edu.my")) {
      setError("Please use your institutional email (@imail.sunway.edu.my)")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (formData.role === "tutor" && formData.subjects.length === 0) {
      setError("Please select at least one subject you can tutor")
      return
    }

    setIsLoading(true)

    try {
      const success = await register(formData)
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
        <CardTitle className="text-2xl font-bold text-dark-blue-gray">Join Tutortots</CardTitle>
        <CardDescription className="text-blue-gray">Create your account to start learning</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-dark-blue-gray font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                  required
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
                  placeholder="your.email@imail.sunway.edu.my"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                  required
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
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-dark-blue-gray font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10 border-gray-300 focus:border-orange focus:ring-orange"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-blue-gray hover:text-orange"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-dark-blue-gray font-medium">Role</Label>
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
              <Label className="text-dark-blue-gray font-medium">Academic Year</Label>
              <Select value={formData.academicYear} onValueChange={(value) => handleInputChange("academicYear", value)}>
                <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent>
                  {ACADEMIC_YEARS.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.role === "tutor" && (
            <div className="space-y-2">
              <Label className="text-dark-blue-gray font-medium">Subjects You Can Tutor</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
                {SUBJECTS.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={formData.subjects.includes(subject)}
                      onCheckedChange={() => handleSubjectToggle(subject)}
                      className="border-gray-300"
                    />
                    <Label htmlFor={subject} className="text-sm text-blue-gray cursor-pointer">
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {formData.role === "tutor" && (
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-dark-blue-gray font-medium">
                Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your tutoring experience..."
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="border-gray-300 focus:border-orange focus:ring-orange"
                rows={3}
              />
            </div>
          )}

          {error && <div className="text-red-500 text-sm text-center">{error}</div>}

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white py-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <GraduationCap className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-gray hover:text-orange text-sm transition-colors"
            >
              Already have an account? <span className="font-medium">Sign in</span>
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
