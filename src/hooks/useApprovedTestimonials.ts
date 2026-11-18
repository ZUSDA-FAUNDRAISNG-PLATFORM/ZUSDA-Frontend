/**
 * Approved testimonials for public display.
 *
 * Business rule (future backend):
 * Only contributors with a successful completed payment may submit a testimonial.
 * Flow: Successful Payment → Success Screen → optional rating + testimony → Submit → admin approval.
 *
 * Display rule: show only the latest three approved testimonials.
 * This hook is shaped for future pagination (`page`, `pageSize`) without inventing data today.
 */

export type ApprovedTestimonial = {
  id: string;
  name: string;
  quote: string;
  role?: string;
  rating: number;
  approvedAt: string;
  contributionId?: string;
};

export type TestimonialsQuery = {
  page?: number;
  pageSize?: number;
};

/**
 * Returns the latest approved testimonials (max 3 for the landing carousel).
 * Currently empty until the payment-success → testimonial API is connected.
 */
export function useApprovedTestimonials(_query: TestimonialsQuery = { page: 1, pageSize: 3 }) {
  const testimonials: ApprovedTestimonial[] = [];
  const latestThree = testimonials.slice(0, 3);

  return {
    testimonials: latestThree,
    total: testimonials.length,
    isLoading: false,
    isEmpty: latestThree.length === 0,
  };
}
