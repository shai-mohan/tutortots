"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Calendar, Star } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "student") {
        router.push("/student")
      } else if (user.role === "tutor") {
        router.push("/tutor")
      }
    }
  }, [user, router])

  if (user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sunway Tutoring Platform</h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect with qualified tutors and enhance your learning experience
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg">
                Register
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Expert Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Connect with verified tutors from various subjects</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Book sessions that fit your schedule</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Peer Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Learn from fellow Sunway students</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Star className="h-12 w-12 mx-auto text-yellow-600 mb-2" />
              <CardTitle>Quality Assured</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Rate and review tutors for quality assurance</CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
