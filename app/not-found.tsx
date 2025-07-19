"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"

// Dynamically import the Lottie player to avoid SSR issues
const Player = dynamic(
  () => import("@lottiefiles/react-lottie-player").then((mod) => ({ default: mod.Player })),
  {
    ssr: false,
    loading: () => (
      <div className="w-48 h-48 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
  }
)

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      {/* Loading Animation */}
      <div className="mb-8">
        <Player
          src="/lottie/loading.json"
          loop
          autoplay
          className="w-48 h-48"
        />
      </div>

      {/* 404 Text */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6">
          Oops! The page you're looking for doesn't exist.
        </p>
      </div>

      {/* Tutortots Brand */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <img src="/logo.png" alt="Tutortots Logo" className="h-8 w-8 object-contain" />
          <span className="text-2xl font-bold text-orange-500">Tutortots</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild className="bg-orange-500 hover:bg-orange-600 text-white">
          <Link href="/">
            Go Home
          </Link>
        </Button>
      </div>
    </div>
  )
} 