import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Megaphone, Wallet, Radio, Truck, Utensils, Crown } from "lucide-react";
import gregoryDaghe from "@/assets/committee/Gregory_Daghe.jpeg";
import pastorMoses from "@/assets/committee/Pastor_Moses_Kariuki.jpeg";
import leahMonchari from "@/assets/committee/Leah_Monchari.jpeg";
import branolJoseph from "@/assets/committee/Branol_Joseph.jpeg";
import gregoryNjeka from "@/assets/committee/Gregory_Njeka.jpeg";
import jimCarson from "@/assets/committee/Jim_Carson.jpeg";
import hellenJuma from "@/assets/committee/Hellen_Juma.jpeg";
import robertCarlos from "@/assets/committee/Robert_Carlos.jpeg";
import ericNtongai from "@/assets/committee/Eric_Ntongai.jpeg";
import deborahKeira from "@/assets/committee/Deborah_Keira.jpeg";
import annMaroa from "@/assets/committee/Ann_Maroa.jpeg";

type Leader = { name: string; photo?: string; active?: boolean };

const departments: {
  icon: typeof Megaphone;
  name: string;
  role: string;
  leaders: Leader[];
}[] = [
  {
    icon: Megaphone,
    name: "Evangelism / PM",
    role: "Preaching & spiritual coordination",
    leaders: [
      { name: "Pastor Moses Kariuki", photo: pastorMoses },
      { name: "Leah Monchari", photo: leahMonchari },
    ],
  },
  {
    icon: Wallet,
    name: "Finance",
    role: "Stewardship & accountability",
    leaders: [
      { name: "Branol Joseph", photo: branolJoseph },
      { name: "Gregory Njeka", photo: gregoryNjeka },
    ],
  },
  {
    icon: Radio,
    name: "Media & Communication",
    role: "Outreach, publicity & documentation",
    leaders: [
      { name: "Eld. Jim Carson", photo: jimCarson },
      { name: "Hellen Juma", photo: hellenJuma },
    ],
  },
  {
    icon: Truck,
    name: "Transport & Logistics",
    role: "Movement, accommodation & supplies",
    leaders: [
      { name: "Eld. Robert Carlos", photo: robertCarlos },
      { name: "Eric Ntongai", photo: ericNtongai },
    ],
  },
  {
    icon: Utensils,
    name: "Food & Catering",
    role: "Meals & hospitality",
    leaders: [
      { name: "Deborah Keira", photo: deborahKeira },
      { name: "Ann Maroa", photo: annMaroa },
    ],
  },
];

const missionChairman = {
  icon: Crown,
  name: "Mission Chairman",
  role: "General Oversight",
  leader: "Gregory Daghe",
  photo: gregoryDaghe,
};

const initials = (name: string) =>
  name
    .replace(/Pastor|Eld\.?|Elder/gi, "")
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const LeaderAvatar = ({
  leader,
  ring = "ring-gold/60",
}: {
  leader: Leader;
  ring?: string;
}) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative">
      <div
        className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ${ring} ring-offset-4 ring-offset-background bg-navy/10 flex items-center justify-center shadow-[0_10px_30px_rgba(15,23,42,0.20)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(224,176,76,0.35)]`}
      >
      {leader.photo ? (
        <img
          src={leader.photo}
          alt={leader.name}
          loading="lazy"
          className="w-full h-full object-cover object-center"
        />
      ) : (
        <span className="font-display font-bold text-navy text-sm">
          {initials(leader.name)}
        </span>
      )}
    </div>
      {leader.active && (
        <span className="absolute right-1 top-1 h-3 w-3 rounded-full border-2 border-white bg-gold shadow-[0_0_0_3px_rgba(255,255,255,0.9)]" />
      )}
    </div>
    <span className="text-xs font-medium text-navy text-center leading-tight max-w-[7rem]">
      {leader.name}
    </span>
  </div>
);

const CommitteeSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="committee" className="py-24 bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-gold-dark uppercase tracking-[0.2em] text-sm font-semibold mb-3">
            Leadership
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-navy mb-4">
            Mission Committee
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Five sub-departments working under one chairman — each entrusted with a vital part of the mission.
          </p>
        </motion.div>

        {/* Mission Chairman - Featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          whileHover={{ y: -6 }}
          className="rounded-2xl p-8 border transition-shadow hover:shadow-elevated bg-gradient-to-br from-navy to-navy-light border-gold/30 text-primary-foreground max-w-5xl mx-auto mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gold/60 ring-offset-4 ring-offset-navy shadow-glow">
                <img
                  src={missionChairman.photo}
                  alt={missionChairman.leader}
                  className="w-full h-full object-cover object-center"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center bg-gradient-gold shadow-lg">
                <missionChairman.icon className="text-secondary-foreground" size={20} />
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-gold uppercase tracking-[0.2em] text-xs font-semibold mb-1">
                {missionChairman.role}
              </p>
              <h3 className="font-display font-bold text-2xl md:text-3xl text-primary-foreground mb-1">
                {missionChairman.leader}
              </h3>
              <p className="text-primary-foreground/70">
                {missionChairman.name}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 5 Sub-departments */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {departments.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * (i + 1) }}
              whileHover={{ y: -6 }}
              className="rounded-2xl p-6 border transition-shadow hover:shadow-elevated bg-cream border-gold/10 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-navy">
                  <d.icon className="text-primary-foreground" size={22} />
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-lg text-navy">{d.name}</h4>
                  <p className="text-sm text-muted-foreground">{d.role}</p>
                </div>
              </div>
              <div className="flex justify-around items-start gap-3 mt-auto pt-2">
                {d.leaders.map((l) => (
                  <LeaderAvatar key={l.name} leader={l} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CommitteeSection;
