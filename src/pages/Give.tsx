import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { GivingExperience } from "@/components/giving/GivingExperience";
import { InvolvementProvider } from "@/components/InvolvementDialogs";
import type { GivingMode } from "@/lib/giving/types";

const GivePage = () => {
  const [params] = useSearchParams();
  const modeParam = params.get("mode");
  const mode: GivingMode = modeParam === "campaign" ? "campaign" : "general";
  const projectIdRaw = params.get("projectId");
  const projectId = projectIdRaw ? Number(projectIdRaw) : null;
  const posterIdRaw = params.get("posterId");
  const posterId = posterIdRaw ? Number(posterIdRaw) : null;
  const causeName = params.get("cause");

  return (
    <InvolvementProvider>
      <div className="min-h-screen overflow-x-hidden bg-page">
        <Navbar />
        <main className="container mx-auto px-4 pb-16 pt-28 sm:pt-32">
          <div className="mx-auto mb-8 max-w-3xl text-center">
            <p className="section-eyebrow">{mode === "campaign" ? "Campaign support" : "General giving"}</p>
            <h1 className="section-title">
              {mode === "campaign" ? "Support this campaign" : "Give to ZUSDA"}
            </h1>
            <p className="section-body">
              {mode === "campaign"
                ? "Enter your amount, choose M-Pesa, and confirm your contribution."
                : "Select categories, enter your total, allocate if needed, then review before payment."}
            </p>
            <Link to="/" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-brand hover:underline">
              ← Back to home
            </Link>
          </div>
          <div className="mx-auto max-w-3xl">
            <GivingExperience
              mode={mode}
              initialProjectId={Number.isFinite(projectId) ? projectId : null}
              initialPosterId={Number.isFinite(posterId) ? posterId : null}
              initialCauseName={causeName}
            />
          </div>
        </main>
        <Footer />
      </div>
    </InvolvementProvider>
  );
};

export default GivePage;
