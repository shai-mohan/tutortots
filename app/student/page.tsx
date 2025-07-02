"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Calendar, User, LogOut } from "lucide-react"
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
  availability?: string[]
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/login")
      return
    }

    // Load tutors from Supabase
    const fetchTutors = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("role", "tutor").eq("verified", true)

        if (error) {
          console.error("Error fetching tutors:", error)
          return
        }

        // Fetch all feedback to calculate real ratings
        const { data: allFeedback, error: feedbackError } = await supabase.from("feedback").select(`
        rating,
        sessions!inner (
          tutor_id
        )
      `)

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError)
        }

        // Calculate ratings for each tutor
        const tutorRatings: Record<string, { averageRating: number; totalRatings: number }> = {}

        if (allFeedback) {
          // Group feedback by tutor
          const feedbackByTutor: Record<string, number[]> = {}

          allFeedback.forEach((feedback) => {
            const tutorId = feedback.sessions.tutor_id
            if (feedback.rating) {
              if (!feedbackByTutor[tutorId]) {
                feedbackByTutor[tutorId] = []
              }
              feedbackByTutor[tutorId].push(feedback.rating)
            }
          })

          // Calculate averages
          Object.keys(feedbackByTutor).forEach((tutorId) => {
            const ratings = feedbackByTutor[tutorId]
            const totalRatings = ratings.length
            const averageRating = totalRatings > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / totalRatings : 0

            tutorRatings[tutorId] = { averageRating, totalRatings }
          })
        }

        const formattedTutors = data.map((tutor) => {
          const tutorStats = tutorRatings[tutor.id] || { averageRating: 0, totalRatings: 0 }

          return {
            id: tutor.id,
            name: tutor.name,
            email: tutor.email,
            subjects: tutor.subjects || [],
            bio: tutor.bio || "",
            rating: tutorStats.averageRating,
            totalRatings: tutorStats.totalRatings,
          }
        })

        setTutors(formattedTutors)
      } catch (error) {
        console.error("Error fetching tutors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()

    // Set up real-time subscription for tutor updates
    const subscription = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: "role=eq.tutor",
        },
        () => {
          fetchTutors()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, router])

  const filteredTutors = tutors.filter((tutor) => {
    const matchesSearch =
      tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tutor.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRating = !ratingFilter || tutor.rating >= Number.parseInt(ratingFilter)
    return matchesSearch && matchesRating
  })

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Link href="/student/profile">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </Link>
            <Link href="/student/calendar">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Find Tutors</h2>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by subject or tutor name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select onValueChange={setRatingFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ratings</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="3">3+ stars</SelectItem>
                <SelectItem value="2">2+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading tutors...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{tutor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{tutor.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {tutor.rating.toFixed(1)} ({tutor.totalRatings} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Subjects:</p>
                      <div className="flex flex-wrap gap-1">
                        {tutor.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
                    <Link href={`/student/tutor/${tutor.id}`}>
                      <Button className="w-full">View Details & Book</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredTutors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tutors found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}
