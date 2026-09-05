import { useLayoutEffect, useRef } from "react";
import Kicker from "../components/Kicker";
import { quoteSectionAnimation } from "../animations";

export default function QuoteSection() {
    const sectionRef = useRef(null);

    useLayoutEffect(() => {
        const cleanup = quoteSectionAnimation(sectionRef.current);
        return cleanup;
    }, []);

    return (
        <section
            ref={sectionRef}
            className="quote-section-trigger border-[var(--beige)]/[0.07] py-[clamp(60px,9vh,110px)] px-[5%] text-left relative"
        >
            <div className="bg-quotes-title absolute right-[5%] top-1/2 -translate-y-1/2 font-[family-name:var(--font-title)] text-[clamp(180px,22vw,300px)] font-black leading-none text-[var(--beige)]/[0.1] select-none pointer-events-none tracking-[-0.05em]">
                PKL 65
            </div>

            <div data-reveal className="quotes-display opacity-0 max-w-[700px]">
                <Kicker>Membawa Satu Semboyan</Kicker>
                <blockquote className="font-[family-name:var(--font-title)] italic text-[clamp(20px,2.8vw,38px)] leading-[1.38] font-normal text-[var(--beige)] mb-[clamp(20px,3vh,32px)]">
                    "Sekali Bergerak Selamanya Berdampak."
                    <p className="text-[clamp(14px,1.3vw,17px)] leading-[1.85] font-light !text-[var(--beige)]/80 m-0 max-w-[520px]">
                        Siap berkontribusi nyata untuk Indonesia.
                    </p>
                </blockquote>
                <div className="flex items-center gap-4">
                    <div className="w-8 h-[1px] bg-[var(--gold)]" />
                    <span className="text-[11px] tracking-[0.14em] uppercase text-[var(--beige)]/[0.38] font-light">
                        Angkatan 65 · Polstat STIS · 2026
                    </span>
                </div>
            </div>
        </section>
    );
}