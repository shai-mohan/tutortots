"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Users, Calendar, Star, BookOpen, Shield, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

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
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <GraduationCap className="h-8 w-8 text-orange" />
              <span className="text-xl font-bold text-dark-blue-gray">Tutortots</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-blue-gray hover:text-orange transition-colors">
                Features
              </Link>
              <Link href="/about" className="text-blue-gray hover:text-orange transition-colors">
                About
              </Link>
              <Link href="#contact" className="text-blue-gray hover:text-orange transition-colors">
                Contact
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-blue-gray hover:text-orange"
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </Button>
              <Button className="bg-orange hover:bg-orange text-white" onClick={() => setShowRegisterModal(true)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-dark-blue-gray mb-6 leading-tight">
              Connect with Expert Tutors at <span className="text-orange">Tutortots</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-gray mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform your learning journey with personalized tutoring from Sunway University's finest educators. Book
              sessions, get expert help, and achieve academic excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
              <Button
                size="lg"
                className="px-6 sm:px-8 py-3 bg-orange hover:bg-orange text-white text-base sm:text-lg"
                onClick={() => setShowRegisterModal(true)}
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-6 sm:px-8 py-3 border-blue-gray text-blue-gray hover:bg-blue-gray hover:text-white text-base sm:text-lg bg-transparent"
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue-gray mb-4">Why Choose Tutortots</h2>
            <p className="text-lg sm:text-xl text-blue-gray max-w-2xl mx-auto">
              Everything you need for academic success in one platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card className="card-clean text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-dark-blue-gray text-lg">Expert Tutors</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-gray text-sm">
                  Connect with verified tutors from various subjects and academic levels
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-blue-gray rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-dark-blue-gray text-lg">Flexible Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-gray text-sm">
                  Book sessions that fit your schedule with easy calendar integration
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-dark-blue-gray rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-dark-blue-gray text-lg">Peer Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-gray text-sm">
                  Learn from fellow students who excel in their subjects
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-clean text-center">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-dark-blue-gray text-lg">Quality Assured</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-blue-gray text-sm">
                  Rate and review tutors to ensure high-quality learning experiences
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-dark-blue-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Trusted by Students</h2>
            <p className="text-gray-300 text-base sm:text-lg">
              Join thousands who have transformed their academic journey
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-orange">500+</div>
              <div className="text-gray-300 text-sm sm:text-base">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-orange">100+</div>
              <div className="text-gray-300 text-sm sm:text-base">Qualified Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-orange">1000+</div>
              <div className="text-gray-300 text-sm sm:text-base">Sessions Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue-gray mb-6">Why Students Choose Tutortots</h2>
              <p className="text-lg sm:text-xl text-blue-gray mb-8">
                Experience the difference with our comprehensive learning platform designed for academic success.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue-gray mb-2">Verified Excellence</h3>
                    <p className="text-blue-gray text-sm sm:text-base">
                      All tutors are verified Sunway University students or faculty with proven credentials.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-gray rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue-gray mb-2">Flexible Learning</h3>
                    <p className="text-blue-gray text-sm sm:text-base">
                      Book sessions that fit your schedule with easy rescheduling and 24/7 access.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-dark-blue-gray rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark-blue-gray mb-2">Comprehensive Support</h3>
                    <p className="text-blue-gray text-sm sm:text-base">
                      Get help across 50+ subjects with personalized teaching methods.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:max-w-none">
              <Card className="card-clean text-center p-4 sm:p-6">
                <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-orange mx-auto mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-dark-blue-gray mb-1">50+</div>
                <div className="text-xs sm:text-sm text-blue-gray">Subjects</div>
              </Card>

              <Card className="card-clean text-center p-4 sm:p-6 mt-4 sm:mt-8">
                <Star className="h-6 w-6 sm:h-8 sm:w-8 text-orange mx-auto mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-dark-blue-gray mb-1">4.8/5</div>
                <div className="text-xs sm:text-sm text-blue-gray">Rating</div>
              </Card>

              <Card className="card-clean text-center p-4 sm:p-6 -mt-2 sm:-mt-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange mx-auto mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-dark-blue-gray mb-1">95%</div>
                <div className="text-xs sm:text-sm text-blue-gray">Success Rate</div>
              </Card>

              <Card className="card-clean text-center p-4 sm:p-6 mt-2 sm:mt-4">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange mx-auto mb-3" />
                <div className="text-xl sm:text-2xl font-bold text-dark-blue-gray mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-blue-gray">Access</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-dark-blue-gray mb-6">
            Ready to Start Learning?
          </h2>
          <p className="text-lg sm:text-xl text-blue-gray mb-8 max-w-2xl mx-auto">
            Join thousands of Sunway University students who are already achieving their academic goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto sm:max-w-none">
            <Button
              size="lg"
              className="px-6 sm:px-8 py-3 bg-orange hover:bg-orange text-white text-base sm:text-lg"
              onClick={() => setShowRegisterModal(true)}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-6 sm:px-8 py-3 border-blue-gray text-blue-gray hover:bg-blue-gray hover:text-white text-base sm:text-lg bg-transparent"
              onClick={() => setShowLoginModal(true)}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-blue-gray text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-6 w-6 text-orange" />
                <span className="text-lg font-bold">Tutortots</span>
              </div>
              <p className="text-gray-300 text-sm">
                Connecting Sunway University students with qualified tutors for academic success.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <Link href="/register" className="hover:text-orange transition-colors">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-orange transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="hover:text-orange transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-orange transition-colors">
                    About
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">University</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Sunway University
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Academic Calendar
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Student Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300 text-sm">
            <p>&copy; 2024 Tutortots. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <LoginForm
            onSuccess={() => setShowLoginModal(false)}
            onSwitchToRegister={() => {
              setShowLoginModal(false)
              setShowRegisterModal(true)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <RegisterForm
            onSuccess={() => setShowRegisterModal(false)}
            onSwitchToLogin={() => {
              setShowRegisterModal(false)
              setShowLoginModal(true)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
