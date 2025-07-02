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
import { Star, Search, Calendar, User, LogOut, BookOpen, Clock, Award, Filter } from "lucide-react"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gradient">Student Dashboard</h1>
              <p className="text-sm text-gray-600">Discover amazing tutors and book your sessions</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback className="bg-orange-100 text-orange-600 text-xs">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">Welcome, {user.name}</span>
              </div>
              <Link href="/student/profile">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Link href="/student/calendar">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Calendar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-gray-200 hover:bg-gray-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect <span className="text-gradient">Tutor</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with expert tutors who can help you excel in your studies
            </p>
          </div>

          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      placeholder="Search by subject or tutor name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl text-lg"
                    />
                  </div>
                </div>
                <div className="md:w-64">
                  <Select onValueChange={setRatingFilter}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-orange-400 rounded-xl">
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
          <div className="text-center py-16">
            <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-lg">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-600 font-medium">Finding amazing tutors for you...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredTutors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTutors.map((tutor) => (
                  <Card
                    key={tutor.id}
                    className="card-hover border-0 shadow-lg bg-white/90 backdrop-blur-sm group overflow-hidden"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 ring-4 ring-orange-100 group-hover:ring-orange-200 transition-all">
                          <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                          <AvatarFallback className="bg-gradient-orange text-white text-lg font-bold">
                            {tutor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {tutor.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-gray-700">{tutor.rating.toFixed(1)}</span>
                            </div>
                            <span className="text-sm text-gray-500">({tutor.totalRatings} reviews)</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-semibold text-gray-700">Subjects:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tutor.subjects.slice(0, 3).map((subject) => (
                            <Badge
                              key={subject}
                              variant="secondary"
                              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 transition-colors"
                            >
                              {subject}
                            </Badge>
                          ))}
                          {tutor.subjects.length > 3 && (
                            <Badge variant="outline" className="text-gray-500">
                              +{tutor.subjects.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-gray-700">About:</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{tutor.bio}</p>
                      </div>

                      <Link href={`/student/tutor/${tutor.id}`} className="block">
                        <Button className="w-full bg-gradient-orange text-white hover:shadow-lg hover:scale-105 transition-all duration-300 btn-glow font-semibold">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Details & Book
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tutors found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or browse all available tutors
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setRatingFilter("")
                    }}
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quick Stats */}
        {!loading && filteredTutors.length > 0 && (
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 text-center">
              <CardContent className="p-6">
                <Award className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-orange-700 mb-1">{filteredTutors.length}</div>
                <div className="text-sm text-orange-600 font-medium">Available Tutors</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 text-center">
              <CardContent className="p-6">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-blue-700 mb-1">
                  {[...new Set(filteredTutors.flatMap((t) => t.subjects))].length}
                </div>
                <div className="text-sm text-blue-600 font-medium">Subjects Covered</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 text-center">
              <CardContent className="p-6">
                <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-green-700 mb-1">24/7</div>
                <div className="text-sm text-green-600 font-medium">Booking Available</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
