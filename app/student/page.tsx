"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Calendar, User, LogOut, BookOpen, Filter } from "lucide-react"
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
            profilePhotoUrl: tutor.profile_photo_url,
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
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark-blue-gray">Student Dashboard</h1>
              <p className="text-sm text-blue-gray">Find and book sessions with expert tutors</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-blue-gray">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-orange text-white text-xs">{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>Welcome, {user.name}</span>
              </div>
              <Link href="/student/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/student/calendar">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-dark-blue-gray mb-4">Find Your Perfect Tutor</h2>
            <p className="text-lg text-blue-gray">Connect with expert tutors who can help you excel in your studies</p>
          </div>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by subject or tutor name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <Select onValueChange={setRatingFilter}>
                    <SelectTrigger className="border-gray-300 focus:border-orange">
                      <Filter className="h-4 w-4 mr-2" />
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
            </CardContent>
          </Card>
        </div>

        {/* Tutors Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-blue-gray">Loading tutors...</div>
          </div>
        ) : (
          <>
            {filteredTutors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <Card key={tutor.id} className="card-clean hover-lift">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                          <AvatarFallback className="bg-orange text-white">{tutor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-lg text-dark-blue-gray">{tutor.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-blue-gray">{tutor.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({tutor.totalRatings} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-orange" />
                          <span className="text-sm font-medium text-dark-blue-gray">Subjects:</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tutor.subjects.slice(0, 3).map((subject) => (
                            <Badge key={subject} variant="secondary" className="text-xs bg-gray-100 text-blue-gray">
                              {subject}
                            </Badge>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <Badge variant="outline" className="text-xs text-gray-500">
                              +{tutor.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-blue-gray line-clamp-2">{tutor.bio}</p>

                      <Link href={`/student/tutor/${tutor.id}`}>
                        <Button className="w-full bg-orange hover:bg-orange text-white">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Details & Book
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="text-center py-12">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-dark-blue-gray mb-2">No tutors found</h3>
                  <p className="text-blue-gray mb-4">
                    Try adjusting your search criteria or browse all available tutors
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setRatingFilter("")
                    }}
                    variant="outline"
                    className="border-orange text-orange hover:bg-orange hover:text-white"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  )
}
