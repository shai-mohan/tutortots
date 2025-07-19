"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import {
  BookOpen,
  Calendar,
  Clock,
  Gift,
  LogOut,
  Search,
  Star,
  User,
  Users,
  MapPin,
  GraduationCap,
  Award,
  TrendingUp,
  Menu,
} from "lucide-react"
import { supabase } from "@/lib/supabase"

interface Tutor {
  id: string
  name: string
  email: string
  subjects: string[]
  bio: string
  hourlyRate: number
  rating: number
  totalSessions: number
  profilePhotoUrl?: string
  location?: string
  experience?: string
  qualifications?: string[]
}

interface RecentSession {
  id: string
  tutorName: string
  subject: string
  date: string
  status: "completed" | "upcoming" | "cancelled"
  rating?: number
}

interface QuickStats {
  totalSessions: number
  completedSessions: number
  upcomingSessions: number
  totalPoints: number
  favoriteSubject: string
  favoriteTutor: string
}

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([])
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    totalPoints: 0,
    favoriteSubject: "None",
    favoriteTutor: "None",
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "Malay",
    "History",
    "Geography",
    "Economics",
    "Accounting",
    "Computer Science",
    "Additional Mathematics",
  ]

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
      return
    }

    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch tutors
        const { data: tutorsData, error: tutorsError } = await supabase
          .from("profiles")
          .select("*, sentiment_rating")
          .eq("role", "tutor")
          .eq("verified", true)

        if (tutorsError) {
          console.error("Error fetching tutors:", tutorsError)
        } else {
          // Fetch completed session counts for all tutors in parallel
          const sessionCounts = await Promise.all(
            tutorsData.map(async (tutor) => {
              const { count, error: sessionError } = await supabase
                .from("sessions")
                .select("id", { count: "exact", head: true })
                .eq("tutor_id", tutor.id)
                .eq("status", "completed")
              if (sessionError) {
                console.error(`Error fetching sessions for tutor ${tutor.id}:`, sessionError)
                return 0
              }
              return count || 0
            })
          )

          const formattedTutors = tutorsData.map((tutor, idx) => ({
            id: tutor.id,
            name: tutor.name,
            email: tutor.email,
            subjects: tutor.subjects || [],
            bio: tutor.bio || "",
            hourlyRate: tutor.hourly_rate || 50,
            rating: tutor.sentiment_rating ?? 0, // Use the sentiment_rating from profile
            totalSessions: sessionCounts[idx], // Use the real completed session count
            profilePhotoUrl: tutor.profile_photo_url,
            location: tutor.location || "Kuala Lumpur",
            experience: tutor.experience || "2+ years",
            qualifications: tutor.qualifications || [],
          }))
          setTutors(formattedTutors)
          setFilteredTutors(formattedTutors)
        }

        // Fetch recent sessions (real data)
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("id, tutor_id, subject, date, status")
          .eq("student_id", user.id)
          .order("date", { ascending: false })
          .limit(5)

        if (sessionError) {
          console.error("Error fetching recent sessions:", sessionError)
          setRecentSessions([])
        } else if (sessionData.length === 0) {
          setRecentSessions([])
        } else {
          // Fetch tutors for these sessions
          const tutorIds = [...new Set(sessionData.map((s) => s.tutor_id))]
          const { data: tutorData, error: tutorError } = await supabase
            .from("profiles")
            .select("id, name")
            .in("id", tutorIds)

          const tutorMap = (tutorData || []).reduce((acc, t) => {
            acc[t.id] = t.name
            return acc
          }, {} as Record<string, string>)

          // Fetch feedback for these sessions
          const { data: feedbackData, error: feedbackError } = await supabase
            .from("feedback")
            .select("session_id, rating")
            .in("session_id", sessionData.map((s) => s.id))

          const feedbackMap = (feedbackData || []).reduce((acc, f) => {
            acc[f.session_id] = f.rating
            return acc
          }, {} as Record<string, number | undefined>)

          // Map sessions to UI format
          const formattedSessions = sessionData.map((s) => ({
            id: s.id,
            tutorName: tutorMap[s.tutor_id] || "Unknown Tutor",
            subject: s.subject,
            date: s.date,
            status: (
              s.status === "scheduled"
                ? "upcoming"
                : s.status === "completed"
                ? "completed"
                : "cancelled"
            ) as "completed" | "upcoming" | "cancelled",
            rating: feedbackMap[s.id],
          }))
          setRecentSessions(formattedSessions)
        }

        // Fetch real session statistics for the student
        const { data: allSessionsData, error: allSessionsError } = await supabase
          .from("sessions")
          .select("id, status, subject, tutor_id")
          .eq("student_id", user.id)

        if (allSessionsError) {
          console.error("Error fetching all sessions:", allSessionsError)
        } else {
          const totalSessions = allSessionsData?.length || 0
          const completedSessions = allSessionsData?.filter(s => s.status === "completed").length || 0
          const upcomingSessions = allSessionsData?.filter(s => s.status === "scheduled").length || 0
          
          // Calculate favorite subject based on completed sessions
          const subjectCounts = allSessionsData
            ?.filter(s => s.status === "completed")
            ?.reduce((acc, session) => {
              acc[session.subject] = (acc[session.subject] || 0) + 1
              return acc
            }, {} as Record<string, number>) || {}
          
          const favoriteSubject = Object.keys(subjectCounts).length > 0
            ? Object.entries(subjectCounts).sort(([,a], [,b]) => b - a)[0][0]
            : "None"

          // Calculate favorite tutor based on completed sessions
          const tutorCounts = allSessionsData
            ?.filter(s => s.status === "completed")
            ?.reduce((acc, session) => {
              acc[session.tutor_id] = (acc[session.tutor_id] || 0) + 1
              return acc
            }, {} as Record<string, number>) || {}
          
          let favoriteTutor = "None"
          if (Object.keys(tutorCounts).length > 0) {
            const mostFrequentTutorId = Object.entries(tutorCounts).sort(([,a], [,b]) => b - a)[0][0]
            // Fetch tutor name
            const { data: tutorData, error: tutorError } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", mostFrequentTutorId)
              .single()
            
            if (!tutorError && tutorData) {
              favoriteTutor = tutorData.name
            }
          }

          // Set quick stats with real data
          setQuickStats({
            totalSessions,
            completedSessions,
            upcomingSessions,
            totalPoints: user.points || 0,
            favoriteSubject,
            favoriteTutor,
          })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router, toast])

  // Filter tutors based on search and subject
  useEffect(() => {
    let filtered = tutors

    if (searchTerm) {
      filtered = filtered.filter(
        (tutor) =>
          tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tutor.subjects.some((subject) => subject.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (selectedSubject !== "all") {
      filtered = filtered.filter((tutor) => tutor.subjects.includes(selectedSubject))
    }

    setFilteredTutors(filtered)
  }, [tutors, searchTerm, selectedSubject])

  const handleLogout = async () => {
    await logout()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dark-blue-gray">Student Dashboard</h1>
                <p className="text-sm text-blue-gray">Welcome back, {user.name}!</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="sm:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            
            <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isMobileMenuOpen ? 'block' : 'hidden sm:flex'}`}>
              <div className="flex items-center gap-4 text-sm text-blue-gray w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-orange" />
                  <span className="font-medium">{user.points || 0} points</span>
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="bg-orange text-white text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Welcome, {user.name}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-gray">Total Sessions</p>
                  <p className="text-lg sm:text-2xl font-bold text-dark-blue-gray">{quickStats.totalSessions}</p>
                </div>
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-orange" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-gray">Completed</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{quickStats.completedSessions}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-gray">Upcoming</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{quickStats.upcomingSessions}</p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-gray">Points Earned</p>
                  <p className="text-lg sm:text-2xl font-bold text-orange">{quickStats.totalPoints}</p>
                </div>
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Link href="/student/calendar">
            <Card className="border-gray-200 shadow-sm hover-lift cursor-pointer transition-all duration-200 hover:shadow-md h-full">
              <CardContent className="p-4 sm:p-6 text-center">
                <Calendar className="h-8 w-8 sm:h-12 sm:w-12 text-orange mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-dark-blue-gray mb-2 text-sm sm:text-base">View Calendar</h3>
                <p className="text-xs sm:text-sm text-blue-gray">Check your upcoming sessions and schedule</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/rewards">
            <Card className="border-gray-200 shadow-sm hover-lift cursor-pointer transition-all duration-200 hover:shadow-md h-full">
              <CardContent className="p-4 sm:p-6 text-center">
                <Gift className="h-8 w-8 sm:h-12 sm:w-12 text-orange mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-dark-blue-gray mb-2 text-sm sm:text-base">Rewards Center</h3>
                <p className="text-xs sm:text-sm text-blue-gray">Redeem your points for exciting rewards</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/profile">
            <Card className="border-gray-200 shadow-sm hover-lift cursor-pointer transition-all duration-200 hover:shadow-md h-full sm:col-span-2 lg:col-span-1">
              <CardContent className="p-4 sm:p-6 text-center">
                <User className="h-8 w-8 sm:h-12 sm:w-12 text-orange mx-auto mb-3 sm:mb-4" />
                <h3 className="font-semibold text-dark-blue-gray mb-2 text-sm sm:text-base">My Profile</h3>
                <p className="text-xs sm:text-sm text-blue-gray">Update your profile and preferences</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Available Tutors */}
          <div className="xl:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray text-lg sm:text-xl">
                  <GraduationCap className="h-5 w-5 text-orange" />
                  Available Tutors
                </CardTitle>
                <CardDescription className="text-blue-gray text-sm">
                  Find and book sessions with qualified tutors
                </CardDescription>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tutors or subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm"
                    />
                  </div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-48 text-sm">
                      <SelectValue placeholder="Filter by subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                        <Skeleton className="h-9 w-[100px]" />
                      </div>
                    ))}
                  </div>
                ) : filteredTutors.length === 0 ? (
                  <div className="text-center py-8">
                    <GraduationCap className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-blue-gray">No tutors found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTutors.slice(0, 6).map((tutor) => (
                      <div
                        key={tutor.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border border-gray-200 rounded-lg hover-lift gap-4"
                      >
                        <div className="flex items-start sm:items-center gap-4 flex-1">
                          <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                            <AvatarFallback className="bg-orange text-white">{tutor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-dark-blue-gray text-sm sm:text-base">{tutor.name}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs sm:text-sm text-blue-gray">{tutor.rating}</span>
                              </div>
                              <span className="hidden sm:inline text-gray-300">•</span>
                              <span className="text-xs sm:text-sm text-blue-gray">{tutor.totalSessions} sessions</span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tutor.subjects.slice(0, 3).map((subject) => (
                                <Badge
                                  key={subject}
                                  variant="outline"
                                  className="text-xs border-gray-300 text-blue-gray"
                                >
                                  {subject}
                                </Badge>
                              ))}
                              {tutor.subjects.length > 3 && (
                                <Badge variant="outline" className="text-xs border-gray-300 text-blue-gray">
                                  +{tutor.subjects.length - 3} more
                                </Badge>
                              )}
                            </div>
                            {tutor.location && (
                              <div className="flex items-center gap-1 mt-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{tutor.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Link href={`/student/tutor/${tutor.id}`} className="w-full sm:w-auto">
                          <Button size="sm" className="bg-orange hover:bg-orange-600 w-full sm:w-auto text-sm">
                            View Profile & Book
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions and Performance Insights */}
          <div className="space-y-6">
            {/* Recent Sessions */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray text-lg">
                  <Clock className="h-5 w-5 text-orange" />
                  Recent Sessions
                </CardTitle>
                <CardDescription className="text-blue-gray text-sm">Your latest tutoring activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSessions.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-blue-gray">No recent sessions</p>
                    </div>
                  ) : (
                    recentSessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200 rounded-lg gap-2"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-dark-blue-gray text-sm">{session.tutorName}</h4>
                          <p className="text-xs text-blue-gray">{session.subject}</p>
                          <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex flex-col sm:items-end gap-1">
                          <Badge className={getStatusColor(session.status)} variant="secondary" className="text-xs">
                            {session.status}
                          </Badge>
                          {session.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs text-blue-gray">{session.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Link href="/student/calendar">
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent text-sm"
                  >
                    View All Sessions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray text-lg">
                  <TrendingUp className="h-5 w-5 text-orange" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-gray">Favorite Subject</span>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">{quickStats.favoriteSubject}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-gray">Favorite Tutor</span>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">{quickStats.favoriteTutor}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-gray">Completion Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      {quickStats.totalSessions > 0
                        ? `${Math.round((quickStats.completedSessions / quickStats.totalSessions) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
