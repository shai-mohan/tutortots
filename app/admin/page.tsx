"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Users, UserCheck, LogOut, CheckCircle, XCircle, ExternalLink, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface User {
  id: string
  name: string
  email: string
  role: "student" | "tutor" | "admin"
  verified: boolean
  subjects?: string[]
  bio?: string
  academicYear?: string
  qualificationDocumentUrl?: string
  qualificationDocumentName?: string
  qualificationDocumentType?: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<{
    url: string
    name: string
    type: string
  } | null>(null)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }

    // Fetch all users
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase.from("profiles").select("*")

        if (error) {
          console.error("Error fetching users:", error)
          return
        }

        setUsers(
          data.map((profile) => ({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: profile.role,
            verified: profile.verified,
            subjects: profile.subjects,
            bio: profile.bio,
            academicYear: profile.academic_year,
            qualificationDocumentUrl: profile.qualification_document_url,
            qualificationDocumentName: profile.qualification_document_name,
            qualificationDocumentType: profile.qualification_document_type,
          })),
        )
      } catch (error) {
        console.error("Error fetching users:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()

    // Set up real-time subscription for profile updates
    const subscription = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          fetchUsers()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, router])

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase.from("profiles").update({ verified: true }).eq("id", userId)

      if (error) {
        toast({
          title: "Approval Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "User Approved",
        description: "User has been verified and can now login",
      })

      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified: true } : u)))
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "Approval Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      // Delete user profile
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

      if (profileError) {
        toast({
          title: "Rejection Failed",
          description: profileError.message,
          variant: "destructive",
        })
        return
      }

      // Delete user auth record
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.error("Error deleting auth user:", authError)
      }

      toast({
        title: "User Rejected",
        description: "User has been removed from the system",
      })

      // Update local state
      setUsers((prev) => prev.filter((u) => u.id !== userId))
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        title: "Rejection Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const viewDocument = (url: string, name: string, type: string) => {
    if (url.startsWith("data:")) {
      // Base64 document - open in new tab
      const newWindow = window.open()
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${name}</title></head>
            <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f5f5f5;">
              ${
                type.includes("pdf")
                  ? `<embed src="${url}" width="100%" height="100%" type="application/pdf" />`
                  : `<img src="${url}" style="max-width:100%; max-height:100%; object-fit:contain;" alt="${name}" />`
              }
            </body>
          </html>
        `)
      }
    } else {
      // Regular URL - open directly
      window.open(url, "_blank")
    }
  }

  const pendingUsers = users.filter((u) => !u.verified && u.role !== "admin")
  const verifiedUsers = users.filter((u) => u.verified && u.role !== "admin")

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{verifiedUsers.length}</div>
                <p className="text-sm text-gray-600">Verified Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {verifiedUsers.filter((u) => u.role === "student").length}
                </div>
                <p className="text-sm text-gray-600">Students</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {verifiedUsers.filter((u) => u.role === "tutor").length}
                </div>
                <p className="text-sm text-gray-600">Tutors</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Pending Approvals</TabsTrigger>
            <TabsTrigger value="verified">Verified Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Pending User Approvals
                </CardTitle>
                <CardDescription>Review and approve new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((pendingUser) => (
                      <div key={pendingUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{pendingUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{pendingUser.name}</h3>
                            <p className="text-sm text-gray-600">{pendingUser.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={pendingUser.role === "student" ? "default" : "secondary"}>
                                {pendingUser.role}
                              </Badge>
                              {pendingUser.role === "student" && pendingUser.academicYear && (
                                <Badge variant="outline">{pendingUser.academicYear}</Badge>
                              )}
                            </div>
                            {pendingUser.role === "tutor" && pendingUser.subjects && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {pendingUser.subjects.map((subject) => (
                                    <Badge key={subject} variant="outline" className="text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {pendingUser.bio && (
                              <p className="text-sm text-gray-600 mt-2 max-w-md">{pendingUser.bio}</p>
                            )}

                            {/* Qualification Document */}
                            {pendingUser.role === "tutor" && pendingUser.qualificationDocumentUrl && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Qualification Document:</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    viewDocument(
                                      pendingUser.qualificationDocumentUrl!,
                                      pendingUser.qualificationDocumentName || "Document",
                                      pendingUser.qualificationDocumentType || "",
                                    )
                                  }
                                  className="text-xs"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  {pendingUser.qualificationDocumentName || "View Document"}
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approveUser(pendingUser.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectUser(pendingUser.id)}>
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="verified">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Verified Users
                </CardTitle>
                <CardDescription>All verified users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No verified users</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifiedUsers.map((verifiedUser) => (
                      <div key={verifiedUser.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>{verifiedUser.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{verifiedUser.name}</h3>
                            <p className="text-sm text-gray-600">{verifiedUser.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={verifiedUser.role === "student" ? "default" : "secondary"}>
                                {verifiedUser.role}
                              </Badge>
                              <Badge variant="outline" className="text-green-600">
                                Verified
                              </Badge>
                              {verifiedUser.role === "student" && verifiedUser.academicYear && (
                                <Badge variant="outline">{verifiedUser.academicYear}</Badge>
                              )}
                            </div>
                            {verifiedUser.role === "tutor" && verifiedUser.subjects && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {verifiedUser.subjects.map((subject) => (
                                    <Badge key={subject} variant="outline" className="text-xs">
                                      {subject}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Qualification Document for verified tutors */}
                            {verifiedUser.role === "tutor" && verifiedUser.qualificationDocumentUrl && (
                              <div className="mt-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    viewDocument(
                                      verifiedUser.qualificationDocumentUrl!,
                                      verifiedUser.qualificationDocumentName || "Document",
                                      verifiedUser.qualificationDocumentType || "",
                                    )
                                  }
                                  className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Qualification
                                  <ExternalLink className="h-3 w-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
