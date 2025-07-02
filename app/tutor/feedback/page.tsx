"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Star, MessageSquare, Calendar } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface FeedbackWithSession {
  id: string
  rating?: number
  comment?: string
  created_at: string
  session: {
    subject: string
    date: string
    time: string
    student: {
      name: string
    }
  }
}

export default function TutorFeedback() {
  const { user } = useAuth()
  const router = useRouter()
  const [feedback, setFeedback] = useState<FeedbackWithSession[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    ratingDistribution: [0, 0, 0, 0, 0],
  })

  useEffect(() => {
    if (!user || user.role !== "tutor") {
      router.push("/login")
      return
    }

    const fetchFeedback = async () => {
      setLoading(true)
      try {
        // Fetch feedback with session and student details
        const { data, error } = await supabase
          .from("feedback")
          .select(`
            id,
            rating,
            comment,
            created_at,
            sessions!inner (
              subject,
              date,
              time,
              tutor_id,
              profiles!sessions_student_id_fkey (
                name
              )
            )
          `)
          .eq("sessions.tutor_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching feedback:", error)
          return
        }

        // Transform the data
        const transformedFeedback: FeedbackWithSession[] = data.map((item: any) => ({
          id: item.id,
          rating: item.rating,
          comment: item.comment,
          created_at: item.created_at,
          session: {
            subject: item.sessions.subject,
            date: item.sessions.date,
            time: item.sessions.time,
            student: {
              name: item.sessions.profiles.name,
            },
          },
        }))

        setFeedback(transformedFeedback)

        // Calculate statistics
        const ratingsOnly = transformedFeedback.filter((f) => f.rating).map((f) => f.rating!)
        const totalFeedback = transformedFeedback.length
        const averageRating =
          ratingsOnly.length > 0 ? ratingsOnly.reduce((sum, rating) => sum + rating, 0) / ratingsOnly.length : 0

        // Rating distribution
        const distribution = [0, 0, 0, 0, 0]
        ratingsOnly.forEach((rating) => {
          distribution[rating - 1]++
        })

        setStats({
          totalFeedback,
          averageRating,
          ratingDistribution: distribution,
        })
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [user, router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tutor">
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
            <MessageSquare className="h-8 w-8 text-orange-500" />
            Student Feedback
          </h1>
          <p className="text-gray-600">View feedback and ratings from your students</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your feedback...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalFeedback}</div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                </CardContent>
              </Card>
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-orange-600">{stats.averageRating.toFixed(1)}</div>
                    <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                </CardContent>
              </Card>
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2 text-xs">
                        <span className="w-3">{rating}</span>
                        <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-1">
                          <div
                            className="bg-orange-500 h-1 rounded-full"
                            style={{
                              width: `${
                                stats.ratingDistribution[rating - 1] > 0
                                  ? (stats.ratingDistribution[rating - 1] / stats.totalFeedback) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="w-6 text-right">{stats.ratingDistribution[rating - 1]}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Feedback List */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Feedback</h2>
              {feedback.length === 0 ? (
                <Card className="border-orange-100">
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback received yet.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Complete some tutoring sessions to start receiving feedback from students.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {feedback.map((item) => (
                    <Card key={item.id} className="border-orange-100 hover:border-orange-200 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-orange-100 text-orange-600">
                                {item.session.student.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg text-gray-800">{item.session.student.name}</CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <span>{item.session.subject}</span>
                                <span>•</span>
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(item.session.date).toLocaleDateString()}</span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            {item.rating && (
                              <div className="flex items-center gap-1 mb-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < item.rating! ? "fill-orange-400 text-orange-400" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </CardHeader>
                      {item.comment && (
                        <CardContent>
                          <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                            <p className="text-gray-700 italic">"{item.comment}"</p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
