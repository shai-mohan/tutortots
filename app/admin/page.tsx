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

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/")
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

  const handleLogout = async () => {
    await logout()
  }

  const pendingUsers = users.filter((u) => !u.verified && u.role !== "admin")
  const verifiedUsers = users.filter((u) => u.verified && u.role !== "admin")

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-blue-gray">Admin Dashboard</h1>
            <p className="text-sm text-blue-gray">Manage user registrations and approvals</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-sm text-blue-gray">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-orange text-white text-xs">{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span>Welcome, {user.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-blue-gray">Loading dashboard...</div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-orange">{pendingUsers.length}</div>
                <p className="text-sm text-blue-gray">Pending Approvals</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-green-600">{verifiedUsers.length}</div>
                <p className="text-sm text-blue-gray">Verified Users</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {verifiedUsers.filter((u) => u.role === "student").length}
                </div>
                <p className="text-sm text-blue-gray">Students</p>
              </CardContent>
            </Card>
            <Card className="border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-dark-blue-gray">
                  {verifiedUsers.filter((u) => u.role === "tutor").length}
                </div>
                <p className="text-sm text-blue-gray">Tutors</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="pending" className="data-[state=active]:bg-orange data-[state=active]:text-white">
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="verified" className="data-[state=active]:bg-orange data-[state=active]:text-white">
              Verified Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                  <UserCheck className="h-5 w-5 text-orange" />
                  Pending User Approvals
                </CardTitle>
                <CardDescription className="text-blue-gray">Review and approve new user registrations</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-gray">No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingUsers.map((pendingUser) => (
                      <div
                        key={pendingUser.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover-lift"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-orange text-white">
                              {pendingUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-dark-blue-gray">{pendingUser.name}</h3>
                            <p className="text-sm text-blue-gray">{pendingUser.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={pendingUser.role === "student" ? "default" : "secondary"}
                                className="bg-gray-100 text-blue-gray"
                              >
                                {pendingUser.role}
                              </Badge>
                              {pendingUser.role === "student" && pendingUser.academicYear && (
                                <Badge variant="outline" className="border-gray-300 text-blue-gray">
                                  {pendingUser.academicYear}
                                </Badge>
                              )}
                            </div>
                            {pendingUser.role === "tutor" && pendingUser.subjects && (
                              <div className="mt-2">
                                <p className="text-xs text-blue-gray mb-1">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {pendingUser.subjects.map((subject) => (
                                    <Badge
                                      key={subject}
                                      variant="outline"
                                      className="text-xs border-gray-300 text-blue-gray"
                                    >
                                      {subject}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {pendingUser.bio && (
                              <p className="text-sm text-blue-gray mt-2 max-w-md line-clamp-2">{pendingUser.bio}</p>
                            )}

                            {/* Qualification Document */}
                            {pendingUser.role === "tutor" && pendingUser.qualificationDocumentUrl && (
                              <div className="mt-2">
                                <p className="text-xs text-blue-gray mb-1">Qualification Document:</p>
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
                                  className="text-xs border-gray-300 text-blue-gray hover:bg-gray-50"
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
                            className="bg-green-600 hover:bg-green-700 text-white"
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
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                  <Users className="h-5 w-5 text-orange" />
                  Verified Users
                </CardTitle>
                <CardDescription className="text-blue-gray">All verified users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                {verifiedUsers.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-blue-gray">No verified users</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verifiedUsers.map((verifiedUser) => (
                      <div
                        key={verifiedUser.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover-lift"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-orange text-white">
                              {verifiedUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-dark-blue-gray">{verifiedUser.name}</h3>
                            <p className="text-sm text-blue-gray">{verifiedUser.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={verifiedUser.role === "student" ? "default" : "secondary"}
                                className="bg-gray-100 text-blue-gray"
                              >
                                {verifiedUser.role}
                              </Badge>
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                Verified
                              </Badge>
                              {verifiedUser.role === "student" && verifiedUser.academicYear && (
                                <Badge variant="outline" className="border-gray-300 text-blue-gray">
                                  {verifiedUser.academicYear}
                                </Badge>
                              )}
                            </div>
                            {verifiedUser.role === "tutor" && verifiedUser.subjects && (
                              <div className="mt-2">
                                <p className="text-xs text-blue-gray mb-1">Subjects:</p>
                                <div className="flex flex-wrap gap-1">
                                  {verifiedUser.subjects.map((subject) => (
                                    <Badge
                                      key={subject}
                                      variant="outline"
                                      className="text-xs border-gray-300 text-blue-gray"
                                    >
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
