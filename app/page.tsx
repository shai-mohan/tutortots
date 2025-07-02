"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Users,
  Calendar,
  Star,
  BookOpen,
  Award,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react"
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
    <div className="min-h-screen bg-gradient-mesh">
      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-20">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <GraduationCap className="h-10 w-10 text-orange-500 animate-float" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gradient">Tutortots</span>
                <div className="text-xs text-gray-600 font-medium">Learn • Grow • Excel</div>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
                Features
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
                About
              </Link>
              <Link href="#testimonials" className="text-gray-700 hover:text-orange-500 transition-colors font-medium">
                Reviews
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:text-orange-500 hover:bg-orange-50 font-medium">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-orange text-white hover:shadow-lg hover:scale-105 transition-all duration-300 btn-glow font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-blue-50/50"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-orange-100 text-orange-700 border-orange-200 px-4 py-2 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Trusted by 1000+ Students
            </Badge>
            <h1 className="text-responsive-xl font-bold text-gray-900 mb-8 leading-tight">
              Connect with Expert Tutors at{" "}
              <span className="text-gradient relative">
                Tutortots
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-orange rounded-full"></div>
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transform your learning journey with personalized tutoring from Sunway University's finest educators. Book
              sessions, get expert help, and achieve academic excellence like never before.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-10 py-4 bg-gradient-orange text-white hover:shadow-xl hover:scale-105 transition-all duration-300 btn-glow text-lg font-semibold"
                >
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-10 py-4 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 bg-white/80 backdrop-blur-sm text-lg font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full opacity-20 animate-float"></div>
          <div
            className="absolute top-40 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 animate-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-20 left-20 w-12 h-12 bg-purple-200 rounded-full opacity-20 animate-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200 px-4 py-2">Why Choose Us</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything You Need to <span className="text-gradient">Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our platform combines cutting-edge technology with expert tutoring to deliver an unmatched learning
              experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-orange rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Expert Tutors</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Connect with verified tutors from various subjects and academic levels with proven track records
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-blue rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Smart Scheduling</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Book sessions that fit your schedule with intelligent calendar integration and instant confirmations
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-purple rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Peer Learning</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Learn from fellow students who excel in their subjects and understand your academic journey
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">Quality Assured</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-600 leading-relaxed">
                  Rate and review tutors to ensure high-quality learning experiences for the entire community
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-orange relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Trusted by Students Worldwide</h2>
            <p className="text-orange-100 text-lg">Join thousands who have transformed their academic journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center glass-dark rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2 text-white animate-pulse-glow">500+</div>
              <div className="text-orange-100 font-medium">Active Students</div>
              <div className="text-orange-200 text-sm mt-2">Growing daily</div>
            </div>
            <div className="text-center glass-dark rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2 text-white animate-pulse-glow">100+</div>
              <div className="text-orange-100 font-medium">Qualified Tutors</div>
              <div className="text-orange-200 text-sm mt-2">Expert educators</div>
            </div>
            <div className="text-center glass-dark rounded-2xl p-8">
              <div className="text-5xl font-bold mb-2 text-white animate-pulse-glow">1000+</div>
              <div className="text-orange-100 font-medium">Sessions Completed</div>
              <div className="text-orange-200 text-sm mt-2">Success stories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 px-4 py-2">
                Platform Benefits
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Students Choose <span className="text-gradient">Tutortots</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Experience the difference with our comprehensive learning platform designed specifically for academic
                success.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Verified Excellence</h3>
                    <p className="text-gray-600">
                      All tutors are verified Sunway University students or faculty with proven academic credentials and
                      teaching experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Flexible Learning</h3>
                    <p className="text-gray-600">
                      Book sessions that fit your schedule with easy rescheduling, cancellation options, and 24/7
                      platform access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
                    <p className="text-gray-600">
                      See immediate improvement in your understanding with personalized teaching methods and real-time
                      feedback.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <Card className="card-hover bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <BookOpen className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">50+</div>
                    <div className="text-sm text-gray-600">Subjects Available</div>
                  </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg mt-8">
                  <CardContent className="p-6 text-center">
                    <Award className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">4.8/5</div>
                    <div className="text-sm text-gray-600">Average Rating</div>
                  </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg -mt-4">
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">95%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </CardContent>
                </Card>

                <Card className="card-hover bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg mt-4">
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
                    <div className="text-sm text-gray-600">Platform Access</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-white/10 text-white border-white/20 px-6 py-3 text-lg backdrop-blur-sm">
              <Sparkles className="w-5 h-5 mr-2" />
              Ready to Excel?
            </Badge>
            <h2 className="text-5xl font-bold mb-6 text-white leading-tight">Transform Your Academic Journey</h2>
            <p className="text-xl mb-10 opacity-90 text-gray-200 leading-relaxed max-w-2xl mx-auto">
              Join thousands of Sunway University students who are already achieving their academic goals with
              personalized tutoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-12 py-4 bg-gradient-orange text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 btn-glow text-lg font-semibold"
                >
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-12 py-4 border-2 border-white/30 text-white hover:bg-white/10 bg-white/5 backdrop-blur-sm text-lg font-semibold"
                >
                  Sign In Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <GraduationCap className="h-8 w-8 text-orange-400" />
                <div>
                  <span className="text-xl font-bold">Tutortots</span>
                  <div className="text-xs text-gray-400">Learn • Grow • Excel</div>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Empowering Sunway University students with personalized tutoring experiences for academic excellence.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-lg">Platform</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/register" className="hover:text-orange-400 transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-orange-400 transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-orange-400 transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-orange-400 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-6 text-lg">University</h3>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Sunway University
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Academic Calendar
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Student Portal
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Library
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2024 Tutortots. All rights reserved. Made with ❤️ for Sunway University students.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
