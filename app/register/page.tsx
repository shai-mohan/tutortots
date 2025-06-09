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
import { GraduationCap, Upload, FileText, X } from "lucide-react"
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
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
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
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const uploadFile = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploadingFile(true)

      // Create unique filename
      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}/qualification.${fileExt}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage.from("documents").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Upload error:", error)
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        })
        return null
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error("Upload error:", error)
      return null
    } finally {
      setUploadingFile(false)
    }
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
        let documentUrl = null

        // Upload qualification document if tutor
        if (formData.role === "tutor" && selectedFile) {
          documentUrl = await uploadFile(selectedFile, data.user.id)
          if (!documentUrl) {
            setError("Failed to upload qualification document. Please try again.")
            setLoading(false)
            return
          }
        }

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
          qualification_document_url: documentUrl,
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
        if (documentUrl && selectedFile) {
          await supabase.from("documents").insert({
            user_id: data.user.id,
            document_type: "qualification",
            file_name: selectedFile.name,
            file_url: documentUrl,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-green-600 mb-2" />
            <CardTitle className="text-2xl">Registration Successful!</CardTitle>
            <CardDescription>Your account is under review. Please check back later once verified.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button className="w-full">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <GraduationCap className="h-12 w-12 mx-auto text-blue-600 mb-2" />
          <CardTitle className="text-2xl">Join Tutortots</CardTitle>
          <CardDescription>Create your Tutortots account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Institutional Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@imail.sunway.edu.my"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="academicYear">Academic Year</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, academicYear: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select academic year" />
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
                  <Label htmlFor="subjects">Subjects (comma-separated)</Label>
                  <Input
                    id="subjects"
                    placeholder="Mathematics, Physics, Chemistry"
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about your teaching experience..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                {/* Qualification Document Upload */}
                <div className="space-y-2">
                  <Label htmlFor="qualification">Qualification Document *</Label>
                  <p className="text-xs text-gray-600 mb-2">
                    Upload your transcript, certificate, or other proof of qualification (PDF, JPEG, PNG - Max 5MB)
                  </p>

                  {!selectedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <Label htmlFor="file-upload" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">Click to upload</span>
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
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-8 w-8 text-blue-600" />
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) => setFormData({ ...formData, acceptTerms: checked as boolean })}
              />
              <Label htmlFor="terms" className="text-sm">
                I accept the Terms of Service
              </Label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || uploadingFile}>
              {loading ? "Registering..." : uploadingFile ? "Uploading..." : "Register"}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in here
              </Link>
            </p>
            <Link href="/" className="text-sm text-gray-500 hover:underline">
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
