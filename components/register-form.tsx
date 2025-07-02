"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, User, Mail, Lock, Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
  "Business Studies",
  "Economics",
  "Accounting",
  "English",
  "Psychology",
  "Statistics",
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
    bio: "",
  })
  const [subjects, setSubjects] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSubject = (subject: string) => {
    if (!subjects.includes(subject)) {
      setSubjects([...subjects, subject])
    }
  }

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter((s) => s !== subject))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validation
    if (!formData.email.endsWith("@imail.sunway.edu.my")) {
      toast({
        title: "Invalid email",
        description: "Please use your institutional email (@imail.sunway.edu.my)",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const success = await register({
        ...formData,
        subjects: subjects.length > 0 ? subjects : null,
      })

      if (success) {
        toast({
          title: "Registration successful",
          description: "Your account has been created and is pending approval by an administrator.",
        })
        onSuccess()
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-dark-blue-gray">Join Tutortots</CardTitle>
        <CardDescription className="text-blue-gray">Create your account to get started</CardDescription>
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
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-dark-blue-gray font-medium">
                I am a
              </Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)} required>
                <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-dark-blue-gray font-medium">
              Institutional Email
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
                  placeholder="Create password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10 border-gray-300 focus:border-orange focus:ring-orange"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-blue-gray" />
                  ) : (
                    <Eye className="h-4 w-4 text-blue-gray" />
                  )}
                </Button>
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
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  className="pl-10 pr-10 border-gray-300 focus:border-orange focus:ring-orange"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-blue-gray" />
                  ) : (
                    <Eye className="h-4 w-4 text-blue-gray" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academicYear" className="text-dark-blue-gray font-medium">
              Academic Year
            </Label>
            <Select
              value={formData.academicYear}
              onValueChange={(value) => handleInputChange("academicYear", value)}
              required
            >
              <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                <SelectValue placeholder="Select your academic year" />
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

          {formData.role === "tutor" && (
            <div className="space-y-2">
              <Label className="text-dark-blue-gray font-medium">Subjects You Can Teach</Label>
              <Select onValueChange={addSubject}>
                <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                  <SelectValue placeholder="Add subjects" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.filter((subject) => !subjects.includes(subject)).map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {subjects.map((subject) => (
                    <Badge key={subject} variant="secondary" className="bg-orange/10 text-orange border-orange/20">
                      {subject}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 hover:bg-transparent"
                        onClick={() => removeSubject(subject)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-dark-blue-gray font-medium">
              Bio (Optional)
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className="border-gray-300 focus:border-orange focus:ring-orange resize-none"
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white py-2.5" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-blue-gray">
            Already have an account?{" "}
            <Button variant="link" className="p-0 text-orange hover:text-orange" onClick={onSwitchToLogin}>
              Sign in here
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
