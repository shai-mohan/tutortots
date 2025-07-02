"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Star, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Tutor {
  id: string
  name: string
  email: string
  subjects: string[]
  bio: string
  rating: number
  totalRatings: number
  profilePhotoUrl?: string
}

interface Session {
  id: string
  tutorId: string
  studentId: string
  subject: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  zoomLink?: string
}

export default function TutorDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/login")
      return
    }

    // Load tutor details from Supabase
    const fetchTutor = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", params.id)
          .eq("role", "tutor")
          .eq("verified", true)
          .single()

        if (error || !data) {
          console.error("Error fetching tutor:", error)
          router.push("/student")
          return
        }

        // Fetch real feedback data for this tutor
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select(`
        rating,
        sessions!inner (
          tutor_id
        )
      `)
          .eq("sessions.tutor_id", params.id)

        let averageRating = 0
        let totalRatings = 0

        if (!feedbackError && feedbackData) {
          const ratingsOnly = feedbackData.filter((f) => f.rating !== null).map((f) => f.rating!)
          totalRatings = ratingsOnly.length
          averageRating = totalRatings > 0 ? ratingsOnly.reduce((sum, rating) => sum + rating, 0) / totalRatings : 0
        }

        setTutor({
          id: data.id,
          name: data.name,
          email: data.email,
          subjects: data.subjects || [],
          bio: data.bio || "",
          rating: averageRating,
          totalRatings: totalRatings,
          profilePhotoUrl: data.profile_photo_url,
        })
      } catch (error) {
        console.error("Error fetching tutor:", error)
        router.push("/student")
      } finally {
        setLoading(false)
      }
    }

    fetchTutor()
  }, [user, router, params.id])

  const handleBookSession = async () => {
    if (!selectedSubject || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select subject, date, and time",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          tutor_id: tutor!.id,
          student_id: user!.id,
          subject: selectedSubject,
          date: selectedDate,
          time: selectedTime,
          status: "scheduled",
        })
        .select()

      if (error) {
        toast({
          title: "Booking Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Session Booked!",
        description: "Your tutoring session has been scheduled successfully.",
      })

      router.push("/student/calendar")
    } catch (error) {
      console.error("Error booking session:", error)
      toast({
        title: "Booking Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  if (!tutor && !loading) return null

  // Generate available time slots (simplified)
  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i + 1)
    return date.toISOString().split("T")[0]
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/student">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tutor details...</p>
          </div>
        ) : (
          tutor && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                        <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                          {tutor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl">{tutor.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-medium">{tutor.rating.toFixed(1)}</span>
                          <span className="text-gray-600">({tutor.totalRatings} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-sm px-3 py-1">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">About</h3>
                      <p className="text-gray-700 leading-relaxed">{tutor.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Book a Session
                    </CardTitle>
                    <CardDescription>Select your preferred subject, date, and time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject</label>
                      <Select onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {tutor.subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Date</label>
                      <Select onValueChange={setSelectedDate}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose date" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableDates.map((date) => (
                            <SelectItem key={date} value={date}>
                              {new Date(date).toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "short",
                                day: "numeric",
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Time</label>
                      <Select onValueChange={setSelectedTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose time" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button onClick={handleBookSession} className="w-full">
                      Book Session
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  )
}
