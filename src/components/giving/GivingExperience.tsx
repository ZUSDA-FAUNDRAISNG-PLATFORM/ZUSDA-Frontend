import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { useCms, usePublished } from "@/cms/CmsProvider";
import { useFundraiserProgress } from "@/hooks/useFundraiserProgress";
import { useGivingCategories } from "@/hooks/useGivingCategories";
import { AllocationStep } from "@/components/giving/AllocationStep";
import { AmountStep } from "@/components/giving/AmountStep";
import { CampaignPaymentStep } from "@/components/giving/CampaignPaymentStep";
import { CategoryStep } from "@/components/giving/CategoryStep";
import { GivingStepper } from "@/components/giving/GivingStepper";
import { GivingSuccess } from "@/components/giving/GivingSuccess";
import { ReviewStep } from "@/components/giving/ReviewStep";
import {
  autoAllocateSingle,
  buildLines,
  pruneAllocations,
  validateAllocations,
} from "@/lib/giving/allocation";
import type {
  AllocationMap,
  CampaignContext,
  ContributionSummary,
  FutureStkPayload,
  GivingMode,
  GivingStep,
  PaymentMethodId,
} from "@/lib/giving/types";

const phoneSchema = z.string().trim().regex(/^(?:\+?254|0)?[17]\d{8}$/, "Enter a valid Kenyan phone number");

export type GivingExperienceProps = {
  mode?: GivingMode;
  initialProjectId?: number | null;
  initialCauseName?: string | null;
  initialPosterId?: number | null;
};

/**
 * Dual-flow giving wizard (frontend only).
 * - campaign: amount → confirm (no category picker)
 * - general: categories → amount → allocate? → review
 * Confirm prepares STK payload but does not call `/mpesa/stk-push` yet.
 */
