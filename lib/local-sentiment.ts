import vader from "vader-sentiment"

/**
 * Analyzes the sentiment of a comment and returns a 0–5 star rating
 */
export function analyzeSentimentVader(comment: string): number {
  const result = vader.SentimentIntensityAnalyzer.polarity_scores(comment)
  console.log("Sentiment result:", result)
  const score = result.compound
  const normalized = ((score + 1) / 2) * 5
  return parseFloat(normalized.toFixed(2))
}

