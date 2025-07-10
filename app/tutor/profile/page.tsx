"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProfilePhotoUpload } from "@/components/profile-photo-upload"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, User, Save, Star } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function TutorProfile() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subjects: "",
    bio: "",
  })
  const [profilePhoto, setProfilePhoto] = useState("")

  // Add this state for feedback stats
  const [feedbackStats, setFeedbackStats] = useState({
    averageRating: 0,
    totalRatings: 0,
  })

  // Replace the useEffect with this updated version that fetches real feedback data
  useEffect(() => {
    if (!user || user.role !== "tutor") {
      router.push("/")
      return
    }

    // Fetch real feedback statistics
    const fetchFeedbackStats = async () => {
      try {
        const { data: feedbackData, error } = await supabase
          .from("feedback")
          .select(`
          rating,
          sessions!inner (
            tutor_id
          )
        `)
          .eq("sessions.tutor_id", user.id)

        if (!error && feedbackData) {
          const ratingsOnly = feedbackData.filter((f) => f.rating !== null).map((f) => f.rating!)
          const totalRatings = ratingsOnly.length
          const averageRating =
            totalRatings > 0 ? ratingsOnly.reduce((sum, rating) => sum + rating, 0) / totalRatings : 0

          setFeedbackStats({
            averageRating,
            totalRatings,
          })
        }
      } catch (error) {
        console.error("Error fetching feedback stats:", error)
      }
    }

    fetchFeedbackStats()

    setFormData({
      name: user.name,
      email: user.email,
      subjects: user.subjects?.join(", ") || "",
      bio: user.bio || "",
    })

    setProfilePhoto(user.profileImage || "")
  }, [user, router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedData = {
      ...formData,
      subjects: formData.subjects
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s),
    }
    updateUser(updatedData)
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully",
    })
  }

  const handlePhotoUpdated = (photoUrl: string) => {
    setProfilePhoto(photoUrl)
    // Update user context with new photo
    updateUser({ profileImage: photoUrl })
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tutor">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Profile Photo Upload */}
          <ProfilePhotoUpload
            userId={user.id}
            userName={user.name}
            currentPhotoUrl={profilePhoto}
            onPhotoUpdated={handlePhotoUpdated}
          />

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tutor Profile
              </CardTitle>
              <CardDescription>Manage your profile information and teaching details</CardDescription>
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
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

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
                    placeholder="Tell students about your teaching experience and approach..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Rating & Reviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <div className="text-3xl font-bold text-yellow-600">{feedbackStats.averageRating.toFixed(1)}</div>
                <div className="flex justify-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(feedbackStats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">Based on {feedbackStats.totalRatings} reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
