"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, Search, Calendar, User, LogOut, Filter, GraduationCap } from "lucide-react"
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
      router.push("/")
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

  const handleLogout = async () => {
    await logout()
  }

  if (!user) return null

  // Function to render star rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating - fullStars >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      )
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

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
                onClick={handleLogout}
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
            <div className="flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin mr-2"></div>
              <span className="text-blue-gray">Loading tutors...</span>
            </div>
          </div>
        ) : (
          <>
            {filteredTutors.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutors.map((tutor) => (
                  <Card
                    key={tutor.id}
                    className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="h-24 bg-gradient-to-r from-orange/10 to-blue-gray/10 relative">
                      <div className="absolute -bottom-12 left-6">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-sm">
                          <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                          <AvatarFallback className="bg-orange text-white text-xl font-medium">
                            {tutor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>

                    <CardHeader className="pt-16 pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl font-bold text-dark-blue-gray">{tutor.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center">{renderStars(tutor.rating)}</div>
                            <span className="text-sm font-medium text-blue-gray ml-1">{tutor.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">
                              ({tutor.totalRatings} {tutor.totalRatings === 1 ? "review" : "reviews"})
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pb-4">
                      <div className="flex items-start gap-2">
                        <GraduationCap className="h-4 w-4 text-orange mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-dark-blue-gray mb-1">Subjects</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {tutor.subjects.slice(0, 3).map((subject) => (
                              <Badge
                                key={subject}
                                variant="secondary"
                                className="text-xs bg-gray-100 text-blue-gray px-2 py-0.5"
                              >
                                {subject}
                              </Badge>
                            ))}
                            {tutor.subjects.length > 3 && (
                              <Badge variant="outline" className="text-xs text-gray-500 px-2 py-0.5">
                                +{tutor.subjects.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-blue-gray mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-medium text-dark-blue-gray mb-1">About</h4>
                          <p className="text-sm text-blue-gray line-clamp-2">{tutor.bio}</p>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-0 pb-4">
                      <Link href={`/student/tutor/${tutor.id}`} className="w-full">
                        <Button className="w-full bg-orange hover:bg-orange/90 text-white">
                          <Calendar className="h-4 w-4 mr-2" />
                          View Profile & Book
                        </Button>
                      </Link>
                    </CardFooter>
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
