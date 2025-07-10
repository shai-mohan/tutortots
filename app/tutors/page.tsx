"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Tutor {
  id: string
  name: string
  email: string
  bio: string
  subjects: string[]
  profile_photo_url?: string
  rating: number
  totalRatings: number
}

export default function TutorsPage() {
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchTutors = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "tutor")
        .eq("verified", true)

      if (error) {
        console.error("Error loading tutors", error)
      } else {
        // Optionally fetch ratings
        const tutorRatings = await Promise.all(
          data.map(async (tutor) => {
            const { data: feedbackData } = await supabase
              .from("feedback")
              .select("rating, sessions!inner(tutor_id)")
              .eq("sessions.tutor_id", tutor.id)

            const ratings = feedbackData?.filter((f) => f.rating !== null).map((f) => f.rating!) || []
            const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
            return {
              ...tutor,
              rating: avg,
              totalRatings: ratings.length,
            }
          })
        )

        setTutors(tutorRatings)
      }
      setLoading(false)
    }

    fetchTutors()
  }, [])

  const handleLoginPrompt = () => {
    // Replace this with your login modal trigger add a message to user to ask them to login or register
    alert("Please log in or register to book a tutor.")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Tutortots</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900">Home</Link>
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/tutors" className="text-blue-600 font-medium">Tutors</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleLoginPrompt}>Login</Button>
              <Button onClick={handleLoginPrompt}>Register</Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Tutors List */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Meet Our Tutors</h2>
          {loading ? (
            <p className="text-center text-gray-600">Loading tutors...</p>
          ) : (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tutors.map((tutor) => (
              <Card
                key={tutor.id}
                className="flex flex-col justify-between h-full p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div>
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tutor.profile_photo_url || "/placeholder.svg"} />
                      <AvatarFallback>{tutor.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{tutor.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm mt-1">
                        <Star className="w-4 h-4 fill-yellow-400" />
                        <span>{tutor.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({tutor.totalRatings})</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{tutor.bio}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutor.subjects?.slice(0, 3).map((subject) => (
                      <span
                        key={subject}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleLoginPrompt}
                  className="mt-auto w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Book This Tutor
                </Button>
              </Card>
            ))}
          </div>

          )}
        </div>
      </section>
    </div>
  )
}
