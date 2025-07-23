// Simple AI-based tutor recommendation utility

export type Tutor = {
  id: string;
  name: string;
  subjects: string[];
  rating: number; // average rating, e.g., 4.8
  numReviews: number;
  isAvailable: boolean;
};

/**
 * Recommend top N tutors for a student based on subject, rating, and availability.
 * @param tutors List of all tutors
 * @param subject Subject the student is interested in
 * @param N Number of tutors to recommend (default 3)
 */
export function recommendTutors(
  tutors: Tutor[],
  subject: string,
  N: number = 3
): Tutor[] {
  // 1. Filter tutors by subject and availability
  const filtered = tutors.filter(
    (tutor) => tutor.subjects.includes(subject) && tutor.isAvailable
  );

  // 2. Sort by rating, then by number of reviews
  filtered.sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    return b.numReviews - a.numReviews;
  });

  // 3. Return top N
  return filtered.slice(0, N);
} 