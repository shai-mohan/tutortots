"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Upload, FileText, X, User, Mail, Lock, ArrowLeft, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
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
  const { register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

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
      <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Welcome to Tutortots!</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Your account has been created successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h3 className="font-semibold text-green-800 mb-2">What's Next?</h3>
              <p className="text-green-700 text-sm leading-relaxed">
                Your account is under review by our admin team. You'll receive access once verified. This usually takes
                24-48 hours.
              </p>
            </div>
            <Link href="/login">
              <Button className="w-full h-12 bg-gradient-orange text-white hover:shadow-lg hover:scale-105 transition-all duration-300 btn-glow text-lg font-semibold rounded-xl">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-orange-200 rounded-full opacity-20 animate-float"></div>
      <div
        className="absolute bottom-20 right-20 w-24 h-24 bg-blue-200 rounded-full opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="w-full max-w-lg relative">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-orange-500 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-lg">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-orange rounded-2xl flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Join Tutortots</CardTitle>
            <CardDescription className="text-lg text-gray-600">
              Create your account and start your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Institutional Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@imail.sunway.edu.my"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">I am a...</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Student
                        </Badge>
                        <span>Looking for tutoring help</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="tutor">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
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
                  <Label className="text-sm font-semibold text-gray-700">Academic Year</Label>
                  <Select onValueChange={(value) => setFormData({ ...formData, academicYear: value })}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl">
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
                    <Label htmlFor="subjects" className="text-sm font-semibold text-gray-700">
                      Subjects You Teach
                    </Label>
                    <Input
                      id="subjects"
                      placeholder="e.g., Mathematics, Physics, Chemistry"
                      value={formData.subjects}
                      onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                      required
                      className="h-12 border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300"
                    />
                    <p className="text-xs text-gray-500">Separate multiple subjects with commas</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">
                      About You
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell students about your teaching experience and approach..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="border-2 border-gray-200 focus:border-orange-400 focus:ring-orange-200 rounded-xl transition-all duration-300 min-h-[100px]"
                    />
                  </div>

                  {/* Qualification Document Upload */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Qualification Document *</Label>
                    <p className="text-xs text-gray-600">
                      Upload your transcript, certificate, or other proof of qualification (PDF, JPEG, PNG - Max 5MB)
                    </p>

                    {!selectedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-300 transition-colors bg-gray-50/50">
                        <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-orange-500 hover:text-orange-600 font-semibold">Click to upload</span>
                          <span className="text-gray-600"> or drag and drop</span>
                        </Label>
                        <p className="text-xs text-gray-500 mt-2">PDF, JPEG, PNG up to 5MB</p>
                        <Input
                          id="file-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="border-2 border-orange-200 rounded-xl p-4 bg-orange-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-orange-500 hover:text-orange-600 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-orange-500 hover:text-orange-600 hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>

              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-orange text-white hover:shadow-lg hover:scale-105 transition-all duration-300 btn-glow text-lg font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="text-center pt-6 border-t border-gray-200">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-orange-500 hover:text-orange-600 font-semibold hover:underline transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
