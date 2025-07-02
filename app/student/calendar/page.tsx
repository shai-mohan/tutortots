"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FeedbackForm } from "@/components/feedback-form"
import { Calendar, ArrowLeft, ExternalLink, MessageSquare, Star } from "lucide-react"
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

interface Tutor {
  id: string
  name: string
}

interface Feedback {
  id: string
  session_id: string
  rating?: number
  comment?: string
}

export default function StudentCalendar() {
  const { user } = useAuth()
  const router = useRouter()
  const [sessions, setSessions] = useState<Session[]>([])
  const [tutors, setTutors] = useState<Record<string, string>>({})
  const [feedback, setFeedback] = useState<Record<string, Feedback>>({})
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/login")
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*")
          .eq("student_id", user.id)
          .order("date", { ascending: false })

        if (sessionError) {
          console.error("Error fetching sessions:", sessionError)
          return
        }

        // Fetch tutors
        const { data: tutorData, error: tutorError } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "tutor")

        if (tutorError) {
          console.error("Error fetching tutors:", tutorError)
          return
        }

        // Fetch existing feedback
        const { data: feedbackData, error: feedbackError } = await supabase
          .from("feedback")
          .select("*")
          .in(
            "session_id",
            sessionData.map((s) => s.id),
          )

        if (feedbackError) {
          console.error("Error fetching feedback:", feedbackError)
        }

        // Create maps for easy lookup
        const tutorMap: Record<string, string> = {}
        tutorData.forEach((tutor) => {
          tutorMap[tutor.id] = tutor.name
        })

        const feedbackMap: Record<string, Feedback> = {}
        feedbackData?.forEach((fb) => {
          feedbackMap[fb.session_id] = fb
        })

        setTutors(tutorMap)
        setSessions(sessionData)
        setFeedback(feedbackMap)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Set up real-time subscription
    const subscription = supabase
      .channel("student-sessions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "sessions",
          filter: `student_id=eq.${user.id}`,
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

  const getTutorName = (tutorId: string) => {
    return tutors[tutorId] || "Unknown Tutor"
  }

  const handleFeedbackSubmitted = () => {
    setSelectedSession(null)
    // Refresh data to update feedback status
    window.location.reload()
  }

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/student">
            <Button
              variant="outline"
              size="sm"
              className="border-orange-200 text-orange-600 hover:bg-orange-50 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Calendar className="h-8 w-8 text-orange-500" />
            My Sessions
          </h1>
          <p className="text-gray-600">Manage your tutoring sessions and leave feedback</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your sessions...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Upcoming Sessions</h2>
              {upcomingSessions.length === 0 ? (
                <Card className="border-orange-100">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No upcoming sessions scheduled.</p>
                    <Link href="/student">
                      <Button className="mt-4 bg-orange-500 hover:bg-orange-600">Book a Session</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id} className="border-orange-100 hover:border-orange-200 transition-colors">
                      <CardHeader>
                        <CardTitle className="text-lg text-gray-800">{session.subject}</CardTitle>
                        <CardDescription>with {getTutorName(session.tutor_id)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-600">
                              <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Time:</strong> {session.time}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Scheduled
                          </Badge>
                          {session.zoom_link && (
                            <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                              <a href={session.zoom_link} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Join Session
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Completed Sessions</h2>
              {completedSessions.length === 0 ? (
                <Card className="border-orange-100">
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No completed sessions yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedSessions.map((session) => {
                    const sessionFeedback = feedback[session.id]
                    const hasFeedback = !!sessionFeedback

                    return (
                      <Card key={session.id} className="border-orange-100 hover:border-orange-200 transition-colors">
                        <CardHeader>
                          <CardTitle className="text-lg text-gray-800">{session.subject}</CardTitle>
                          <CardDescription>with {getTutorName(session.tutor_id)}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-600">
                                <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Time:</strong> {session.time}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              Completed
                            </Badge>

                            {hasFeedback ? (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <Star className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">Feedback Submitted</span>
                                </div>
                                {sessionFeedback.rating && (
                                  <div className="flex items-center gap-1 mb-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < sessionFeedback.rating!
                                            ? "fill-orange-400 text-orange-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-xs text-gray-600 ml-1">{sessionFeedback.rating}/5</span>
                                  </div>
                                )}
                                {sessionFeedback.comment && (
                                  <p className="text-xs text-gray-600 italic">
                                    "{sessionFeedback.comment.substring(0, 50)}..."
                                  </p>
                                )}
                              </div>
                            ) : (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    className="w-full bg-orange-500 hover:bg-orange-600"
                                    onClick={() => setSelectedSession(session)}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Leave Feedback
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                  <DialogHeader>
                                    <DialogTitle>Session Feedback</DialogTitle>
                                  </DialogHeader>
                                  {selectedSession && (
                                    <FeedbackForm
                                      sessionId={selectedSession.id}
                                      tutorName={getTutorName(selectedSession.tutor_id)}
                                      subject={selectedSession.subject}
                                      onFeedbackSubmitted={handleFeedbackSubmitted}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
