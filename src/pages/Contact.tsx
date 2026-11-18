import { Link } from "react-router-dom";
import { Mail, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InvolvementProvider } from "@/components/InvolvementDialogs";
import { useCms } from "@/cms/CmsProvider";

/**
 * Placeholder Contact page for the fundraiser navbar.
 * Displays CMS contact fields only — no new backend calls.
 */
const Contact = () => {
  const { state } = useCms();
  const { site } = state;

  return (
    <InvolvementProvider>
      <div className="min-h-screen overflow-x-hidden">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 pb-16 pt-28 md:pt-32">
          <p className="mb-2 text-sm font-semibold tracking-wide text-gold-dark">ZUSDA Fundraiser</p>
          <h1 className="mb-3 font-display text-3xl font-bold text-navy md:text-4xl">Contact Us</h1>
          <p className="mb-8 max-w-2xl text-base leading-relaxed text-slate-700 md:text-lg">
            Reach the mission leadership for questions about giving, prayer, or volunteering for the Kinamba outreach.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={`tel:${site.chairmanPhone.replace(/\s/g, "")}`}
              className="rounded-2xl border border-navy/10 bg-gradient-to-br from-white to-cream p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Phone size={18} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mission Chairman</p>
              <p className="mt-1 font-display text-lg font-semibold text-navy">{site.chairmanName}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{site.chairmanPhone}</p>
            </a>

            <a
              href={`tel:${site.elderPhone.replace(/\s/g, "")}`}
              className="rounded-2xl border border-navy/10 bg-gradient-to-br from-white to-cream p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Phone size={18} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Elder in Charge</p>
              <p className="mt-1 font-display text-lg font-semibold text-navy">{site.elderName}</p>
              <p className="mt-1 text-sm font-medium text-slate-700">{site.elderPhone}</p>
            </a>

            <a
              href={`mailto:${site.contactEmail}`}
              className="rounded-2xl border border-navy/10 bg-gradient-to-br from-white to-cream p-5 shadow-sm transition hover:shadow-md sm:col-span-2"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-navy/5 text-navy">
                <Mail size={18} />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 break-all text-base font-semibold text-navy">{site.contactEmail}</p>
            </a>
          </div>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex min-h-11 items-center rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-cream"
            >
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    </InvolvementProvider>
  );
};

export default Contact;
