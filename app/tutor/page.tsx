"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  Calendar,
  User,
  LogOut,
  Plus,
  ExternalLink,
  CheckCircle,
  MessageSquare,
  Clock,
  Gift,
  Coins,
  Menu,
} from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Session {
  id: string
  tutor_id: string
  student_id: string
  subject: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  zoom_link?: string
}

interface Student {
  id: string
  name: string
  email: string
}

interface FeedbackStats {
  sentimentRating: number
  totalRatings: number
}

export default function TutorDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [students, setStudents] = useState<Record<string, string>>({})
  const [zoomLink, setZoomLink] = useState("")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    sentimentRating: 0,
    totalRatings: 0,
  })

  useEffect(() => {
    if (!user || user.role !== "tutor") {
      router.push("/")
      return
    }

    // Load sessions and students from Supabase
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .eq("tutor_id", user.id)

        if (sessionError) {
          console.error("Error fetching sessions:", sessionError)
          return
        }

        // Fetch all students to get their names
        const { data: studentData, error: studentError } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "student")

        if (studentError) {
          console.error("Error fetching students:", studentError)
          return
        }

        // Fetch sentiment rating from tutor's profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("sentiment_rating, sentiment_total_ratings")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching sentiment stats:", profileError)
        } else if (profile) {
          setFeedbackStats({
            sentimentRating: profile.sentiment_rating ?? 0,
            totalRatings: profile.sentiment_total_ratings ?? 0,
          })
        }

        // Create a map of student IDs to names
        const studentMap: Record<string, string> = {}
        studentData.forEach((student) => {
          studentMap[student.id] = student.name
        })

        setStudents(studentMap)
        setSessions(sessionData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription for session updates
    const subscription = supabase
      .channel("sessions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `tutor_id=eq.${user.id}`,
        },
        () => {
          fetchData()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, router])

  const getStudentName = (studentId: string) => {
    return students[studentId] || "Unknown Student"
  }

  const addZoomLink = async () => {
    if (!selectedSession || !zoomLink) {
      toast({
        title: "Missing Information",
        description: "Please provide a Zoom link",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("sessions").update({ zoom_link: zoomLink }).eq("id", selectedSession.id)

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Zoom Link Added",
        description: "Students can now join the session",
      })

      // Update local state
      setSessions((prev) => prev.map((s) => (s.id === selectedSession.id ? { ...s, zoom_link: zoomLink } : s)))

      setSelectedSession(null)
      setZoomLink("")
    } catch (error) {
      console.error("Error adding zoom link:", error)
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const markCompleted = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("sessions").update({ status: "completed" }).eq("id", sessionId)

      if (error) {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Session Completed",
        description: "Student can now leave feedback",
      })

      // Update local state
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "completed" as const } : s)))
    } catch (error) {
      console.error("Error marking session completed:", error)
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  // Add reject/cancel logic
  const rejectSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.from("sessions").update({ status: "cancelled" }).eq("id", sessionId)

      if (error) {
        toast({
          title: "Rejection Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Session Rejected",
        description: "The session has been cancelled and the slot is now available again.",
      })

      setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: "cancelled" as const } : s)))
    } catch (error) {
      console.error("Error rejecting session:", error)
      toast({
        title: "Rejection Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile Header */}
          <div className="flex md:hidden justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-dark-blue-gray">Tutor Dashboard</h1>
              <p className="text-xs text-blue-gray">Manage your sessions</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/tutor/rewards">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent px-2"
                >
                  <Gift className="h-4 w-4 mr-1" />
                  <Coins className="h-4 w-4" />
                  <span className="ml-1">{user.points || 0}</span>
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
              <div className="flex flex-col gap-2">
                <Link href="/tutor/availability">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Availability
                  </Button>
                </Link>
                <Link href="/tutor/feedback">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Feedback
                  </Button>
                </Link>
                <Link href="/tutor/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-dark-blue-gray">Tutor Dashboard</h1>
              <p className="text-sm text-blue-gray">Manage your sessions and connect with students</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-blue-gray">
                <span>Welcome, {user.name}</span>
              </div>
              <Link href="/tutor/rewards">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  <Coins className="h-4 w-4 mr-1" />
                  {user.points || 0}
                </Button>
              </Link>
              <Link href="/tutor/availability">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Availability
                </Button>
              </Link>
              <Link href="/tutor/feedback">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Feedback
                </Button>
              </Link>
              <Link href="/tutor/profile">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-gray">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="text-xl md:text-2xl font-bold text-orange">{upcomingSessions.length}</div>
                  <p className="text-xs md:text-sm text-blue-gray">Upcoming Sessions</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="text-xl md:text-2xl font-bold text-green-600">{completedSessions.length}</div>
                  <p className="text-xs md:text-sm text-blue-gray">Completed Sessions</p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-2">
                    <div className="text-xl md:text-2xl font-bold text-yellow-600">
                      {feedbackStats.sentimentRating.toFixed(1)}
                    </div>
                    <MessageSquare className="h-4 w-4 md:h-5 md:w-5 text-yellow-600" />
                  </div>
                  <p className="text-xs md:text-sm text-blue-gray">Avg. Sentiment Rating</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {feedbackStats.totalRatings} feedback
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 shadow-sm">
                <CardContent className="p-4 md:p-6">
                  <div className="text-xl md:text-2xl font-bold text-dark-blue-gray">{feedbackStats.totalRatings}</div>
                  <p className="text-xs md:text-sm text-blue-gray">Total Reviews</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 md:space-y-8">
              {/* Upcoming Sessions */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2 text-dark-blue-gray">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5 text-orange" />
                  Upcoming Sessions
                </h2>
                {upcomingSessions.length === 0 ? (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="text-center py-8">
                      <p className="text-blue-gray">No upcoming sessions scheduled.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {upcomingSessions.map((session) => (
                      <Card key={session.id} className="card-clean hover-lift">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base md:text-lg text-dark-blue-gray">{session.subject}</CardTitle>
                          <CardDescription className="text-blue-gray text-sm">
                            with {getStudentName(session.student_id)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs md:text-sm text-blue-gray">
                                <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                              </p>
                              <p className="text-xs md:text-sm text-blue-gray">
                                <strong>Time:</strong> {session.time}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                              Scheduled
                            </Badge>

                            {/* Mobile Button Layout */}
                            <div className="grid grid-cols-2 gap-2 md:flex md:gap-2">
                              {!session.zoom_link ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent text-xs md:text-sm"
                                      onClick={() => setSelectedSession(session)}
                                    >
                                      <Plus className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                      <span className="hidden sm:inline">Add Zoom</span>
                                      <span className="sm:hidden">Zoom</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Add Zoom Link</DialogTitle>
                                      <DialogDescription>
                                        Provide the Zoom meeting link for this session
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <Input
                                        placeholder="https://zoom.us/j/..."
                                        value={zoomLink}
                                        onChange={(e) => setZoomLink(e.target.value)}
                                        className="focus:ring-orange focus:border-orange"
                                      />
                                      <Button
                                        onClick={addZoomLink}
                                        className="w-full bg-orange hover:bg-orange text-white"
                                      >
                                        Add Link
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent text-xs md:text-sm"
                                  asChild
                                >
                                  <a href={session.zoom_link} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    <span className="hidden sm:inline">Join</span>
                                    <span className="sm:hidden">Join</span>
                                  </a>
                                </Button>
                              )}

                              <Button
                                size="sm"
                                onClick={() => markCompleted(session.id)}
                                className="bg-orange hover:bg-orange text-white text-xs md:text-sm"
                              >
                                <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                <span className="hidden sm:inline">Complete</span>
                                <span className="sm:hidden">Done</span>
                              </Button>
                            </div>
                            
                            {/* Reject button - Full width on mobile */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-red-300 text-red-600 hover:bg-red-50 text-xs md:text-sm"
                              onClick={() => rejectSession(session.id)}
                            >
                              Reject Session
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Completed Sessions */}
              <div>
                <h2 className="text-lg md:text-xl font-semibold mb-4 text-dark-blue-gray">Recent Completed Sessions</h2>
                {completedSessions.length === 0 ? (
                  <Card className="border-gray-200 shadow-sm">
                    <CardContent className="text-center py-8">
                      <p className="text-blue-gray">No completed sessions yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedSessions.slice(0, 6).map((session) => (
                      <Card key={session.id} className="card-clean hover-lift">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base md:text-lg text-dark-blue-gray">{session.subject}</CardTitle>
                          <CardDescription className="text-blue-gray text-sm">
                            with {getStudentName(session.student_id)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <p className="text-xs md:text-sm text-blue-gray">
                              <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                            </p>
                            <p className="text-xs md:text-sm text-blue-gray">
                              <strong>Time:</strong> {session.time}
                            </p>
                            <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                              Completed
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
