"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { GraduationCap, Upload, FileText, X, User, Mail, Lock, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface RegisterFormProps {
  onSuccess: () => void
  onSwitchToLogin: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    academicYear: "",
    subjects: "",
    bio: "",
    acceptTerms: false,
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileBase64, setFileBase64] = useState<string>("")
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPEG, or PNG file",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Convert to base64 for storage
    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setFileBase64(base64)
    }
    reader.readAsDataURL(file)
  }

  const removeFile = () => {
    setSelectedFile(null)
    setFileBase64("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.email.endsWith("@imail.sunway.edu.my")) {
      setError("Please use your institutional email (@imail.sunway.edu.my)")
      setLoading(false)
      return
    }

    if (!formData.acceptTerms) {
      setError("Please accept the Terms of Service")
      setLoading(false)
      return
    }

    if (formData.role === "tutor" && !selectedFile) {
      setError("Please upload your qualification document")
      setLoading(false)
      return
    }

    try {
      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: undefined,
        },
      })

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          verified: false,
          academic_year: formData.academicYear || null,
          subjects: formData.role === "tutor" ? formData.subjects.split(",").map((s) => s.trim()) : null,
          bio: formData.bio || null,
          rating: 0,
          total_ratings: 0,
          qualification_document_url: fileBase64 || null,
          qualification_document_name: selectedFile?.name || null,
          qualification_document_type: selectedFile?.type || null,
          qualification_document_size: selectedFile?.size || null,
        })

        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          })
          setLoading(false)
          return
        }

        // Store document record if uploaded
        if (fileBase64 && selectedFile) {
          await supabase.from("documents").insert({
            user_id: data.user.id,
            document_type: "qualification",
            file_name: selectedFile.name,
            file_url: fileBase64,
            file_type: selectedFile.type,
            file_size: selectedFile.size,
          })
        }

        // Manually confirm email
        const { error: confirmError } = await supabase.auth.admin.updateUserById(data.user.id, {
          email_confirm: true,
        })

        if (confirmError) {
          console.log("Email confirmation error:", confirmError)
        }

        // Sign out after registration
        await supabase.auth.signOut()
        setSuccess(true)
      }
    } catch (error) {
      console.error("Registration error:", error)
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <>
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl text-dark-blue-gray">Registration Successful!</DialogTitle>
          <p className="text-blue-gray">Your account has been created and is under review</p>
        </DialogHeader>

        <div className="text-center space-y-4 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Your account is under review by our admin team. You'll receive access once verified. This usually takes
              24-48 hours.
            </p>
          </div>
          <Button className="w-full bg-orange hover:bg-orange text-white" onClick={onSwitchToLogin}>
            Go to Login
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <DialogHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-orange rounded-lg flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
        </div>
        <DialogTitle className="text-2xl text-dark-blue-gray">Join Tutortots</DialogTitle>
        <p className="text-blue-gray">Create your account to get started</p>
      </DialogHeader>

      <div className="space-y-6 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-dark-blue-gray font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                id="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
              />
            </div>
          </div>

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
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-dark-blue-gray font-medium">I am a...</Label>
            <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="border-gray-300 focus:border-orange">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Student
                    </Badge>
                    <span>Looking for tutoring help</span>
                  </div>
                </SelectItem>
                <SelectItem value="tutor">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-orange text-white border-orange">
                      Tutor
                    </Badge>
                    <span>Want to teach others</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === "student" && (
            <div className="space-y-2">
              <Label className="text-dark-blue-gray font-medium">Academic Year</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, academicYear: value })}>
                <SelectTrigger className="border-gray-300 focus:border-orange">
                  <SelectValue placeholder="Select your academic year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Year 1">Year 1</SelectItem>
                  <SelectItem value="Year 2">Year 2</SelectItem>
                  <SelectItem value="Year 3">Year 3</SelectItem>
                  <SelectItem value="Year 4">Year 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.role === "tutor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="subjects" className="text-dark-blue-gray font-medium">
                  Subjects You Teach
                </Label>
                <Input
                  id="subjects"
                  placeholder="e.g., Mathematics, Physics, Chemistry"
                  value={formData.subjects}
                  onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                  required
                  className="border-gray-300 focus:border-orange focus:ring-orange"
                />
                <p className="text-xs text-gray-500">Separate multiple subjects with commas</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-dark-blue-gray font-medium">
                  About You
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell students about your teaching experience..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="border-gray-300 focus:border-orange focus:ring-orange"
                />
              </div>

              {/* Qualification Document Upload */}
              <div className="space-y-2">
                <Label className="text-dark-blue-gray font-medium">Qualification Document *</Label>
                <p className="text-xs text-gray-500">
                  Upload your transcript, certificate, or other proof (PDF, JPEG, PNG - Max 5MB)
                </p>

                {!selectedFile ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-orange hover:underline">Click to upload</span>
                      <span className="text-gray-600"> or drag and drop</span>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="border border-orange rounded-lg p-3 bg-orange bg-opacity-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange rounded flex items-center justify-center">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-dark-blue-gray">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
            <Checkbox
              id="terms"
              checked={formData.acceptTerms}
              onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
              className="mt-1"
            />
            <Label htmlFor="terms" className="text-sm text-blue-gray">
              I agree to the{" "}
              <a href="#" className="text-orange hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-orange hover:underline">
                Privacy Policy
              </a>
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-orange hover:bg-orange text-white" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-blue-gray">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="text-orange hover:underline font-medium">
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </>
  )
}
