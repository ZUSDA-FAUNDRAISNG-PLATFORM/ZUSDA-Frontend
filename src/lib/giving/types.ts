export type GivingMode = "campaign" | "general";

export type GivingCategory = {
  id: string;
  label: string;
  description?: string;
  projectId?: number | null;
};

export type AllocationMap = Record<string, number>;

export type GivingDraft = {
  categoryIds: string[];
  totalAmount: number;
  allocations: AllocationMap;
  donorName: string;
  phone: string;
};

export type ContributionLine = {
  categoryId: string;
  label: string;
  amount: number;
  projectId?: number | null;
};

export type PaymentMethodId = "mpesa" | "bank" | "card" | "other";

export type CampaignContext = {
  posterId?: number | null;
  projectId: number | null;
  title: string;
  description: string;
  imageUrl?: string;
  goal: number;
  raised: number;
  percent: number;
  categoryLabel?: string;
};

export type ContributionSummary = {
  mode: GivingMode;
  lines: ContributionLine[];
  total: number;
  donorName: string;
  phone: string;
  paymentMethod: "M-Pesa";
  /** Placeholder until STK Push returns a real CheckoutRequestID / receipt. */
  transactionReference: string;
  createdAt: string;
  churchName: string;
  campaignTitle?: string;
  campaignImageUrl?: string;
};

export type GivingStep = "categories" | "amount" | "allocate" | "review" | "success";

/** Payload shape prepared for future `submitMpesaDonation` / multi-line STK. */
export type FutureStkPayload = {
  mode: GivingMode;
  donor_name: string;
  phone: string;
  amount: number;
  payment_method: PaymentMethodId;
  /** Primary project for backend compatibility with current API. */
  project_id: number;
  campaign?: {
    poster_id?: number | null;
    title: string;
  };
  /** Full allocation breakdown for a future multi-category endpoint. */
  allocations: Array<{
    category_id: string;
    label: string;
    amount: number;
    project_id: number | null;
  }>;
};
