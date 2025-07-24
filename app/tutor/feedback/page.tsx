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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"

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
  const [sentimentStats, setSentimentStats] = useState({
    sentimentRating: 0,
    totalSentimentFeedback: 0,
  })
  // Pagination, search, filter state
  const [search, setSearch] = useState("")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 5
  // Use tutor's subjects from user object
  const subjects = Array.isArray(user?.subjects) ? user.subjects : []

  useEffect(() => {
    if (!user || user.role !== "tutor") {
      router.push("/")
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
        // Fetch sentiment rating from tutor's profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("sentiment_rating, sentiment_total_ratings")
        .eq("id", user.id)
        .single()

      if (!profileError && profile) {
        setSentimentStats({
          sentimentRating: profile.sentiment_rating ?? 0,
          totalSentimentFeedback: profile.sentiment_total_ratings ?? 0,
        })
      }
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [user, router])

  // Filtered and paginated feedback
  const filteredFeedback = feedback.filter((item) => {
    const matchesSearch = item.session.student.name
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesSubject =
      subjectFilter === "all" || item.session.subject === subjectFilter
    return matchesSearch && matchesSubject
  })
  const totalPages = Math.ceil(filteredFeedback.length / pageSize) || 1
  const paginatedFeedback = filteredFeedback.slice(
    (page - 1) * pageSize,
    page * pageSize
  )
  // Reset to page 1 if filter/search changes
  useEffect(() => {
    setPage(1)
  }, [search, subjectFilter])

  // Calculate unique students for feedback
  const uniqueStudentCount = new Set(feedback.map(f => f.session.student.name)).size

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
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

      <main className="container mx-auto px-4 py-8 md:px-8 lg:px-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-orange-500" />
            Student Feedback
          </h1>
          <p className="text-gray-600">View feedback and ratings from your students</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-sm"
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-full text-sm">
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
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your feedback...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-orange-600">
                      {sentimentStats.sentimentRating.toFixed(1)}
                    </div>
                    <Star className="h-5 w-5 fill-orange-400 text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-600">Average Sentiment Analysis Rating</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {sentimentStats.totalSentimentFeedback} text feedback{sentimentStats.totalSentimentFeedback !== 1 ? "s" : ""}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-orange-100">
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-orange-600">{uniqueStudentCount}</div>
                  <p className="text-sm text-gray-600">Unique Students Gave Feedback</p>
                </CardContent>
              </Card>
            </div>

            {/* Feedback List */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Feedback</h2>
              {filteredFeedback.length === 0 ? (
                <Card className="border-orange-100">
                  <CardContent className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No feedback found.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Try adjusting your search or filter.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {paginatedFeedback.map((item) => (
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
                                    className={`h-4 w-4 ${i < item.rating! ? "fill-orange-400 text-orange-400" : "text-gray-300"}`}
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
                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-6 flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPage((p) => Math.max(1, p - 1))
                              }}
                              aria-disabled={page === 1}
                            />
                          </PaginationItem>
                          {Array.from({ length: totalPages }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={page === i + 1}
                                onClick={(e) => {
                                  e.preventDefault()
                                  setPage(i + 1)
                                }}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                setPage((p) => Math.min(totalPages, p + 1))
                              }}
                              aria-disabled={page === totalPages}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
