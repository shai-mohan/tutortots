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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" style={{ color: "#FFA500" }} />
              <span className="text-xl font-bold text-gray-900">Tutortots</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-orange-custom transition-colors">
                Features
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-orange-custom transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-orange-custom transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:text-orange-custom hover:bg-orange-50">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-orange-custom hover:bg-orange-600 text-white">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Connect with Expert Tutors at Tutortots</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Enhance your learning experience with qualified tutors from various subjects. Book sessions, get
            personalized help, and achieve academic excellence.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3 bg-orange-custom hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3 border-orange-custom text-orange-custom hover:bg-orange-50 bg-transparent"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow border-orange-100 hover:border-orange-200">
            <CardHeader className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto mb-2" style={{ color: "#FFA500" }} />
              <CardTitle className="text-gray-900">Expert Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Connect with verified tutors from various subjects and academic levels</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-100 hover:border-orange-200">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2" style={{ color: "#FFA500" }} />
              <CardTitle className="text-gray-900">Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Book sessions that fit your schedule with easy calendar integration</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-100 hover:border-orange-200">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto mb-2" style={{ color: "#FFA500" }} />
              <CardTitle className="text-gray-900">Peer Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Learn from fellow students who excel in their subjects</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-orange-100 hover:border-orange-200">
            <CardHeader className="text-center">
              <Star className="h-12 w-12 mx-auto mb-2" style={{ color: "#FFA500" }} />
              <CardTitle className="text-gray-900">Quality Assured</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Rate and review tutors to ensure high-quality learning experiences</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16 border border-orange-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: "#FFA500" }}>
                500+
              </div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: "#FFA500" }}>
                100+
              </div>
              <div className="text-gray-600">Qualified Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2" style={{ color: "#FFA500" }}>
                1000+
              </div>
              <div className="text-gray-600">Sessions Completed</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className="text-center rounded-lg p-12 shadow-lg"
          style={{ background: "linear-gradient(to right, #FFA500, #FF8C00)" }}
        >
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90 text-white">
            Join thousands of students who are already improving their grades
          </p>
          <Link href="/register">
            <Button
              size="lg"
              variant="secondary"
              className="px-8 py-3 bg-white hover:bg-orange-50"
              style={{ color: "#FFA500" }}
            >
              Register Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6" style={{ color: "#FFA500" }} />
                <span className="text-lg font-bold">Tutortots</span>
              </div>
              <p className="text-gray-400">Connecting students with expert tutors for academic success.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/register" className="hover:text-orange-custom transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-orange-custom transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-orange-custom transition-colors">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-orange-custom transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-custom transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-custom transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-orange-custom transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-custom transition-colors">
                    Academic Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-orange-custom transition-colors">
                    Student Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Tutortots. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
