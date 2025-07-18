"use client"

import { supabase } from "@/lib/supabase" // adjust path if needed
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
import CountUp from "react-countup"
import Lottie from "lottie-react"
import loadingAnimation from "@/public/lottie/loading.json" // Adjust path if needed

export default function HomePage() {
  const { user } = useAuth()
  const router = useRouter()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const [stats, setStats] = useState({
  students: 0,
  tutors: 0,
  sessions: 0,
})

  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)


  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    fetch("/lottie/loading.json")
      .then((res) => res.json())
      .then(setAnimationData)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => {
        setIsLoading(false)
      }, 500) // match fade duration
    }, 2000) // keep splash for 2s

    return () => clearTimeout(timer)
  }, [])

  const [topTutors, setTopTutors] = useState<any[]>([])

  useEffect(() => {
    const fetchTopTutors = async () => {
    const { data: tutors, error } = await supabase
      .from("profiles")
      .select("id, name, profile_photo_url, subjects, sentiment_rating")
      .eq("role", "tutor")
      .eq("verified", true)
      .gt("sentiment_rating", 0) // Optional: only include tutors with some rating
      .order("sentiment_rating", { ascending: false })
      .limit(4)

    if (error || !tutors) {
      console.error("Error fetching top tutors", error)
      return
    }

    const enrichedTutors = tutors.map((tutor) => ({
      id: tutor.id,
      full_name: tutor.name,
      avatar_url: tutor.profile_photo_url,
      course: tutor.subjects?.[0] || "N/A",
      rating: tutor.sentiment_rating ?? 0,
    }))

    setTopTutors(enrichedTutors)
  }


    fetchTopTutors()
  }, [])

