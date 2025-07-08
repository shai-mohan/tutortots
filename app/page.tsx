"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, Star, MapPin, CheckCircle, ArrowRight, GraduationCap, Target, Zap } from "lucide-react"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function HomePage() {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showRegisterModal, setShowRegisterModal] = useState(false)

  const switchToRegister = () => {
    setShowLoginModal(false)
    setShowRegisterModal(true)
  }

  const switchToLogin = () => {
    setShowRegisterModal(false)
    setShowLoginModal(true)
  }

  const featuredTutors = [
    {
      id: "1",
      name: "Dr. Sarah Chen",
      subjects: ["Mathematics", "Physics"],
      rating: 4.9,
      sessions: 150,
      hourlyRate: 80,
      image: "/placeholder-user.jpg",
      location: "Kuala Lumpur",
      verified: true,
    },
    {
      id: "2",
      name: "Prof. Ahmad Rahman",
      subjects: ["Chemistry", "Biology"],
      rating: 4.8,
      sessions: 120,
      hourlyRate: 75,
      image: "/placeholder-user.jpg",
      location: "Petaling Jaya",
      verified: true,
    },
    {
      id: "3",
      name: "Ms. Lisa Wong",
      subjects: ["English", "Malay"],
      rating: 4.9,
      sessions: 200,
      hourlyRate: 60,
      image: "/placeholder-user.jpg",
      location: "Subang Jaya",
      verified: true,
    },
  ]

  const testimonials = [
    {
      name: "Emily Tan",
      role: "SPM Student",
      content: "The tutors here are amazing! My grades improved significantly after just a few sessions.",
      rating: 5,
      image: "/placeholder-user.jpg",
    },
    {
      name: "Marcus Lim",
      role: "STPM Student",
      content: "Flexible scheduling and quality teaching. Highly recommend for anyone preparing for exams.",
      rating: 5,
      image: "/placeholder-user.jpg",
    },
    {
      name: "Priya Sharma",
      role: "University Student",
      content: "The rewards system keeps me motivated, and the tutors are very professional.",
      rating: 5,
      image: "/placeholder-user.jpg",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange to-orange-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-blue-gray">Sunway Tutoring</h1>
              <p className="text-xs text-blue-gray">Excellence in Education</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowLoginModal(true)}
              className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
            >
              Login
            </Button>
            <Button onClick={() => setShowRegisterModal(true)} className="bg-orange hover:bg-orange-600 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-orange-100 text-orange-800 border-orange-200">🎓 Trusted by 1000+ Students</Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-dark-blue-gray mb-6 leading-tight">
              Excel in Your Studies with
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-600">
                {" "}
                Expert Tutors
              </span>
            </h1>
            <p className="text-xl text-blue-gray mb-8 max-w-2xl mx-auto leading-relaxed">
              Connect with qualified tutors, track your progress, and earn rewards while achieving academic excellence.
              Your success story starts here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowRegisterModal(true)}
                className="bg-orange hover:bg-orange-600 text-white px-8 py-4 text-lg"
              >
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent px-8 py-4 text-lg"
              >
                Browse Tutors
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">500+</div>
              <div className="text-blue-gray">Expert Tutors</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">10K+</div>
              <div className="text-blue-gray">Sessions Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">95%</div>
              <div className="text-blue-gray">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-orange mb-2">4.9</div>
              <div className="text-blue-gray">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark-blue-gray mb-4">Why Choose Sunway Tutoring?</h2>
            <p className="text-xl text-blue-gray max-w-2xl mx-auto">
              We provide everything you need for academic success in one comprehensive platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-200 shadow-sm hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-orange" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-gray mb-4">Personalized Learning</h3>
                <p className="text-blue-gray">
                  Get matched with tutors who understand your learning style and academic goals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-orange" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-gray mb-4">Flexible Scheduling</h3>
                <p className="text-blue-gray">
                  Book sessions that fit your schedule with our easy-to-use calendar system.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 shadow-sm hover-lift">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Award className="h-8 w-8 text-orange" />
                </div>
                <h3 className="text-xl font-semibold text-dark-blue-gray mb-4">Rewards System</h3>
                <p className="text-blue-gray">
                  Earn points for every session and redeem them for exciting rewards and vouchers.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Tutors */}
      <section className="py-20 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark-blue-gray mb-4">Meet Our Top Tutors</h2>
            <p className="text-xl text-blue-gray max-w-2xl mx-auto">
              Learn from experienced educators who are passionate about your success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredTutors.map((tutor) => (
              <Card key={tutor.id} className="border-gray-200 shadow-sm hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tutor.image || "/placeholder.svg"} alt={tutor.name} />
                      <AvatarFallback className="bg-orange text-white text-lg">{tutor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-dark-blue-gray">{tutor.name}</h3>
                        {tutor.verified && <CheckCircle className="h-4 w-4 text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-blue-gray">{tutor.rating}</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-blue-gray">{tutor.sessions} sessions</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{tutor.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {tutor.subjects.map((subject) => (
                      <Badge key={subject} variant="outline" className="text-xs border-gray-300 text-blue-gray">
                        {subject}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-orange">RM{tutor.hourlyRate}/hr</span>
                    <Button
                      size="sm"
                      onClick={() => setShowRegisterModal(true)}
                      className="bg-orange hover:bg-orange-600"
                    >
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-dark-blue-gray mb-4">What Our Students Say</h2>
            <p className="text-xl text-blue-gray max-w-2xl mx-auto">
              Real stories from students who achieved their academic goals with us.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-gray-200 shadow-sm hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-blue-gray mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.image || "/placeholder.svg"} alt={testimonial.name} />
                      <AvatarFallback className="bg-orange text-white text-sm">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-dark-blue-gray">{testimonial.name}</div>
                      <div className="text-sm text-blue-gray">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-orange to-orange-600">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Start Your Learning Journey?</h2>
            <p className="text-xl text-orange-100 mb-8">
              Join thousands of students who have already improved their grades with our expert tutors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowRegisterModal(true)}
                className="bg-white text-orange hover:bg-gray-50 px-8 py-4 text-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg"
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-blue-gray text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange to-orange-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Sunway Tutoring</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Empowering students to achieve academic excellence through personalized tutoring and innovative learning
                solutions.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Students</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Find Tutors
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Book Sessions
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Rewards Program
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Track Progress
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Tutors</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Join as Tutor
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Manage Schedule
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Earn Rewards
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Resources
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Account</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>
                  <button onClick={() => setShowLoginModal(true)} className="hover:text-orange transition-colors">
                    Sign In
                  </button>
                </li>
                <li>
                  <button onClick={() => setShowRegisterModal(true)} className="hover:text-orange transition-colors">
                    Create Account
                  </button>
                </li>
                <li>
                  <a href="/about" className="hover:text-orange transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Sunway Tutoring Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-dark-blue-gray">Welcome Back</DialogTitle>
          </DialogHeader>
          <LoginForm onSwitchToRegister={switchToRegister} />
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={showRegisterModal} onOpenChange={setShowRegisterModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-dark-blue-gray">Get Started</DialogTitle>
          </DialogHeader>
          <RegisterForm onSwitchToLogin={switchToLogin} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