export function GivingExperience({
  mode = "general",
  initialProjectId,
  initialCauseName,
  initialPosterId,
}: GivingExperienceProps) {
  const categories = useGivingCategories();
  const posters = usePublished("posters");
  const { campaigns, target, raised, progressPercent } = useFundraiserProgress();
  const { state } = useCms();

  const campaign = useMemo<CampaignContext | null>(() => {
    if (mode !== "campaign") return null;
    const byPoster =
      initialPosterId != null
        ? campaigns.find((item) => item.id === String(initialPosterId))
        : undefined;
    const byProject =
      initialProjectId != null
        ? campaigns.find((item) => item.projectId === initialProjectId)
        : undefined;
    const byName = initialCauseName
      ? campaigns.find((item) => item.title.toLowerCase() === initialCauseName.trim().toLowerCase())
      : undefined;
    const match = byPoster ?? byName ?? byProject;
    const poster =
      (initialPosterId != null ? posters.find((item) => item.id === initialPosterId) : undefined) ??
      posters.find((item) => item.title === match?.title || item.projectId === initialProjectId);

    if (!match && !poster && !initialCauseName && initialProjectId == null) {
      return {
        posterId: null,
        projectId: 1,
        title: "Campaign support",
        description: "",
        goal: target,
        raised,
        percent: progressPercent,
        categoryLabel: "Campaign",
      };
    }

    return {
      posterId: poster?.id ?? (match ? Number(match.id) : null),
      projectId: match?.projectId ?? initialProjectId ?? poster?.projectId ?? 1,
      title: match?.title || initialCauseName || poster?.title || "Campaign",
      description: match?.description || poster?.description || poster?.subtitle || "",
      imageUrl: match?.imageUrl || poster?.imageUrl,
      goal: match?.goal ?? target,
      raised: match?.raised ?? raised,
      percent: match?.percent ?? progressPercent,
      categoryLabel: poster?.eyebrow || "Campaign",
    };
  }, [
    mode,
    campaigns,
    posters,
    initialPosterId,
    initialProjectId,
    initialCauseName,
    target,
    raised,
    progressPercent,
  ]);

  const [step, setStep] = useState<GivingStep>(mode === "campaign" ? "amount" : "categories");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [allocations, setAllocations] = useState<AllocationMap>({});
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("mpesa");
  const [summary, setSummary] = useState<ContributionSummary | null>(null);

  useEffect(() => {
    if (mode !== "campaign" || !campaign) return;
    const id = `campaign-${campaign.posterId ?? campaign.projectId ?? "support"}`;
    setCategoryIds([id]);
    if (totalAmount > 0) setAllocations(autoAllocateSingle(totalAmount, id));
  }, [mode, campaign, totalAmount]);

  const effectiveCategories = useMemo(() => {
    if (mode === "campaign" && campaign) {
      const id = `campaign-${campaign.posterId ?? campaign.projectId ?? "support"}`;
      return [
        {
          id,
          label: campaign.title,
          description: campaign.description,
          projectId: campaign.projectId,
        },
      ];
    }
    return categories;
  }, [mode, campaign, categories]);

  const needsAllocate = mode === "general" && categoryIds.length > 1;

  const allocationValidation = useMemo(
    () => validateAllocations(totalAmount, categoryIds, allocations),
    [totalAmount, categoryIds, allocations],
  );

  const lines = useMemo(
    () => buildLines(effectiveCategories, categoryIds, allocations),
    [effectiveCategories, categoryIds, allocations],
  );

  const toggleCategory = (id: string) => {
    setCategoryIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      setAllocations((current) => pruneAllocations(current, next));
      return next;
    });
  };

  const syncAllocationForAmount = (amount: number, ids: string[]) => {
    if (ids.length === 1) {
      setAllocations(autoAllocateSingle(amount, ids[0]));
      return;
    }
    setAllocations((current) => pruneAllocations(current, ids));
  };

  const goNext = () => {
    if (step === "categories") {
      if (!categoryIds.length) {
        toast.error("Select at least one category.");
        return;
      }
      setStep("amount");
      return;
    }
    if (step === "amount") {
      if (totalAmount < 1) {
        toast.error("Enter a positive amount.");
        return;
      }
      if (mode === "campaign") {
        if (campaign) {
          const id = `campaign-${campaign.posterId ?? campaign.projectId ?? "support"}`;
          setAllocations(autoAllocateSingle(totalAmount, id));
        }
        setStep("review");
        return;
      }
      syncAllocationForAmount(totalAmount, categoryIds);
      setStep(needsAllocate ? "allocate" : "review");
      return;
    }
    if (step === "allocate") {
      const validation = validateAllocations(totalAmount, categoryIds, allocations);
      if (!validation.isValid) {
        toast.error(validation.message);
        return;
      }
      setStep("review");
    }
  };

  const goBack = () => {
    if (mode === "campaign") {
      if (step === "review") setStep("amount");
      return;
    }
    if (step === "amount") setStep("categories");
    else if (step === "allocate") setStep("amount");
    else if (step === "review") setStep(needsAllocate ? "allocate" : "amount");
  };

  /**
   * FUTURE BACKEND INTEGRATION POINT
   * Replace local success with verified STK / multi-allocation API response.
   */
  const buildFutureStkPayload = (): FutureStkPayload => {
    const primary =
      lines.find((line) => line.projectId != null)?.projectId ??
      campaign?.projectId ??
      initialProjectId ??
      1;
    return {
      mode,
      donor_name: donorName.trim() || "Anonymous",
      phone: phone.trim(),
      amount: totalAmount,
      payment_method: paymentMethod,
      project_id: primary || 1,
      campaign:
        mode === "campaign" && campaign
          ? { poster_id: campaign.posterId, title: campaign.title }
          : undefined,
      allocations: lines.map((line) => ({
        category_id: line.categoryId,
        label: line.label,
        amount: line.amount,
        project_id: line.projectId ?? null,
      })),
    };
  };

  const confirmContribution = () => {
    const phoneResult = phoneSchema.safeParse(phone);
    if (!phoneResult.success) {
      toast.error(phoneResult.error.issues[0]?.message ?? "Enter a valid Kenyan phone number");
      return;
    }
    if (mode === "general" && !allocationValidation.isValid) {
      toast.error("Fix allocation before confirming.");
      return;
    }
    if (mode === "campaign" && totalAmount < 1) {
      toast.error("Enter a positive amount.");
      return;
    }

    const payload = buildFutureStkPayload();
    void payload;

    const reference = `ZUSDA-PENDING-${Date.now().toString(36).toUpperCase()}`;
    setSummary({
      mode,
      lines,
      total: totalAmount,
      donorName: donorName.trim() || "Anonymous",
      phone: phone.trim(),
      paymentMethod: "M-Pesa",
      transactionReference: reference,
      createdAt: new Date().toISOString(),
      churchName: state.site.churchName || "ZUSDA",
      campaignTitle: campaign?.title,
      campaignImageUrl: campaign?.imageUrl,
    });
    setStep("success");
    toast.message("Contribution prepared", {
      description: "STK Push will be connected next. Review your success screen and receipt.",
    });
  };

  const resetWizard = () => {
    setStep(mode === "campaign" ? "amount" : "categories");
    setCategoryIds(mode === "campaign" && campaign ? [`campaign-${campaign.posterId ?? campaign.projectId ?? "support"}`] : []);
    setTotalAmount(0);
    setAllocations({});
    setDonorName("");
    setPhone("");
    setPaymentMethod("mpesa");
    setSummary(null);
  };

  const canContinue =
    step === "categories"
      ? categoryIds.length > 0
      : step === "amount"
        ? totalAmount >= 1
        : step === "allocate"
          ? allocationValidation.isValid
          : true;

  const backDisabled = mode === "campaign" ? step === "amount" : step === "categories";

  return (
    <div className="rounded-card border border-[#1C1D4D]/8 bg-white p-5 shadow-[0_4px_20px_rgba(21,22,58,0.06)] sm:p-8">
      <GivingStepper current={step} mode={mode} showAllocate={needsAllocate} />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${mode}-${step}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {step === "categories" && mode === "general" ? (
            <CategoryStep
              categories={categories}
              selectedIds={categoryIds}
              onToggle={toggleCategory}
              onSetSelected={(ids) => {
                setCategoryIds(ids);
                setAllocations((current) => pruneAllocations(current, ids));
              }}
            />
          ) : null}

          {step === "amount" && mode === "campaign" && campaign ? (
            <CampaignPaymentStep
              campaign={campaign}
              amount={totalAmount}
              paymentMethod={paymentMethod}
              onAmountChange={(amount) => {
                setTotalAmount(amount);
                const id = `campaign-${campaign.posterId ?? campaign.projectId ?? "support"}`;
                setAllocations(autoAllocateSingle(amount, id));
              }}
              onPaymentMethodChange={setPaymentMethod}
            />
          ) : null}

          {step === "amount" && mode === "general" ? (
            <AmountStep
              amount={totalAmount}
              categoryCount={categoryIds.length}
              onChange={(amount) => {
                setTotalAmount(amount);
                if (categoryIds.length === 1) {
                  setAllocations(autoAllocateSingle(amount, categoryIds[0]));
                }
              }}
            />
          ) : null}

          {step === "allocate" && mode === "general" ? (
            <AllocationStep
              categories={categories}
              categoryIds={categoryIds}
              totalAmount={totalAmount}
              allocations={allocations}
              onChange={(id, amount) => setAllocations((prev) => ({ ...prev, [id]: amount }))}
            />
          ) : null}

          {step === "review" ? (
            <ReviewStep
              mode={mode}
              campaignTitle={campaign?.title}
              lines={lines}
              total={totalAmount}
              donorName={donorName}
              phone={phone}
              paybill={state.site.paybill || "247247"}
              account={state.site.paybillAccount || "593021"}
              paymentMethodLabel={paymentMethod === "mpesa" ? "M-Pesa STK Push" : paymentMethod}
              onDonorNameChange={setDonorName}
              onPhoneChange={setPhone}
            />
          ) : null}

          {step === "success" && summary ? <GivingSuccess summary={summary} onGiveAgain={resetWizard} /> : null}
        </motion.div>
      </AnimatePresence>

      {step !== "success" ? (
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#1C1D4D]/8 pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={backDisabled}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>
          {step === "review" ? (
            <button type="button" onClick={confirmContribution} className="btn-gold">
              Confirm Contribution
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canContinue}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default GivingExperience;