useEffect(() => {
  const fetchStats = async () => {
    const [studentsRes, tutorsRes, sessionsRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "tutor"),
      supabase.from("sessions").select("*", { count: "exact", head: true }),
    ])

    setStats({
      students: studentsRes.count || 0,
      tutors: tutorsRes.count || 0,
      sessions: sessionsRes.count || 0,
    })
  }

  fetchStats()
}, [])


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

  if (isLoading) {
  return (
    <div
  className={`flex items-center justify-center h-screen bg-white transition-all duration-500 ease-in-out transform ${
    fadeOut
      ? "opacity-0 scale-95 blur-sm translate-y-4"
      : "opacity-100 scale-100 blur-0 translate-y-0"
  }`}
>
  <Lottie
    animationData={loadingAnimation}
    loop
    autoplay
    className="w-64 h-64"
  />
</div>

  )
}

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Tutortots Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-dark-blue-gray">Tutortots</span>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-blue-gray hover:text-orange transition-colors">
                Why Us
              </Link>
              <Link href="#top-tutors" className="text-blue-gray hover:text-orange transition-colors">
                Top Tutors
              </Link>
              <Link href="#how-to-start" className="text-blue-gray hover:text-orange transition-colors">
                How To Start
              </Link>
              {/* <Link href="/about" className="text-blue-gray hover:text-orange transition-colors">
                About
              </Link> */}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
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

            {/* Mobile Menu Button (Hamburger) */}
            <div className="md:hidden">
              {/* Add a menu button component here or use a Dialog to show mobile nav */}
            </div>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Background video */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src="/images/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Optional overlay for contrast */}
        <div className="absolute inset-0 bg-black/0 z-10" />

        {/* Foreground content */}
        <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight">
              Connect with Expert Tutors at <span className="text-orange">Tutortots</span>
            </h1>
            <p className="text-lg sm:text-xl text-white mb-8 leading-relaxed max-w-3xl mx-auto">
              Transform your learning journey with personalized tutoring from Sunway University's finest educators.
              Book sessions, get expert help, and achieve academic excellence.
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
                className="px-6 sm:px-8 py-3 border-white text-white hover:bg-white hover:text-orange text-base sm:text-lg bg-transparent"
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
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-orange">
                <CountUp end={stats.students} duration={2} />+
              </div>
              <div className="text-gray-300 text-sm sm:text-base">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-orange">
                <CountUp end={stats.tutors} duration={2} />
              </div>
              <div className="text-gray-300 text-sm sm:text-base">Qualified Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-bold mb-2 text-orange">
                <CountUp end={stats.sessions} duration={2} />
              </div>
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
                      {/* Front face with dimmed image, orange icon, white title */}
                      <div className="absolute inset-0 rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center [backface-visibility:hidden]">
                        {/* Background image + dim overlay */}
                        <div
                          className="absolute inset-0 bg-cover bg-center scale-105"
                          style={{ backgroundImage: `url("/images/feature1.jpg")` }}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        {/* Icon and Title */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="mx-auto rounded-lg mb-2 items-center justify-center">
                            <GraduationCap className="h-8 w-8 text-white" />
                            </div> 
                            <h3 className="text-white text-xl sm:text-2xl font-semibold text-center">
                            Expert Tutors
                          </h3>
                        </div>
                      </div>
                      {/* Back face with description */}
                      <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        Connect with verified tutors from various subjects and academic levels
                      </div>
                    </div>
                  </div>
      
                  <div className="group [perspective:1000px]">
                    <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front face with dimmed image, orange icon, white title */}
                      <div className="absolute inset-0 rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center [backface-visibility:hidden]">
                        {/* Background image + dim overlay */}
                        <div
                          className="absolute inset-0 bg-cover bg-center scale-105"
                          style={{ backgroundImage: `url("/images/feature2.jpg")` }}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        {/* Icon and Title */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="mx-auto rounded-lg mb-2 items-center justify-center">
                            <Calendar className="h-8 w-8 text-white" />
                            </div> 
                            <h3 className="text-white text-xl sm:text-2xl font-semibold text-center">
                            Flexible Scheduling
                          </h3>
                        </div>
                      </div>
                      {/* Back face with description */}
                      <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        Book sessions that fit your schedule with easy calendar integration
                      </div>
                    </div>
                  </div>
      
                  <div className="group [perspective:1000px]">
                    <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front face with dimmed image, orange icon, white title */}
                      <div className="absolute inset-0 rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center [backface-visibility:hidden]">
                        {/* Background image + dim overlay */}
                        <div
                          className="absolute inset-0 bg-cover bg-center scale-105"
                          style={{ backgroundImage: `url("/images/feature3.jpg")` }}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        {/* Icon and Title */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="mx-auto rounded-lg mb-2 items-center justify-center">
                            <Users className="h-8 w-8 text-white" />
                            </div> 
                            <h3 className="text-white text-xl sm:text-2xl font-semibold text-center">
                            Peer Learning
                          </h3>
                        </div>
                      </div>
                      {/* Back face with description */}
                      <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        Learn from fellow students who excel in their subjects
                      </div>
                    </div>
                  </div>
      
                  <div className="group [perspective:1000px]">
                    <div className="relative h-64 w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front face with dimmed image, orange icon, white title */}
                      <div className="absolute inset-0 rounded-xl shadow-md overflow-hidden flex flex-col items-center justify-center [backface-visibility:hidden]">
                        {/* Background image + dim overlay */}
                        <div
                          className="absolute inset-0 bg-cover bg-center scale-105"
                          style={{ backgroundImage: `url("/images/feature4.jpg")` }}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                        {/* Icon and Title */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="mx-auto rounded-lg mb-2 items-center justify-center">
                            <Star className="h-8 w-8 text-white" />
                            </div> 
                            <h3 className="text-white text-xl sm:text-2xl font-semibold text-center">
                            Quality Assured
                          </h3>
                        </div>
                      </div>
                      {/* Back face with description */}
                      <div className="absolute inset-0 bg-white rounded-xl shadow-md flex items-center justify-center px-4 text-center text-blue-gray text-sm [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        Rate and review tutors to ensure high-quality learning experiences
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

      {/* Top Tutors Section */}
      <section id="top-tutors" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-dark-blue-gray mb-4">Meet Our Top Tutors</h2>
            <p className="text-blue-gray text-base sm:text-lg">
              Explore a few of our expert tutors—more waiting inside!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topTutors.map((tutor) => (
              <div
                key={tutor.id}
                onClick={() => setShowLoginModal(true)}
                className="cursor-pointer group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                <img
                  src={tutor.avatar_url || "/images/default-avatar.png"}
                  alt={tutor.full_name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-dark-blue-gray">{tutor.full_name}</h3>
                  <p className="text-sm text-blue-gray">{tutor.course}</p>
                  <div className="flex items-center mt-2 text-orange text-sm">
                    <Star className="w-4 h-4 mr-1" />
                    {tutor.rating.toFixed(1)} / 5
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              className="px-6 py-3 bg-orange hover:bg-orange text-white text-base sm:text-lg"
              onClick={() => setShowLoginModal(true)}
            >
              View More Tutors
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-to-start" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Tutortots Works</h2>
            <p className="text-lg text-gray-600">Simple steps to connect with the perfect tutor</p>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Create Account</h3>
              <p className="text-gray-600">
                Register as a student or tutor with your Sunway University email. All accounts are verified for
                security.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Find Your Match</h3>
              <p className="text-gray-600">
                Browse qualified tutors by subject, rating, and availability. View profiles and read reviews from other
                students.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Book & Learn</h3>
              <p className="text-gray-600">
                Schedule sessions at your convenience. Join online sessions and track your progress with built-in tools.
              </p>
            </Card>
            <Card className="p-8 text-center hover:shadow-lg transition-shadow">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">4. Redeem Rewards</h3>
              <p className="text-gray-600">
                Earn points by joining tutoring sessions and redeem them for exciting rewards in our platform.
              </p>
            </Card>
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
                <img src="/logo.png" alt="Tutortots Logo" className="h-8 w-8 object-contain" />
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
                  <Link href="#features" className="hover:text-orange transition-colors">
                    Why Us
                  </Link>
                </li>
                <li>
                  <Link href="#top-tutors" className="hover:text-orange transition-colors">
                    Top Tutors
                  </Link>
                </li>
                <li>
                  <Link href="#how-to-start" className="hover:text-orange transition-colors">
                    How to Start
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">University</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>
                  <a href=" https://www.sunwayuniversity.edu.my/" target="_blank" rel="noopener noreferrer" className="hover:text-orange transition-colors">
                    Sunway University
                  </a>
                </li>
                <li>
                  <a href="https://elearn.sunway.edu.my/" target="_blank" rel="noopener noreferrer" className="hover:text-orange transition-colors">
                    eLearn - Student Portal
                  </a>
                </li>
                <li>
                  <a href="https://izone.sunway.edu.my/" target="_blank" rel="noopener noreferrer" className="hover:text-orange transition-colors">
                    iZone - Student Portal
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300 text-sm">
            <p>&copy; 2025 Tutortots. All rights reserved.</p>
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