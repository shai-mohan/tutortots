"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState("Testing...")
  const [users, setUsers] = useState<any[]>([])
  const [profiles, setProfiles] = useState<any[]>([])

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from("profiles").select("count").single()

      if (error) {
        setConnectionStatus(`Connection Error: ${error.message}`)
        return
      }

      setConnectionStatus("✅ Connected to Supabase!")

      // Fetch auth users
      const { data: authData } = await supabase.auth.admin.listUsers()
      console.log("Auth users:", authData)

      // Fetch profiles
      const { data: profileData } = await supabase.from("profiles").select("*")
      setProfiles(profileData || [])
    } catch (err) {
      setConnectionStatus(`Error: ${err}`)
    }
  }

  const testLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        alert(`Login failed: ${error.message}`)
        return
      }

      alert(`Login successful for ${email}!`)
      console.log("Login data:", data)
    } catch (err) {
      alert(`Login error: ${err}`)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{connectionStatus}</p>
          <Button onClick={testConnection}>Test Connection</Button>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={() => testLogin("admin@imail.sunway.edu.my", "admin123")}>Test Admin Login</Button>
          <Button onClick={() => testLogin("sarah.johnson@imail.sunway.edu.my", "tutor123")}>Test Tutor Login</Button>
          <Button onClick={() => testLogin("alice.wong@imail.sunway.edu.my", "student123")}>Test Student Login</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Profiles ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {profiles.map((profile) => (
              <div key={profile.id} className="p-2 border rounded">
                <p>
                  <strong>Name:</strong> {profile.name}
                </p>
                <p>
                  <strong>Email:</strong> {profile.email}
                </p>
                <p>
                  <strong>Role:</strong> {profile.role}
                </p>
                <p>
                  <strong>Verified:</strong> {profile.verified ? "✅" : "❌"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
