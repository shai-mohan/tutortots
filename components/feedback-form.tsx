"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { analyzeSentimentVader } from "@/lib/local-sentiment"

interface FeedbackFormProps {
  sessionId: string
  tutorName: string
  subject: string
  onFeedbackSubmitted: () => void
}

export function FeedbackForm({ sessionId, tutorName, subject, onFeedbackSubmitted }: FeedbackFormProps) {
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (comment.trim() === "") {
      toast({
        title: "Feedback Required",
        description: "Please write some feedback before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Insert new feedback
      const { error: insertError } = await supabase.from("feedback").insert({
        session_id: sessionId,
        comment: comment.trim(),
      })

      if (insertError) {
        throw insertError
      }

      // Get the tutor ID from the session
      const { data: sessionData, error: sessionError } = await supabase
        .from("sessions")
        .select("tutor_id")
        .eq("id", sessionId)
        .single()

      if (sessionError || !sessionData?.tutor_id) throw sessionError

      const tutorId = sessionData.tutor_id

      // Get all comments for sessions by this tutor
      const { data: sessionIdsData } = await supabase
        .from("sessions")
        .select("id")
        .eq("tutor_id", tutorId)

      const sessionIds = sessionIdsData?.map((s) => s.id) || []

      if (sessionIds.length === 0) throw new Error("No sessions found for tutor.")

      const { data: feedbacks } = await supabase
        .from("feedback")
        .select("comment")
        .in("session_id", sessionIds)

      const validComments = feedbacks?.filter((f) => f.comment?.trim()) || []

      const sentimentScores = validComments.map((f) =>
        analyzeSentimentVader(f.comment)
      )

      const averageSentiment =
        sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length

      // Update tutor's profile with new sentiment rating
      await supabase
        .from("profiles")
        .update({
          sentiment_rating: parseFloat(averageSentiment.toFixed(2)),
          sentiment_total_ratings: sentimentScores.length,
        })
        .eq("id", tutorId)

      toast({
        title: "Feedback Submitted",
        description: "Thanks for helping us improve!",
      })

      onFeedbackSubmitted()
      setComment("")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Leave Feedback
        </CardTitle>
        <CardDescription>
          Share your experience with {tutorName} for {subject}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="comment" className="text-sm font-medium mb-2 block">
              Written Feedback
            </Label>
            <Textarea
              id="comment"
              placeholder="Share your thoughts about the tutoring session..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none focus:ring-orange-custom focus:border-orange-custom"
              style={{ "--tw-ring-color": "#FFA500" } as React.CSSProperties}
            />
            <p className="text-xs text-gray-500 mt-1">{comment.length}/500 characters</p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || comment.trim() === ""}
            className="w-full bg-orange-600 hover:bg-orange-500"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
