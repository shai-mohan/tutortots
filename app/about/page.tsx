import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Users, Calendar, Star, Shield, Clock, BookOpen, Award } from "lucide-react"

export default function AboutPage() {
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
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/about" className="text-blue-600 font-medium">
                About
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-gray-900">
                Contact
              </Link>
            </div>
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
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">Tutortots</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Empowering students to achieve academic excellence through personalized tutoring connections at Sunway
            University.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Tutortots, we believe that every student deserves access to quality education and personalized
                learning support. Our platform bridges the gap between students seeking academic help and qualified
                tutors ready to share their expertise.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We're committed to creating a safe, reliable, and efficient environment where learning thrives and
                academic goals are achieved.
              </p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Verified Tutors</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Flexible Scheduling</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">500+</h3>
                <p className="text-sm text-gray-600">Active Students</p>
              </Card>
              <Card className="p-6 text-center">
                <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">100+</h3>
                <p className="text-sm text-gray-600">Qualified Tutors</p>
              </Card>
              <Card className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">50+</h3>
                <p className="text-sm text-gray-600">Subjects Covered</p>
              </Card>
              <Card className="p-6 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">4.8/5</h3>
                <p className="text-sm text-gray-600">Average Rating</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How Tutortots Works</h2>
            <p className="text-lg text-gray-600">Simple steps to connect with the perfect tutor</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Tutortots?</h2>
            <p className="text-lg text-gray-600">Features designed to enhance your learning experience</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Verified Tutors</h3>
                <p className="text-gray-600">
                  All tutors are verified Sunway University students or faculty with proven academic credentials.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
                <p className="text-gray-600">
                  Book sessions that fit your schedule with easy rescheduling and cancellation options.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Rating System</h3>
                <p className="text-gray-600">
                  Transparent rating and review system helps you choose the best tutors for your needs.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Wide Subject Range</h3>
                <p className="text-gray-600">
                  From Mathematics to Computer Science, find tutors for all major subjects and specializations.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-red-100 p-3 rounded-lg">
                <Award className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Assurance</h3>
                <p className="text-gray-600">
                  Admin-moderated platform ensures high-quality tutoring experiences for all users.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-indigo-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Community Focused</h3>
                <p className="text-gray-600">
                  Built specifically for the Sunway University community by students, for students.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
                <p className="text-gray-600">
                  We strive for excellence in education by connecting students with the most qualified and passionate
                  tutors.
                </p>
              </CardContent>
            </Card>
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Trust</h3>
                <p className="text-gray-600">
                  Building a trustworthy platform where students and tutors can connect safely and confidently.
                </p>
              </CardContent>
            </Card>
            <Card className="p-8 text-center">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Community</h3>
                <p className="text-gray-600">
                  Fostering a supportive learning community where knowledge sharing and academic growth flourish.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Sunway University students who are already improving their grades with Tutortots.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Get Started Today
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">Tutortots</span>
              </div>
              <p className="text-gray-400">
                Connecting Sunway University students with qualified tutors for academic success.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About
                  </Link>
                </li>
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
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">University</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Sunway University
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Academic Calendar
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Student Portal
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Library
                  </a>
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
