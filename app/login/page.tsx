"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to homepage where login modal can be accessed
    router.replace("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange" />
        <p className="text-blue-gray">Redirecting to login...</p>
      </div>
    </div>
  )
}
