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
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Tutortots</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register">
                <Button>Register</Button>
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
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <GraduationCap className="h-12 w-12 mx-auto text-blue-600 mb-2" />
              <CardTitle>Expert Tutors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Connect with verified tutors from various subjects and academic levels</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-green-600 mb-2" />
              <CardTitle>Flexible Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Book sessions that fit your schedule with easy calendar integration</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 mx-auto text-purple-600 mb-2" />
              <CardTitle>Peer Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Learn from fellow students who excel in their subjects</CardDescription>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Star className="h-12 w-12 mx-auto text-yellow-600 mb-2" />
              <CardTitle>Quality Assured</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Rate and review tutors to ensure high-quality learning experiences</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600 mb-2">100+</div>
              <div className="text-gray-600">Qualified Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
              <div className="text-gray-600">Sessions Completed</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-blue-600 text-white rounded-lg p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of students who are already improving their grades</p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="px-8 py-3">
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
                <GraduationCap className="h-6 w-6" />
                <span className="text-lg font-bold">Tutortots</span>
              </div>
              <p className="text-gray-400">Connecting students with expert tutors for academic success.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/register" className="hover:text-white">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
                    Academic Support
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white">
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
