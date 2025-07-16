"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Edit, Trash2, Clock, CalendarDays, Repeat } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Availability {
  id: string
  tutor_id: string
  subject: string
  availability_type: "recurring" | "specific_date"
  day_of_week?: number
  specific_date?: string
  start_time: string
  end_time: string
  is_active: boolean
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
  "21:30",
  "22:00",
]

export default function TutorAvailability() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null)
  const [activeTab, setActiveTab] = useState("recurring")
  const [formData, setFormData] = useState({
    subject: "",
    availability_type: "recurring" as "recurring" | "specific_date",
    day_of_week: "",
    specific_date: "",
    start_time: "",
    end_time: "",
  })

  useEffect(() => {
    if (!user || user.role !== "tutor") {
      router.push("/")
      return
    }

    fetchAvailability()
  }, [user, router])

  const fetchAvailability = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("tutor_availability")
        .select("*")
        .eq("tutor_id", user!.id)
        .eq("is_active", true)
        .order("availability_type")
        .order("day_of_week")
        .order("specific_date")
        .order("start_time")

      if (error) {
        console.error("Error fetching availability:", error)
        toast({
          title: "Error",
          description: "Failed to load availability",
          variant: "destructive",
        })
        return
      }

      setAvailability(data || [])
    } catch (error) {
      console.error("Error fetching availability:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.subject || !formData.start_time || !formData.end_time) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (formData.availability_type === "recurring" && !formData.day_of_week) {
      toast({
        title: "Missing Information",
        description: "Please select a day of the week for recurring availability",
        variant: "destructive",
      })
      return
    }

    if (formData.availability_type === "specific_date" && !formData.specific_date) {
      toast({
        title: "Missing Information",
        description: "Please select a specific date",
        variant: "destructive",
      })
      return
    }

    if (formData.start_time >= formData.end_time) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    // Check if specific date is in the past
    if (formData.availability_type === "specific_date") {
      const selectedDate = new Date(formData.specific_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (selectedDate < today) {
        toast({
          title: "Invalid Date",
          description: "Cannot set availability for past dates",
          variant: "destructive",
        })
        return
      }
    }

    try {
      const availabilityData = {
        tutor_id: user!.id,
        subject: formData.subject,
        availability_type: formData.availability_type,
        day_of_week: formData.availability_type === "recurring" ? Number.parseInt(formData.day_of_week) : null,
        specific_date: formData.availability_type === "specific_date" ? formData.specific_date : null,
        start_time: formData.start_time,
        end_time: formData.end_time,
        is_active: true,
      }

      let error

      if (editingAvailability) {
        const { error: updateError } = await supabase
          .from("tutor_availability")
          .update(availabilityData)
          .eq("id", editingAvailability.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase.from("tutor_availability").insert(availabilityData)
        error = insertError
      }

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: editingAvailability ? "Availability updated" : "Availability added",
      })

      setShowAddDialog(false)
      setEditingAvailability(null)
      setFormData({
        subject: "",
        availability_type: "recurring",
        day_of_week: "",
        specific_date: "",
        start_time: "",
        end_time: "",
      })
      fetchAvailability()
    } catch (error) {
      console.error("Error saving availability:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (item: Availability) => {
    setEditingAvailability(item)
    setFormData({
      subject: item.subject,
      availability_type: item.availability_type,
      day_of_week: item.day_of_week?.toString() || "",
      specific_date: item.specific_date || "",
      start_time: item.start_time,
      end_time: item.end_time,
    })
    setShowAddDialog(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("tutor_availability").update({ is_active: false }).eq("id", id)

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Availability removed",
      })

      fetchAvailability()
    } catch (error) {
      console.error("Error deleting availability:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const getDayName = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find((day) => day.value === dayOfWeek)?.label || "Unknown"
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const recurringAvailability = availability.filter((item) => item.availability_type === "recurring")
  const specificDateAvailability = availability.filter((item) => item.availability_type === "specific_date")

  const groupedRecurring = recurringAvailability.reduce(
    (acc, item) => {
      if (!acc[item.subject]) {
        acc[item.subject] = []
      }
      acc[item.subject].push(item)
      return acc
    },
    {} as Record<string, Availability[]>,
  )

  const groupedSpecific = specificDateAvailability.reduce(
    (acc, item) => {
      if (!acc[item.subject]) {
        acc[item.subject] = []
      }
      acc[item.subject].push(item)
      return acc
    },
    {} as Record<string, Availability[]>,
  )

  // Get minimum date (today)
  const today = new Date()
  const minDate = today.toISOString().split("T")[0]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/tutor">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-dark-blue-gray">Availability Management</h1>
                <p className="text-sm text-blue-gray">Set your available times and specific dates</p>
              </div>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button
                  className="bg-orange hover:bg-orange text-white"
                  onClick={() => {
                    setEditingAvailability(null)
                    setFormData({
                      subject: "",
                      availability_type: "recurring",
                      day_of_week: "",
                      specific_date: "",
                      start_time: "",
                      end_time: "",
                    })
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Availability
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingAvailability ? "Edit Availability" : "Add Availability"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-blue-gray">Subject</label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData({ ...formData, subject: value })}
                    >
                      <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.subjects?.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-blue-gray">Availability Type</label>
                    <Select
                      value={formData.availability_type}
                      onValueChange={(value: "recurring" | "specific_date") =>
                        setFormData({
                          ...formData,
                          availability_type: value,
                          day_of_week: "",
                          specific_date: "",
                        })
                      }
                    >
                      <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recurring">
                          <div className="flex items-center gap-2">
                            <Repeat className="h-4 w-4" />
                            Recurring Weekly
                          </div>
                        </SelectItem>
                        <SelectItem value="specific_date">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Specific Date
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.availability_type === "recurring" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-dark-blue-gray">Day of Week</label>
                      <Select
                        value={formData.day_of_week}
                        onValueChange={(value) => setFormData({ ...formData, day_of_week: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_OF_WEEK.map((day) => (
                            <SelectItem key={day.value} value={day.value.toString()}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.availability_type === "specific_date" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-dark-blue-gray">Specific Date</label>
                      <Input
                        type="date"
                        min={minDate}
                        value={formData.specific_date}
                        onChange={(e) => setFormData({ ...formData, specific_date: e.target.value })}
                        className="border-gray-300 focus:border-orange focus:ring-orange"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-dark-blue-gray">Start Time</label>
                      <Select
                        value={formData.start_time}
                        onValueChange={(value) => setFormData({ ...formData, start_time: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                          <SelectValue placeholder="Start" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-dark-blue-gray">End Time</label>
                      <Select
                        value={formData.end_time}
                        onValueChange={(value) => setFormData({ ...formData, end_time: value })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-orange focus:ring-orange">
                          <SelectValue placeholder="End" />
                        </SelectTrigger>
                        <SelectContent>
                          {TIME_SLOTS.map((time) => (
                            <SelectItem key={time} value={time}>
                              {formatTime(time)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-gray-300 text-blue-gray hover:bg-gray-50 bg-transparent"
                      onClick={() => setShowAddDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1 bg-orange hover:bg-orange text-white">
                      {editingAvailability ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-blue-gray">Loading availability...</p>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger
                value="recurring"
                className="data-[state=active]:bg-orange data-[state=active]:text-orange-500 flex items-center gap-2"
              >
                <Repeat className="h-4 w-4" />
                Recurring Weekly
              </TabsTrigger>
              <TabsTrigger
                value="specific"
                className="data-[state=active]:bg-orange data-[state=active]:text-orange-500 flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                Specific Dates
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recurring">
              {Object.keys(groupedRecurring).length === 0 ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="text-center py-12">
                    <Repeat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-blue-gray mb-2">No recurring availability set</h3>
                    <p className="text-blue-gray mb-4">
                      Set your weekly recurring schedule so students can book regular sessions.
                    </p>
                    <Button className="bg-orange hover:bg-orange text-white" onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Recurring Availability
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedRecurring).map(([subject, items]) => (
                    <Card key={subject} className="border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl text-dark-blue-gray flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange" />
                          {subject}
                        </CardTitle>
                        <CardDescription className="text-blue-gray">
                          Your recurring weekly availability for {subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="border border-gray-200 rounded-lg p-4 hover:border-orange transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-blue-gray border-gray-300">
                                  <Repeat className="h-3 w-3 mr-1" />
                                  {getDayName(item.day_of_week!)}
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-blue-gray hover:text-orange hover:bg-orange/10"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-sm text-dark-blue-gray font-medium">
                                {formatTime(item.start_time)} - {formatTime(item.end_time)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="specific">
              {Object.keys(groupedSpecific).length === 0 ? (
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="text-center py-12">
                    <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-dark-blue-gray mb-2">No specific dates set</h3>
                    <p className="text-blue-gray mb-4">
                      Set availability for specific dates like holidays, special sessions, or one-time availability.
                    </p>
                    <Button className="bg-orange hover:bg-orange text-white" onClick={() => setShowAddDialog(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Specific Date
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedSpecific).map(([subject, items]) => (
                    <Card key={subject} className="border-gray-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-xl text-dark-blue-gray flex items-center gap-2">
                          <CalendarDays className="h-5 w-5 text-orange" />
                          {subject}
                        </CardTitle>
                        <CardDescription className="text-blue-gray">
                          Your specific date availability for {subject}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
                          {items.map((item) => (
                            <div
                              key={item.id}
                              className="border border-gray-200 rounded-lg p-4 hover:border-orange transition-colors"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <Badge variant="outline" className="text-blue-gray border-gray-300">
                                  <CalendarDays className="h-3 w-3 mr-1" />
                                  Specific Date
                                </Badge>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-blue-gray hover:text-orange hover:bg-orange/10"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-sm text-dark-blue-gray font-medium">
                                  {formatDate(item.specific_date!)}
                                </div>
                                <div className="text-sm text-blue-gray">
                                  {formatTime(item.start_time)} - {formatTime(item.end_time)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
