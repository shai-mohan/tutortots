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
    favoriteSubject: "Mathematics",
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSubject, setSelectedSubject] = useState<string>("all")

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
          .select("*")
          .eq("role", "tutor")
          .eq("verified", true)

        if (tutorsError) {
          console.error("Error fetching tutors:", tutorsError)
        } else {
          const formattedTutors = tutorsData.map((tutor) => ({
            id: tutor.id,
            name: tutor.name,
            email: tutor.email,
            subjects: tutor.subjects || [],
            bio: tutor.bio || "",
            hourlyRate: tutor.hourly_rate || 50,
            rating: tutor.rating || 4.5,
            totalSessions: tutor.total_sessions || 0,
            profilePhotoUrl: tutor.profile_photo_url,
            location: tutor.location || "Kuala Lumpur",
            experience: tutor.experience || "2+ years",
            qualifications: tutor.qualifications || [],
          }))
          setTutors(formattedTutors)
          setFilteredTutors(formattedTutors)
        }

        // Fetch recent sessions (mock data for now)
        setRecentSessions([
          {
            id: "1",
            tutorName: "Dr. Sarah Chen",
            subject: "Mathematics",
            date: "2024-01-15",
            status: "completed",
            rating: 5,
          },
          {
            id: "2",
            tutorName: "Prof. Ahmad Rahman",
            subject: "Physics",
            date: "2024-01-20",
            status: "upcoming",
          },
          {
            id: "3",
            tutorName: "Ms. Lisa Wong",
            subject: "Chemistry",
            date: "2024-01-10",
            status: "completed",
            rating: 4,
          },
        ])

        // Set quick stats
        setQuickStats({
          totalSessions: 15,
          completedSessions: 12,
          upcomingSessions: 3,
          totalPoints: user.points || 0,
          favoriteSubject: "Mathematics",
        })
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
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-blue-gray">Student Dashboard</h1>
            <p className="text-sm text-blue-gray">Welcome back, {user.name}!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-blue-gray">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-orange" />
                <span className="font-medium">{user.points || 0} points</span>
              </div>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback className="bg-orange text-white text-xs">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Welcome, {user.name}</span>
            </div>
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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-gray">Total Sessions</p>
                  <p className="text-2xl font-bold text-dark-blue-gray">{quickStats.totalSessions}</p>
                </div>
                <BookOpen className="h-8 w-8 text-orange" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-gray">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{quickStats.completedSessions}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-gray">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{quickStats.upcomingSessions}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-gray">Points Earned</p>
                  <p className="text-2xl font-bold text-orange">{quickStats.totalPoints}</p>
                </div>
                <Award className="h-8 w-8 text-orange" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Link href="/student/calendar">
            <Card className="border-gray-200 shadow-sm hover-lift cursor-pointer transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Calendar className="h-12 w-12 text-orange mx-auto mb-4" />
                <h3 className="font-semibold text-dark-blue-gray mb-2">View Calendar</h3>
                <p className="text-sm text-blue-gray">Check your upcoming sessions and schedule</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/rewards">
            <Card className="border-gray-200 shadow-sm hover-lift cursor-pointer transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6 text-center">
                <Gift className="h-12 w-12 text-orange mx-auto mb-4" />
                <h3 className="font-semibold text-dark-blue-gray mb-2">Rewards Center</h3>
                <p className="text-sm text-blue-gray">Redeem your points for exciting rewards</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/student/profile">
            <Card className="border-gray-200 shadow-sm hover-lift cursor-pointer transition-all duration-200 hover:shadow-md">
              <CardContent className="p-6 text-center">
                <User className="h-12 w-12 text-orange mx-auto mb-4" />
                <h3 className="font-semibold text-dark-blue-gray mb-2">My Profile</h3>
                <p className="text-sm text-blue-gray">Update your profile and preferences</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Tutors */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                  <GraduationCap className="h-5 w-5 text-orange" />
                  Available Tutors
                </CardTitle>
                <CardDescription className="text-blue-gray">
                  Find and book sessions with qualified tutors
                </CardDescription>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search tutors or subjects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                    <SelectTrigger className="w-full sm:w-48">
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
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover-lift"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={tutor.profilePhotoUrl || "/placeholder.svg"} alt={tutor.name} />
                            <AvatarFallback className="bg-orange text-white">{tutor.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-dark-blue-gray">{tutor.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm text-blue-gray">{tutor.rating}</span>
                              </div>
                              <span className="text-gray-300">•</span>
                              <span className="text-sm text-blue-gray">{tutor.totalSessions} sessions</span>
                              <span className="text-gray-300">•</span>
                              {/* <span className="text-sm font-medium text-orange">RM{tutor.hourlyRate}/hr</span> */}
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
                        <Link href={`/student/tutor/${tutor.id}`}>
                          <Button size="sm" className="bg-orange hover:bg-orange-600">
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

          {/* Recent Sessions */}
          <div>
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                  <Clock className="h-5 w-5 text-orange" />
                  Recent Sessions
                </CardTitle>
                <CardDescription className="text-blue-gray">Your latest tutoring activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div>
                        <h4 className="font-medium text-dark-blue-gray text-sm">{session.tutorName}</h4>
                        <p className="text-xs text-blue-gray">{session.subject}</p>
                        <p className="text-xs text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(session.status)} variant="secondary">
                          {session.status}
                        </Badge>
                        {session.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-blue-gray">{session.rating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/student/calendar">
                  <Button
                    variant="outline"
                    className="w-full mt-4 border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                  >
                    View All Sessions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Performance Insights */}
            <Card className="border-gray-200 shadow-sm mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                  <TrendingUp className="h-5 w-5 text-orange" />
                  Performance Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-gray">Favorite Subject</span>
                    <Badge className="bg-orange-100 text-orange-800">{quickStats.favoriteSubject}</Badge>
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
