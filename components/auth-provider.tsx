"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "tutor" | "admin"
  verified: boolean
  profileImage?: string
  bio?: string
  subjects?: string[]
  academicYear?: string
  rating?: number
  totalRatings?: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (userData: any) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Check for stored user session in Supabase
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // Get user profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUser({
            id: session.user.id,
            name: profile.name,
            email: session.user.email!,
            role: profile.role,
            verified: profile.verified,
            bio: profile.bio,
            subjects: profile.subjects,
            academicYear: profile.academic_year,
            rating: profile.rating,
            totalRatings: profile.total_ratings,
            profileImage: profile.profile_image,
          })
        }
      }
    }

    checkSession()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Get user profile data
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

        if (profile) {
          setUser({
            id: session.user.id,
            name: profile.name,
            email: session.user.email!,
            role: profile.role,
            verified: profile.verified,
            bio: profile.bio,
            subjects: profile.subjects,
            academicYear: profile.academic_year,
            rating: profile.rating,
            totalRatings: profile.total_ratings,
            profileImage: profile.profile_image,
          })
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (data.user) {
        // Check if user is verified
        const { data: profile } = await supabase.from("profiles").select("verified").eq("id", data.user.id).single()

        if (!profile || !profile.verified) {
          toast({
            title: "Account not verified",
            description: "Your account is pending approval by an administrator.",
            variant: "destructive",
          })
          await supabase.auth.signOut()
          return false
        }

        return true
      }

      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (userData: any): Promise<boolean> => {
    try {
      // Check if email is institutional
      if (!userData.email.endsWith("@imail.sunway.edu.my")) {
        toast({
          title: "Invalid email",
          description: "Please use your institutional email (@imail.sunway.edu.my)",
          variant: "destructive",
        })
        return false
      }

      // Register user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        })
        return false
      }

      if (data.user) {
        // Create profile record
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          verified: false,
          academic_year: userData.academicYear || null,
          subjects: userData.subjects || null,
          bio: userData.bio || null,
          rating: 0,
          total_ratings: 0,
        })

        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          })
          return false
        }

        // Sign out after registration since they need to be verified
        await supabase.auth.signOut()
        return true
      }

      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return

    try {
      // Update profile in database
      const { error } = await supabase
        .from("profiles")
        .update({
          name: userData.name || user.name,
          academic_year: userData.academicYear || user.academicYear,
          subjects: userData.subjects || user.subjects,
          bio: userData.bio || user.bio,
        })
        .eq("id", user.id)

      if (error) {
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Update local state
      setUser({ ...user, ...userData })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error) {
      console.error("Update error:", error)
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  return <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
