import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Portal({
    number, region, tag, copy, accent, img, imgAlt,
    ctaLabel, ctaHref, reportHref, compact = false, to = ''
}) {
    const [hov, setHov] = useState(false);
    const navigate = useNavigate();

    const handleCardClick = (e) => {
        if (to) navigate(to);
    };

    return (
        <div
            onClick={handleCardClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                backgroundColor: hov ? "rgba(243,234,210,0.04)" : "rgba(243,234,210,0.015)",
                borderColor: hov ? "rgba(243,234,210,0.18)" : "rgba(243,234,210,0.07)",
            }}
            className="relative flex flex-col border transition-all duration-400 h-full overflow-hidden cursor-pointer"
        >
            {/* Image */}
            <div
                style={{ height: compact ? "clamp(140px,18vw,220px)" : "clamp(200px,26vw,340px)" }}
                className="relative overflow-hidden bg-[var(--navy)] flex-shrink-0"
            >
                <img
                    src={img} alt={imgAlt}
                    style={{
                        opacity: hov ? 0.48 : 0.28,
                        transform: hov ? "scale(1.05)" : "scale(1)",
                        filter: "sepia(0.3) hue-rotate(5deg)",
                    }}
                    className="w-full h-full object-cover block transition-all duration-600"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--navy)]/80" />
                {/* Number watermark */}
                <div
                    style={{ color: accent }}
                    className="absolute bottom-4 right-5 font-[family-name:var(--font-title)] text-[clamp(52px,5vw,80px)] font-black leading-none opacity-28 tracking-[-0.05em]"
                >
                    {number}
                </div>
            </div>

            {/* Text content */}
            <div className="p-[clamp(22px,2.8vw,36px)] flex flex-col gap-3 flex-1">
                <span
                    style={{ color: accent }}
                    className="text-[10px] tracking-[0.18em] uppercase font-normal"
                >
                    {tag}
                </span>
                <h3 className="font-[family-name:var(--font-title)] italic text-[clamp(18px,2.1vw,26px)] !text-[var(--beige)] m-0 leading-[1.2]">
                    {region}
                </h3>
                <p className="text-[clamp(12px,1vw,14px)] leading-[1.78] text-[var(--beige)]/55 font-light m-0">
                    {copy}
                </p>

                {/* CTAs */}
                <div className="flex gap-2.5 flex-wrap mt-auto pt-2 z-10" onClick={(e) => e.stopPropagation()}>
                    {ctaHref?.startsWith('/') ? (
                        <Link
                            to={ctaHref}
                            style={{
                                backgroundColor: hov ? accent : "transparent",
                                color: hov ? "var(--navy)" : accent,
                                borderColor: accent,
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4.5 border rounded-full font-[family-name:var(--font-title)] italic text-[13px] font-bold no-underline transition-all duration-300 whitespace-nowrap"
                        >
                            {ctaLabel} →
                        </Link>
                    ) : (
                        <a
                            href={ctaHref}
                            style={{
                                backgroundColor: hov ? accent : "transparent",
                                color: hov ? "var(--navy)" : accent,
                                borderColor: accent,
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4.5 border rounded-full font-[family-name:var(--font-title)] italic text-[13px] font-bold no-underline transition-all duration-300 whitespace-nowrap"
                        >
                            {ctaLabel} →
                        </a>
                    )}

                    <a
                        href={reportHref}
                        className="py-2.5 px-4.5 bg-transparent text-[var(--beige)]/40 border border-[var(--beige)]/14 rounded-full font-[family-name:var(--font-content)] text-[11px] font-light tracking-[0.1em] no-underline transition-all duration-300 whitespace-nowrap inline-flex items-center hover:text-[var(--beige)] hover:border-[var(--beige)]/30"
                    >
                        Unduh Laporan
                    </a>
                </div>
            </div>
        </div>
    );
}