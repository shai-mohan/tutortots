"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Star, Send } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface FeedbackFormProps {
  sessionId: string
  tutorName: string
  subject: string
  onFeedbackSubmitted: () => void
}

export function FeedbackForm({ sessionId, tutorName, subject, onFeedbackSubmitted }: FeedbackFormProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0 && comment.trim() === "") {
      toast({
        title: "Feedback Required",
        description: "Please provide either a rating or written feedback",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("feedback").insert({
        session_id: sessionId,
        rating: rating > 0 ? rating : null,
        comment: comment.trim() || null,
      })

      if (error) {
        toast({
          title: "Submission Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      // Update tutor's rating if a rating was provided
      if (rating > 0) {
        // Get current tutor rating data
        const { data: sessionData } = await supabase.from("sessions").select("tutor_id").eq("id", sessionId).single()

        if (sessionData) {
          const { data: tutorData } = await supabase
            .from("profiles")
            .select("rating, total_ratings")
            .eq("id", sessionData.tutor_id)
            .single()

          if (tutorData) {
            const currentRating = tutorData.rating || 0
            const currentTotal = tutorData.total_ratings || 0
            const newTotal = currentTotal + 1
            const newRating = (currentRating * currentTotal + rating) / newTotal

            await supabase
              .from("profiles")
              .update({
                rating: newRating,
                total_ratings: newTotal,
              })
              .eq("id", sessionData.tutor_id)
          }
        }
      }

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      })

      onFeedbackSubmitted()
    } catch (error) {
      console.error("Error submitting feedback:", error)
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred",
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
          <Star className="h-5 w-5" style={{ color: "#FFA500" }} />
          Leave Feedback
        </CardTitle>
        <CardDescription>
          Share your experience with {tutorName} for {subject}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Rating (Optional)</Label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="p-1 rounded transition-colors"
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      i < (hoveredRating || rating) ? "text-orange-400" : "text-gray-300 hover:text-orange-300"
                    }`}
                    style={{
                      fill: i < (hoveredRating || rating) ? "#FFA500" : "transparent",
                    }}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating} star{rating !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>

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
            disabled={isSubmitting || (rating === 0 && comment.trim() === "")}
            className="w-full bg-orange-custom hover:bg-orange-600"
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
