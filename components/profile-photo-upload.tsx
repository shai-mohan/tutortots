"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Upload, Camera, X, User } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProfilePhotoUploadProps {
  userId: string
  userName: string
  currentPhotoUrl?: string
  onPhotoUpdated: (photoUrl: string) => void
}

export function ProfilePhotoUpload({ userId, userName, currentPhotoUrl, onPhotoUpdated }: ProfilePhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)

    try {
      // Convert to base64 for storage
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string

        // Update profile with new photo
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            profile_photo_url: base64,
            profile_photo_name: selectedFile.name,
            profile_photo_type: selectedFile.type,
            profile_photo_size: selectedFile.size,
          })
          .eq("id", userId)

        if (profileError) {
          toast({
            title: "Upload failed",
            description: profileError.message,
            variant: "destructive",
          })
          return
        }

        // Store in profile_photos table
        await supabase.from("profile_photos").insert({
          user_id: userId,
          photo_url: base64,
          photo_name: selectedFile.name,
          photo_type: selectedFile.type,
          photo_size: selectedFile.size,
          is_current: true,
        })

        // Mark previous photos as not current
        await supabase
          .from("profile_photos")
          .update({ is_current: false })
          .eq("user_id", userId)
          .neq("photo_url", base64)

        toast({
          title: "Photo uploaded",
          description: "Your profile photo has been updated successfully",
        })

        onPhotoUpdated(base64)
        setSelectedFile(null)
        setPreviewUrl("")
      }

      reader.readAsDataURL(selectedFile)
    } catch (error) {
      console.error("Error uploading photo:", error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const removePhoto = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          profile_photo_url: null,
          profile_photo_name: null,
          profile_photo_type: null,
          profile_photo_size: null,
        })
        .eq("id", userId)

      if (error) {
        toast({
          title: "Remove failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Mark all photos as not current
      await supabase.from("profile_photos").update({ is_current: false }).eq("user_id", userId)

      toast({
        title: "Photo removed",
        description: "Your profile photo has been removed",
      })

      onPhotoUpdated("")
    } catch (error) {
      console.error("Error removing photo:", error)
      toast({
        title: "Remove failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const cancelSelection = () => {
    setSelectedFile(null)
    setPreviewUrl("")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Photo
        </CardTitle>
        <CardDescription>Upload a profile photo to personalize your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current/Preview Photo */}
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={previewUrl || currentPhotoUrl} alt={userName} />
            <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {(currentPhotoUrl || previewUrl) && !selectedFile && (
            <Button
              variant="outline"
              size="sm"
              onClick={removePhoto}
              className="text-red-600 hover:text-red-700 bg-transparent"
            >
              <X className="h-4 w-4 mr-2" />
              Remove Photo
            </Button>
          )}
        </div>

        {/* Upload Section */}
        {!selectedFile ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-300 transition-colors">
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <span className="text-orange-custom hover:text-orange-600">Click to upload</span>
                <span className="text-gray-600"> or drag and drop</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP up to 2MB</p>
              <input
                id="photo-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-8 w-8" style={{ color: "#FFA500" }} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={cancelSelection}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 bg-orange-600 hover:bg-orange-300"
              >
                {isUploading ? "Uploading..." : "Upload Photo"}
              </Button>
              <Button variant="outline" onClick={cancelSelection} disabled={isUploading}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
