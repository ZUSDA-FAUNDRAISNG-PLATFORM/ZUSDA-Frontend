import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HandHeart, Coins, Footprints } from "lucide-react";
import { useInvolvement } from "./InvolvementDialogs";

const PRAYER_WHATSAPP_LINK = "https://chat.whatsapp.com/LnezZ6dnqkcKw0zhvsnjXg?mode=gi_t";
const GO_FORM_LINK = "https://forms.google.com/REPLACE_ME"; // TODO: paste real Google Form URL

const ways: { icon: any; title: string; desc: string; action: string; kind: "give" | "pray" | "go"; whatsappLink?: string }[] = [
  {
    icon: HandHeart,
    title: "Pray",
    desc: "Commit to spiritual support through intercession for the mission and the community of Kinungi. Prayer is the foundation of everything we do.",
    action: "Join Prayer Team",
    kind: "pray",
    whatsappLink: PRAYER_WHATSAPP_LINK,
  },
  
  {
    icon: Footprints,
    title: "Go",
    desc: "Participate physically as a missionary during the 15-day outreach. Open to all willing individuals ready to serve.",
    action: "Register to Go",
    kind: "go",
    whatsappLink: GO_FORM_LINK,
  },
];

const GetInvolvedSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { open } = useInvolvement();

  return (
    <section id="involved" className="py-24 bg-cream">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-gold-dark uppercase tracking-[0.2em] text-sm font-semibold mb-3">Get Involved</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-4">
             Ways to Participate
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everyone has a role to play. Whether through prayer, giving, or going — your involvement makes a difference.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {ways.map((w, i) => (
            <motion.div
              key={w.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i }}
              className="bg-background rounded-2xl p-8 shadow-soft border border-gold/5 flex flex-col text-center hover:shadow-elevated transition-shadow"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center mx-auto mb-6">
                <w.icon className="text-secondary-foreground" size={28} />
              </div>
              <h3 className="font-display text-2xl font-bold text-navy mb-3">{w.title}</h3>
              <p className="text-muted-foreground leading-relaxed flex-1 mb-6">{w.desc}</p>
              {w.whatsappLink ? (
                <a
                  href={w.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-navy text-primary-foreground font-semibold py-3 rounded-full hover:bg-navy-light transition-colors text-center block"
                >
                  {w.action}
                </a>
              ) : (
                <button
                  onClick={() => open(w.kind)}
                  className="bg-navy text-primary-foreground font-semibold py-3 rounded-full hover:bg-navy-light transition-colors"
                >
                  {w.action}
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GetInvolvedSection;
