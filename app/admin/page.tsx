"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  UserCheck,
  LogOut,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Gift,
  Plus,
  Edit,
  Trash2,
  ImageIcon,
} from "lucide-react"
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

interface Reward {
  id: string
  title: string
  description: string
  brand: string
  value_rm: number
  points_required: number
  category: string
  terms_conditions: string
  stock_quantity: number
  image_url?: string
  image_name?: string
  image_type?: string
  image_size?: number
  created_at: string
  updated_at: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [rewardsLoading, setRewardsLoading] = useState(true)
  const [isAddingReward, setIsAddingReward] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  // Form state for reward
  const [rewardForm, setRewardForm] = useState({
    title: "",
    description: "",
    brand: "",
    value_rm: "",
    points_required: "",
    category: "",
    terms_conditions: "",
    stock_quantity: "",
  })

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

    // Fetch all rewards
    const fetchRewards = async () => {
      setRewardsLoading(true)
      try {
        const { data, error } = await supabase.from("rewards").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching rewards:", error)
          return
        }

        setRewards(data || [])
      } catch (error) {
        console.error("Error fetching rewards:", error)
      } finally {
        setRewardsLoading(false)
      }
    }

    fetchUsers()
    fetchRewards()

    // Set up real-time subscription for profile updates
    const profileSubscription = supabase
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

    // Set up real-time subscription for rewards updates
    const rewardsSubscription = supabase
      .channel("rewards-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "rewards",
        },
        () => {
          fetchRewards()
        },
      )
      .subscribe()

    return () => {
      profileSubscription.unsubscribe()
      rewardsSubscription.unsubscribe()
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
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", userId)

      if (profileError) {
        toast({
          title: "Rejection Failed",
          description: profileError.message,
          variant: "destructive",
        })
        return
      }

      const { error: authError } = await supabase.auth.admin.deleteUser(userId)

      if (authError) {
        console.error("Error deleting auth user:", authError)
      }

      toast({
        title: "User Rejected",
        description: "User has been removed from the system",
      })

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
      window.open(url, "_blank")
    }
  }

  const unverifyUser = async (userId: string) => {
    try {
        const { error } = await supabase.from("profiles").update({ verified: false }).eq("id", userId)

        if (error) {
          toast({
            title: "Unverify Failed",
            description: error.message,
            variant: "destructive",
          })
          return
        }

        toast({
          title: "User Unverified",
          description: "User is no longer verified",
        })

        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, verified: false } : u)))
      } catch (error) {
        console.error("Error unverifying user:", error)
        toast({
          title: "Unverify Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }


  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      })
      return
    }

    setSelectedImage(file)

    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const resetRewardForm = () => {
    setRewardForm({
      title: "",
      description: "",
      brand: "",
      value_rm: "",
      points_required: "",
      category: "",
      terms_conditions: "",
      stock_quantity: "",
    })
    setSelectedImage(null)
    setPreviewUrl("")
    setEditingReward(null)
  }

  const openEditReward = (reward: Reward) => {
    setEditingReward(reward)
    setRewardForm({
      title: reward.title,
      description: reward.description,
      brand: reward.brand,
      value_rm: reward.value_rm.toString(),
      points_required: reward.points_required.toString(),
      category: reward.category,
      terms_conditions: reward.terms_conditions,
      stock_quantity: reward.stock_quantity.toString(),
    })
    setPreviewUrl(reward.image_url || "")
    setSelectedImage(null)
  }

  const saveReward = async () => {
    try {
      if (!rewardForm.title || !rewardForm.description || !rewardForm.brand || !rewardForm.category) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      let imageData = {}

      if (selectedImage) {
        const reader = new FileReader()
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(selectedImage)
        })

        const base64 = await base64Promise
        imageData = {
          image_url: base64,
          image_name: selectedImage.name,
          image_type: selectedImage.type,
          image_size: selectedImage.size,
        }
      } else if (editingReward && !previewUrl) {
        imageData = {
          image_url: null,
          image_name: null,
          image_type: null,
          image_size: null,
        }
      }

      const rewardData = {
        title: rewardForm.title,
        description: rewardForm.description,
        brand: rewardForm.brand,
        value_rm: Number.parseFloat(rewardForm.value_rm),
        points_required: Number.parseInt(rewardForm.points_required),
        category: rewardForm.category,
        terms_conditions: rewardForm.terms_conditions,
        stock_quantity: Number.parseInt(rewardForm.stock_quantity) || -1,
        ...imageData,
      }

      let error
      if (editingReward) {
        const result = await supabase.from("rewards").update(rewardData).eq("id", editingReward.id)
        error = result.error
      } else {
        const result = await supabase.from("rewards").insert([rewardData])
        error = result.error
      }

      if (error) {
        toast({
          title: "Save Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: editingReward ? "Reward Updated" : "Reward Added",
        description: `Reward has been ${editingReward ? "updated" : "added"} successfully`,
      })

      resetRewardForm()
      setIsAddingReward(false)
    } catch (error) {
      console.error("Error saving reward:", error)
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const deleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase.from("rewards").delete().eq("id", rewardId)

      if (error) {
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Reward Deleted",
        description: "Reward has been removed successfully",
      })

      setRewards((prev) => prev.filter((r) => r.id !== rewardId))
    } catch (error) {
      console.error("Error deleting reward:", error)
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const pendingUsers = users.filter((u) => !u.verified && u.role !== "admin")
  const verifiedUsers = users.filter((u) => u.verified && u.role !== "admin")

  const getCategoryColor = (category: string) => {
    const colors = {
      food: "bg-orange-100 text-orange-800",
      transport: "bg-blue-100 text-blue-800",
      shopping: "bg-purple-100 text-purple-800",
      entertainment: "bg-pink-100 text-pink-800",
      education: "bg-green-100 text-green-800",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-dark-blue-gray">Admin Dashboard</h1>
            <p className="text-sm text-blue-gray">Manage users, approvals, and rewards</p>
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
                <div className="text-2xl font-bold text-purple-600">{rewards.length}</div>
                <p className="text-sm text-blue-gray">Active Rewards</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="bg-white border border-gray-200">
            <TabsTrigger value="pending" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Pending Approvals
            </TabsTrigger>
            <TabsTrigger value="verified" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Verified Users
            </TabsTrigger>
            <TabsTrigger value="rewards" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Reward Management
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
                            <div className="mt-3 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => unverifyUser(verifiedUser.id)}
                                className="text-xs text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Unverify
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete this user? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => rejectUser(verifiedUser.id)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>

                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-dark-blue-gray">
                      <Gift className="h-5 w-5 text-orange" />
                      Reward Management
                    </CardTitle>
                    <CardDescription className="text-blue-gray">Add, edit, and manage reward vouchers</CardDescription>
                  </div>
                  <Dialog open={isAddingReward} onOpenChange={setIsAddingReward}>
                    <DialogTrigger asChild>
                      <Button className="bg-orange hover:bg-orange-600" onClick={() => resetRewardForm()}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Reward
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{editingReward ? "Edit Reward" : "Add New Reward"}</DialogTitle>
                        <DialogDescription>
                          {editingReward
                            ? "Update the reward details below"
                            : "Fill in the details to create a new reward"}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                              id="title"
                              value={rewardForm.title}
                              onChange={(e) => setRewardForm({ ...rewardForm, title: e.target.value })}
                              placeholder="e.g., Food Voucher"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="brand">Brand *</Label>
                            <Input
                              id="brand"
                              value={rewardForm.brand}
                              onChange={(e) => setRewardForm({ ...rewardForm, brand: e.target.value })}
                              placeholder="e.g., Grab Food"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Textarea
                            id="description"
                            value={rewardForm.description}
                            onChange={(e) => setRewardForm({ ...rewardForm, description: e.target.value })}
                            placeholder="Describe the reward..."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="value_rm">Value (RM) *</Label>
                            <Input
                              id="value_rm"
                              type="number"
                              step="0.01"
                              value={rewardForm.value_rm}
                              onChange={(e) => setRewardForm({ ...rewardForm, value_rm: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="points_required">Points Required *</Label>
                            <Input
                              id="points_required"
                              type="number"
                              value={rewardForm.points_required}
                              onChange={(e) => setRewardForm({ ...rewardForm, points_required: e.target.value })}
                              placeholder="100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stock_quantity">Stock Quantity</Label>
                            <Input
                              id="stock_quantity"
                              type="number"
                              value={rewardForm.stock_quantity}
                              onChange={(e) => setRewardForm({ ...rewardForm, stock_quantity: e.target.value })}
                              placeholder="-1 for unlimited"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={rewardForm.category}
                            onValueChange={(value) => setRewardForm({ ...rewardForm, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="food">Food & Beverage</SelectItem>
                              <SelectItem value="transport">Transport</SelectItem>
                              <SelectItem value="shopping">Shopping</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="terms_conditions">Terms & Conditions</Label>
                          <Textarea
                            id="terms_conditions"
                            value={rewardForm.terms_conditions}
                            onChange={(e) => setRewardForm({ ...rewardForm, terms_conditions: e.target.value })}
                            placeholder="Enter terms and conditions..."
                            rows={3}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Reward Image</Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                            {previewUrl ? (
                              <div className="space-y-2">
                                <img
                                  src={previewUrl || "/placeholder.svg"}
                                  alt="Preview"
                                  className="w-full h-32 object-cover rounded"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setPreviewUrl("")
                                    setSelectedImage(null)
                                  }}
                                >
                                  Remove Image
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center">
                                <ImageIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <label htmlFor="reward-image" className="cursor-pointer">
                                  <span className="text-orange hover:text-orange-600">Click to upload</span>
                                  <span className="text-gray-600"> or drag and drop</span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">JPEG, PNG, WebP up to 2MB</p>
                                <input
                                  id="reward-image"
                                  type="file"
                                  accept="image/jpeg,image/png,image/jpg,image/webp"
                                  onChange={handleImageSelect}
                                  className="hidden"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddingReward(false)}>
                          Cancel
                        </Button>
                        <Button onClick={saveReward} className="bg-orange hover:bg-orange-600">
                          {editingReward ? "Update Reward" : "Add Reward"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {rewardsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-blue-gray">Loading rewards...</div>
                  </div>
                ) : rewards.length === 0 ? (
                  <div className="text-center py-8">
                    <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-blue-gray">No rewards available</p>
                    <p className="text-sm text-gray-500">Add your first reward to get started</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {rewards.map((reward) => (
                      <Card key={reward.id} className="border-gray-200 hover-lift">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {reward.image_url && (
                              <img
                                src={reward.image_url || "/placeholder.svg"}
                                alt={reward.title}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            )}
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-dark-blue-gray line-clamp-1">{reward.title}</h3>
                                <Badge className={getCategoryColor(reward.category)}>{reward.category}</Badge>
                              </div>
                              <p className="text-sm text-blue-gray mb-2">{reward.brand}</p>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-3">{reward.description}</p>

                              <div className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="font-semibold text-orange">RM {reward.value_rm.toFixed(2)}</span>
                                  <span className="text-gray-500 ml-2">{reward.points_required} pts</span>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Stock: {reward.stock_quantity === -1 ? "∞" : reward.stock_quantity}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  openEditReward(reward)
                                  setIsAddingReward(true)
                                }}
                                className="flex-1"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 bg-transparent"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Reward</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{reward.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteReward(reward.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
