"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, LogOut, Star, Calendar, MessageSquare, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Tutor {
  id: string
  name: string
  subjects: string[]
  bio: string
  rating: number
  totalRatings: number
  profilePhotoUrl?: string
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState("")
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

        // Fetch feedback data for all tutors
        const { data: feedbackData, error: feedbackError } = await supabase.from("feedback").select(`
        rating,
        sessions!inner (
          tutor_id
        )
      `)

        let feedbackMap: Record<string, { totalRatings: number; averageRating: number }> = {}

        if (!feedbackError && feedbackData) {
          // Group feedback by tutor_id
          const groupedFeedback = feedbackData.reduce(
            (acc, feedback) => {
              const tutorId = feedback.sessions.tutor_id
              if (!acc[tutorId]) {
                acc[tutorId] = []
              }
              if (feedback.rating !== null) {
                acc[tutorId].push(feedback.rating)
              }
              return acc
            },
            {} as Record<string, number[]>,
          )

          // Calculate averages
          feedbackMap = Object.entries(groupedFeedback).reduce(
            (acc, [tutorId, ratings]) => {
              acc[tutorId] = {
                totalRatings: ratings.length,
                averageRating:
                  ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0,
              }
              return acc
            },
            {} as Record<string, { totalRatings: number; averageRating: number }>,
          )
        }

        const tutorsWithRatings = data.map((tutor) => ({
          id: tutor.id,
          name: tutor.name,
          subjects: tutor.subjects || [],
          bio: tutor.bio || "",
          rating: feedbackMap[tutor.id]?.averageRating || 0,
          totalRatings: feedbackMap[tutor.id]?.totalRatings || 0,
          profilePhotoUrl: tutor.profile_photo_url,
        }))

        setTutors(tutorsWithRatings)
        setFilteredTutors(tutorsWithRatings)
      } catch (error) {
        console.error("Error fetching tutors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTutors()
  }, [user, router])

  useEffect(() => {
    let filtered = tutors

    if (searchTerm) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tutor.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedSubject) {
      filtered = filtered.filter((tutor) => tutor.subjects.includes(selectedSubject))
    }

    setFilteredTutors(filtered)
  }, [searchTerm, selectedSubject, tutors])

  const handleLogout = async () => {
    await logout()
  }

  const getAllSubjects = () => {
    const subjects = new Set<string>()
    tutors.forEach((tutor) => {
      tutor.subjects.forEach((subject) => subjects.add(subject))
    })
    return Array.from(subjects).sort()
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden w-1/2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-blue-gray">Student Dashboard</h1>
            <p className="text-sm text-blue-gray">Find and book sessions with verified tutors</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-blue-gray">
              <span>Welcome, {user.name}</span>
            </div>
            <Link href="/student/calendar">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
              >
                <Calendar className="h-4 w-4 mr-2" />
                My Sessions
              </Button>
            </Link>
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
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-dark-blue-gray">Find Your Perfect Tutor</CardTitle>
              <CardDescription className="text-blue-gray">
                Search by name or subject to find the right tutor for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-blue-gray" />
                  <Input
                    placeholder="Search tutors or subjects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-300 focus:border-orange focus:ring-orange"
                  />
                </div>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-orange focus:ring-orange">
                    <SelectValue placeholder="Filter by subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {getAllSubjects().map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange" />
            <span className="ml-2 text-blue-gray">Loading tutors...</span>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTutors.map((tutor) => (
              <Card key={tutor.id} className="card-clean hover-lift overflow-hidden">
                {/* Profile Header with Banner */}
                <div className="relative">
                  <div className="h-16 bg-gradient-to-r from-orange/20 to-orange/10"></div>
                  <div className="absolute -bottom-8 left-6">
                    <Avatar className="h-16 w-16 border-4 border-white shadow-lg">
                      <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                      <AvatarFallback className="text-lg bg-orange text-white font-semibold">
                        {tutor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <CardHeader className="pt-12 pb-4">
                  <div className="space-y-2">
                    <CardTitle className="text-xl text-dark-blue-gray">{tutor.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">{renderStars(tutor.rating)}</div>
                      <span className="text-sm text-blue-gray">
                        {tutor.rating.toFixed(1)} ({tutor.totalRatings}{" "}
                        {tutor.totalRatings === 1 ? "review" : "reviews"})
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Subjects Section */}
                  <div>
                    <h4 className="text-sm font-medium text-dark-blue-gray mb-2 flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-orange" />
                      Subjects
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {tutor.subjects.slice(0, 3).map((subject) => (
                        <Badge
                          key={subject}
                          variant="secondary"
                          className="text-xs bg-orange/10 text-orange border-orange/20"
                        >
                          {subject}
                        </Badge>
                      ))}
                      {tutor.subjects.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-blue-gray">
                          +{tutor.subjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Bio Section */}
                  {tutor.bio && (
                    <div>
                      <h4 className="text-sm font-medium text-dark-blue-gray mb-2 flex items-center gap-1">
                        <User className="h-4 w-4 text-orange" />
                        About
                      </h4>
                      <p className="text-sm text-blue-gray line-clamp-2">{tutor.bio}</p>
                    </div>
                  )}
                </CardContent>

                {/* Card Footer */}
                <div className="p-6 pt-0">
                  <Link href={`/student/tutor/${tutor.id}`}>
                    <Button className="w-full bg-orange hover:bg-orange text-white">View Profile & Book</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredTutors.length === 0 && (
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="text-center py-12">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-blue-gray mb-2">No tutors found</h3>
              <p className="text-blue-gray">Try adjusting your search terms or removing filters to see more results.</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
