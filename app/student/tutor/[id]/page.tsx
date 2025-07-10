"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Star, ArrowLeft, Calendar, Repeat, CalendarDays } from "lucide-react"
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

interface Availability {
  id: string
  subject: string
  availability_type: "recurring" | "specific_date"
  day_of_week?: number
  specific_date?: string
  start_time: string
  end_time: string
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export default function TutorDetailsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedAvailability, setSelectedAvailability] = useState("")
  const [availabilityType, setAvailabilityType] = useState<"recurring" | "specific_date">("recurring")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
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

        // Fetch tutor availability
        const { data: availabilityData, error: availabilityError } = await supabase
          .from("tutor_availability")
          .select("*")
          .eq("tutor_id", params.id)
          .eq("is_active", true)
          .order("availability_type")
          .order("day_of_week")
          .order("specific_date")
          .order("start_time")

        if (!availabilityError && availabilityData) {
          setAvailability(availabilityData)
        }
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
    if (!selectedSubject || !selectedAvailability) {
      toast({
        title: "Missing Information",
        description: "Please select subject and time slot",
        variant: "destructive",
      })
      return
    }

    const availabilitySlot = availability.find((a) => a.id === selectedAvailability)
    if (!availabilitySlot) {
      toast({
        title: "Invalid Selection",
        description: "Please select a valid time slot",
        variant: "destructive",
      })
      return
    }

    let sessionDate: Date

    if (availabilitySlot.availability_type === "specific_date") {
      sessionDate = new Date(availabilitySlot.specific_date!)
    } else {
      // Calculate next occurrence of the selected day for recurring availability
      const today = new Date()
      const targetDay = availabilitySlot.day_of_week!
      const daysUntilTarget = (targetDay - today.getDay() + 7) % 7
      sessionDate = new Date(today)
      sessionDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget))
    }

    try {
      const { data, error } = await supabase
        .from("sessions")
        .insert({
          tutor_id: tutor!.id,
          student_id: user!.id,
          subject: selectedSubject,
          date: sessionDate.toISOString().split("T")[0],
          time: availabilitySlot.start_time,
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

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAvailableSlots = () => {
    if (!selectedSubject) return []
    return availability.filter((a) => a.subject === selectedSubject && a.availability_type === availabilityType)
  }

  const getRecurringSlots = () => {
    return availability.filter((a) => a.subject === selectedSubject && a.availability_type === "recurring")
  }

  const getSpecificDateSlots = () => {
    return availability.filter((a) => a.subject === selectedSubject && a.availability_type === "specific_date")
  }

  if (!tutor && !loading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/student">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-gray">Loading tutor details...</p>
          </div>
        ) : (
          tutor && (
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-20 w-20">
                        <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                        <AvatarFallback className="text-2xl bg-orange text-white">
                          {tutor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-2xl text-dark-blue-gray">{tutor.name}</CardTitle>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-lg font-medium text-dark-blue-gray">{tutor.rating.toFixed(1)}</span>
                          <span className="text-blue-gray">({tutor.totalRatings} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-dark-blue-gray">Subjects</h3>
                      <div className="flex flex-wrap gap-2">
                        {tutor.subjects.map((subject) => (
                          <Badge
                            key={subject}
                            variant="secondary"
                            className="text-sm px-3 py-1 bg-orange/10 text-orange border-orange/20"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3 text-dark-blue-gray">About</h3>
                      <p className="text-blue-gray leading-relaxed">{tutor.bio}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-gray-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                      <Calendar className="h-5 w-5 text-orange" />
                      Book a Session
                    </CardTitle>
                    <CardDescription className="text-blue-gray">Select your preferred subject and time</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block text-dark-blue-gray">Subject</label>
                      <Select onValueChange={setSelectedSubject} value={selectedSubject}>
                        <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
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

                    {selectedSubject && (
                      <Tabs
                        value={availabilityType}
                        onValueChange={(value: "recurring" | "specific_date") => {
                          setAvailabilityType(value)
                          setSelectedAvailability("")
                        }}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="recurring" className="text-xs">
                            <Repeat className="h-3 w-3 mr-1" />
                            Weekly
                          </TabsTrigger>
                          <TabsTrigger value="specific_date" className="text-xs">
                            <CalendarDays className="h-3 w-3 mr-1" />
                            Specific
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="recurring" className="mt-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block text-dark-blue-gray">
                              Recurring Weekly Times
                            </label>
                            <Select onValueChange={setSelectedAvailability} value={selectedAvailability}>
                              <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                                <SelectValue placeholder="Choose weekly time slot" />
                              </SelectTrigger>
                              <SelectContent>
                                {getRecurringSlots().map((slot) => (
                                  <SelectItem key={slot.id} value={slot.id}>
                                    <div className="flex items-center gap-2">
                                      <Repeat className="h-3 w-3" />
                                      {DAYS_OF_WEEK[slot.day_of_week!]} - {formatTime(slot.start_time)} to{" "}
                                      {formatTime(slot.end_time)}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getRecurringSlots().length === 0 && (
                              <p className="text-sm text-blue-gray mt-2">
                                No recurring weekly times available for this subject.
                              </p>
                            )}
                          </div>
                        </TabsContent>

                        <TabsContent value="specific_date" className="mt-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block text-dark-blue-gray">
                              Specific Date Times
                            </label>
                            <Select onValueChange={setSelectedAvailability} value={selectedAvailability}>
                              <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                                <SelectValue placeholder="Choose specific date" />
                              </SelectTrigger>
                              <SelectContent>
                                {getSpecificDateSlots().map((slot) => (
                                  <SelectItem key={slot.id} value={slot.id}>
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="h-3 w-3" />
                                      <div className="text-left">
                                        <div>{formatDate(slot.specific_date!)}</div>
                                        <div className="text-xs text-gray-500">
                                          {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {getSpecificDateSlots().length === 0 && (
                              <p className="text-sm text-blue-gray mt-2">
                                No specific dates available for this subject.
                              </p>
                            )}
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}

                    <Button
                      onClick={handleBookSession}
                      className="w-full bg-orange hover:bg-orange text-white"
                      disabled={!selectedSubject || !selectedAvailability}
                    >
                      Book Session
                    </Button>

                    {selectedSubject && getRecurringSlots().length === 0 && getSpecificDateSlots().length === 0 && (
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-blue-gray">
                          No availability set for this subject. Please contact the tutor directly.
                        </p>
                      </div>
                    )}
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
