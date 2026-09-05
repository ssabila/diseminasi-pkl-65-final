import { useEffect, useRef } from "react";
import FooterLink from "../components/FooterLink";
import { footerSectionAnimation } from "../animations";

const navLinks = ["Metodologi", "Tim PKL", "Tentang BPS", "Kontak"];

export default function FooterSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const cleanup = footerSectionAnimation(sectionRef.current);
    return cleanup;
  }, []);

  return (
    <footer
      ref={sectionRef}
      className="border-t border-[var(--beige)]/[0.08] py-[clamp(36px,5vh,56px)] px-[5%] flex flex-wrap items-center justify-between gap-5"
    >
      <div>
        <p className="font-[family-name:var(--font-title)] italic text-[clamp(13px,1.4vw,16px)] text-[var(--gold)] mb-1">
          Diseminasi PKL 65
        </p>
        <p className="text-[11px] text-[var(--beige)]/30 font-light m-0 tracking-[0.05em]">
          Politeknik Statistika STIS · BPS RI · 2026
        </p>
      </div>
      <nav className="flex gap-7 flex-wrap">
        {navLinks.map((l) => (
          <FooterLink key={l}>{l}</FooterLink>
        ))}
      </nav>
    </footer>
  );
}