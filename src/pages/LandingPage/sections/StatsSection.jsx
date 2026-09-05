import { useRef, useState, useLayoutEffect } from "react";
import { statsSectionAnimation } from "../animations";
import CountUp from "../components/CountUp";

const stats = [
  { n: "3", unit: "Provinsi", sub: "Aceh · Sumut · Sumbar" },
  { n: "510", unit: "Mahasiswa STIS", sub: "Turut serta dalam pendataan" },
  { n: "48", unit: "Hari Lapangan", sub: "14 Jan – 02 Feb 2026" },
];

export default function StatsSection() {
  const sectionRef = useRef(null);
  const [startCountUp, setStartCountUp] = useState(false);
  useLayoutEffect(() => {
    const cleanup = statsSectionAnimation(sectionRef.current, setStartCountUp);
    return cleanup;
  }, []);

  return (
    <section
      ref={sectionRef}
      className="border-t border-b border-[var(--beige)]/[0.08] py-[clamp(36px,5.5vh,64px)] px-[5%] grid grid-cols-3 gap-0 max-md:grid-cols-1"
    >
      {stats.map((s, i) => (
        <div
          key={s.unit}
          data-reveal
          data-from="bottom"
          data-delay={i * 0.12}
          className={`opacity-0 p-[clamp(20px,3vw,40px)] flex flex-col gap-1.5 ${i < 2
            ? "border-r border-[var(--beige)]/[0.08] max-md:border-r-0 max-md:border-b max-md:border-[var(--beige)]/[0.08]"
            : ""
            }`}
        >
          <div className="flex items-baseline gap-2">
            <span className="font-[family-name:var(--font-title)] text-[clamp(44px,5.5vw,72px)] font-black text-[var(--gold)] leading-none tracking-[-0.04em]">
              <CountUp target={s.n} trigger={startCountUp} />
            </span>
          </div>
          <span className="text-[clamp(11px,1vw,13px)] font-bold tracking-[0.1em] uppercase text-[var(--off-white)]">
            {s.unit}
          </span>
          <span className="text-[11px] text-[var(--beige)]/40 font-light">
            {s.sub}
          </span>
        </div>
      ))}
    </section>
  );
}