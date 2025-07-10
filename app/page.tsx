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
                className="px-6 sm:px-8 py-3 border-blue-gray text-blue-gray hover:bg-blue-gray hover:text-orange text-base sm:text-lg bg-transparent"
                onClick={() => setShowLoginModal(true)}
              >
                Sign In
              </Button>
            </div>
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
            <div className="group [perspective:1000px]">
              <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex flex-col items-center justify-center [backface-visibility:hidden]">
                  <div className="w-12 h-12 mb-4 bg-orange rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-dark-blue-gray font-semibold text-lg">Expert Tutors</h3>
                </div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  Connect with verified tutors from various subjects and academic levels
                </div>
              </div>
            </div>

            <div className="group [perspective:1000px]">
              <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex flex-col items-center justify-center [backface-visibility:hidden]">
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-gray rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-dark-blue-gray font-semibold text-lg">Flexible Scheduling</h3>
                </div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  Book sessions that fit your schedule with easy calendar integration
                </div>
              </div>
            </div>

            <div className="group [perspective:1000px]">
              <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex flex-col items-center justify-center [backface-visibility:hidden]">
                  <div className="w-12 h-12 mx-auto mb-4 bg-dark-blue-gray rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-dark-blue-gray font-semibold text-lg">Peer Learning</h3>
                </div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  Learn from fellow students who excel in their subjects
                </div>
              </div>
            </div>

            <div className="group [perspective:1000px]">
              <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex flex-col items-center justify-center [backface-visibility:hidden]">
                  <div className="w-12 h-12 mx-auto mb-4 bg-orange rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-dark-blue-gray font-semibold text-lg">Quality Assured</h3>
                </div>
                <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  Rate and review tutors to ensure high-quality learning experiences
                </div>
              </div>
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
