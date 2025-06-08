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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Calendar, ArrowLeft, Star, ExternalLink } from "lucide-react"
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
  feedback?: {
    rating: number
    comment: string
  }
}

interface Tutor {
  id: string
  name: string
  subjects: string[]
}

export default function StudentCalendar() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [tutors, setTutors] = useState<Record<string, string>>({})
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/login")
      return
    }

    // Load sessions and tutors from Supabase
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch sessions
        const { data: sessionData, error: sessionError } = await supabase
          .from("sessions")
          .select("*, feedback(*)")
          .eq("student_id", user.id)

        if (sessionError) {
          console.error("Error fetching sessions:", sessionError)
          return
        }

        // Fetch all tutors to get their names
        const { data: tutorData, error: tutorError } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("role", "tutor")

        if (tutorError) {
          console.error("Error fetching tutors:", tutorError)
          return
        }

        // Create a map of tutor IDs to names
        const tutorMap: Record<string, string> = {}
        tutorData.forEach((tutor) => {
          tutorMap[tutor.id] = tutor.name
        })

        setTutors(tutorMap)
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

  const submitFeedback = async () => {
    if (!selectedSession || feedbackRating === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide a rating",
        variant: "destructive",
      })
      return
    }

    try {
      // Insert feedback
      const { error: feedbackError } = await supabase.from("feedback").insert({
        session_id: selectedSession.id,
        rating: feedbackRating,
        comment: feedbackComment,
      })

      if (feedbackError) {
        toast({
          title: "Feedback submission failed",
          description: feedbackError.message,
          variant: "destructive",
        })
        return
      }

      // Update tutor's rating
      // First, get current tutor data
      const { data: tutorData, error: tutorFetchError } = await supabase
        .from("profiles")
        .select("rating, total_ratings")
        .eq("id", selectedSession.tutor_id)
        .single()

      if (tutorFetchError) {
        console.error("Error fetching tutor data:", tutorFetchError)
        return
      }

      // Calculate new rating
      const currentRating = tutorData.rating || 0
      const currentTotalRatings = tutorData.total_ratings || 0
      const newTotalRatings = currentTotalRatings + 1
      const newRating = (currentRating * currentTotalRatings + feedbackRating) / newTotalRatings

      // Update tutor profile
      const { error: tutorUpdateError } = await supabase
        .from("profiles")
        .update({
          rating: newRating,
          total_ratings: newTotalRatings,
        })
        .eq("id", selectedSession.tutor_id)

      if (tutorUpdateError) {
        console.error("Error updating tutor rating:", tutorUpdateError)
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })

      setSelectedSession(null)
      setFeedbackRating(0)
      setFeedbackComment("")

      // Refresh sessions to show the feedback
      const { data: updatedSessions } = await supabase
        .from("sessions")
        .select("*, feedback(*)")
        .eq("student_id", user.id)

      if (updatedSessions) {
        setSessions(updatedSessions)
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Feedback submission failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const upcomingSessions = sessions.filter((s) => s.status === "scheduled")
  const completedSessions = sessions.filter((s) => s.status === "completed")

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/student">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your sessions...</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Sessions
              </h2>
              {upcomingSessions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No upcoming sessions scheduled.</p>
                    <Link href="/student">
                      <Button className="mt-4">Book a Session</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {upcomingSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{session.subject}</CardTitle>
                        <CardDescription>with {getTutorName(session.tutor_id)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            <strong>Time:</strong> {session.time}
                          </p>
                          <Badge variant="outline" className="text-green-600">
                            Scheduled
                          </Badge>
                          {session.zoom_link && (
                            <Button size="sm" className="w-full mt-2" asChild>
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
              <h2 className="text-xl font-semibold mb-4">Completed Sessions</h2>
              {completedSessions.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No completed sessions yet.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{session.subject}</CardTitle>
                        <CardDescription>with {getTutorName(session.tutor_id)}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <strong>Date:</strong> {new Date(session.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">
                            <strong>Time:</strong> {session.time}
                          </p>
                          <Badge variant="outline" className="text-blue-600">
                            Completed
                          </Badge>
                          {session.feedback ? (
                            <div className="mt-2 p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < session.feedback!.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              {session.feedback.comment && (
                                <p className="text-xs text-gray-600 mt-1">{session.feedback.comment}</p>
                              )}
                            </div>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={() => setSelectedSession(session)}
                                >
                                  Leave Feedback
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Rate Your Session</DialogTitle>
                                  <DialogDescription>
                                    How was your session with {getTutorName(session.tutor_id)}?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Rating</label>
                                    <div className="flex gap-1">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <button key={i} onClick={() => setFeedbackRating(i + 1)} className="p-1">
                                          <Star
                                            className={`h-6 w-6 ${
                                              i < feedbackRating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300 hover:text-yellow-400"
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-2 block">Comment (optional)</label>
                                    <Textarea
                                      placeholder="Share your experience..."
                                      value={feedbackComment}
                                      onChange={(e) => setFeedbackComment(e.target.value)}
                                    />
                                  </div>
                                  <Button onClick={submitFeedback} className="w-full">
                                    Submit Feedback
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
