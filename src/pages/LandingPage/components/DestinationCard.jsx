import { useState } from "react";

export function DestinationCard({
    num, region, tag, copy, accent, href, delay = 0, id,
}) {
    const [hov, setHov] = useState(false);
    const [torn, setTorn] = useState(false);

    const handleCardClick = (e) => {
        if (!torn) {
            e.preventDefault();
            setTorn(true);
            
            setTimeout(() => {
                window.location.href = href;
            }, 1200);

            setTimeout(() => {
                setTorn(false);
            }, 1800);
        }
    };

    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            onClick={handleCardClick}
            className="relative flex flex-col bg-transparent overflow-visible cursor-pointer"
        >
            {/* ── BAGIAN ATAS ── */}
            <div
                style={{
                    transformOrigin: "bottom left",
                    transform: torn
                        ? "rotate(0deg) translateY(-20px)"
                        : hov
                            ? "rotate(-4deg)"
                            : "rotate(0deg)",
                    background: hov ? "rgba(10,16,34,0.88)" : "rgba(10,16,34,0.72)",
                    borderColor: hov ? accent + "66" : "rgba(243,234,210,0.10)",
                    boxShadow: hov ? `0 -8px 24px rgba(0,0,0,0.3)` : "none",
                }}
                className="relative z-40 backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border-t border-x border-solid transition-[transform,background,border-color,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]"
            >
                {/* Accent header strip */}
                <div
                    style={{
                        background: `linear-gradient(90deg, ${accent} 0%, ${accent}88 100%)`,
                    }}
                    className="h-1 shrink-0"
                />

                {/* Ticket header row */}
                <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px] border-b border-[rgba(243,234,210,0.06)]">
                    <div className="flex items-center gap-2">
                        <div
                            style={{
                                background: accent + "22",
                                borderColor: accent + "55",
                            }}
                            className="w-7 h-7 rounded-full border border-solid flex items-center justify-center text-xs"
                        >
                            ✈
                        </div>
                        <div>
                            <div
                                style={{ color: accent }}
                                className="text-[8px] tracking-[0.2em] uppercase font-normal"
                            >
                                BPS · Polstat STIS
                            </div>
                            
                        </div>
                    </div>
                    <span
                        style={{
                            fontFamily: "var(--font-title)",
                            color: accent,
                            opacity: hov ? 1 : 0.45,
                        }}
                        className="text-[clamp(28px,3vw,40px)] font-black leading-none tracking-[-0.04em] transition-opacity duration-350"
                    >
                        {num}
                    </span>
                </div>

                {/* Main body */}
                <div className="px-5 pt-4 pb-3 flex flex-col gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[8px] tracking-[0.18em] uppercase text-[rgba(243,234,210,0.35)] font-light">
                                Dari
                            </span>
                            <span
                                style={{ fontFamily: "var(--font-content)" }}
                                className="text-[clamp(15px,1.8vw,20px)] font-bold text-[var(--cream,#f3ead2)] tracking-[0.05em]"
                            >
                                JKT
                            </span>
                            <span className="text-[9px] text-[rgba(243,234,210,0.4)] font-light">
                                Jakarta / BPS
                            </span>
                        </div>

                        <div className="flex-1 flex flex-col items-center gap-1 px-1.5">
                            <div style={{ color: accent }} className="text-[11px]">✈</div>
                            <div
                                style={{
                                    background: `repeating-linear-gradient(95deg, ${accent}55 0px, ${accent}55 4px, transparent 4px, transparent 8px)`,
                                }}
                                className="w-full h-px"
                            />
                        </div>

                        <div className="flex flex-col gap-0.5 items-end">
                            <span className="text-[8px] tracking-[0.18em] uppercase text-[rgba(243,234,210,0.35)] font-light">
                                Tujuan
                            </span>
                            <span
                                style={{ fontFamily: "var(--font-content)" }}
                                className="text-[clamp(15px,1.8vw,20px)] font-bold text-[var(--cream,#f3ead2)] tracking-[0.05em]"
                            >
                                {num === 1 ? "ACE" : num === 2 ? "MES" : "PDG"}
                            </span>
                            <span className="text-[9px] text-[rgba(243,234,210,0.4)] font-light text-right">
                                {num === 1 ? "Aceh / Sumut" : num === 2 ? "Lintas Provinsi" : "Sumatera Barat"}
                            </span>
                        </div>
                    </div>

                    <h3
                        style={{
                            fontFamily: "var(--font-title)",
                            borderColor: accent,
                        }}
                        className="italic text-[clamp(14px,1.4vw,18px)] !text-[var(--cream,#f3ead2)] m-0 leading-[1.3] border-l-2 pl-2.5"
                    >
                        {region}
                    </h3>
                </div>
                <div
                    style={{ display: hov ? 'block' : 'none' }}
                    className="absolute inset-x-0 bottom-0 border-t-2 border-dashed border-[rgba(243,234,210,0.15)] transition-all duration-300 ease-in-out"
                />
            </div>

            {/* ── GARIS SOBEKAN ── */}
            <div className="relative h-px my-0 z-50">
                <div
                    style={{ display: torn ? 'none' : 'block' }}
                    className="absolute inset-x-0 top-0 border-t-2 border-dashed border-[rgba(243,234,210,0.15)]"
                />
            </div>

            {/* ── BAGIAN BAWAH ── */}
            <div
                style={{
                    background: hov ? "rgba(10,16,34,0.88)" : "rgba(10,16,34,0.72)",
                    borderColor: hov ? accent + "66" : "rgba(243,234,210,0.10)",
                    transform: torn
                        ? "translateY(160px) rotate(12deg) scale(0.95)"
                        : "translateY(0)",
                    opacity: torn ? 0 : 1,
                    transition: torn
                        ? "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.5s ease"
                        : "transform 0.3s ease, opacity 0.3s ease, background 0.4s, border-color 0.4s",
                    boxShadow: hov ? `0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px ${accent}33` : "0 8px 24px rgba(0,0,0,0.3)",
                }}
                className="px-5 pt-[14px] pb-[18px] flex flex-col gap-3 backdrop-blur-[20px] [-webkit-backdrop-filter:blur(20px)] border-b border-x border-solid relative z-20"
            >
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: "Riset", val: num },
                        { label: "Periode", val: "Jan–Feb" },
                        { label: "Tahun", val: "2026" },
                    ].map((f, i) => (
                        <div key={f.label} className="flex flex-col gap-0.5 items-center">
                            <span className="text-[7px] tracking-[0.18em] uppercase text-[rgba(243,234,210,0.3)] font-light">
                                {f.label}
                            </span>
                            <span className="text-[clamp(11px,1.1vw,13px)] font-bold text-[var(--cream,#f3ead2)] tracking-[0.04em]">
                                {i === 0 ? `#${f.val}` : f.val}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-[clamp(10px,0.9vw,12px)] leading-[1.65] text-[rgba(243,234,210,0.45)] font-light m-0">
                    {copy}
                </p>

                <div className="flex gap-0.5 items-end opacity-[0.18]">
                    {[3, 5, 2, 7, 4, 6, 2, 5, 3, 6, 4, 7, 3, 5, 2, 6, 4, 3, 7, 5, 2, 4, 6, 3].map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h * 3}px` }}
                            className="w-0.5 bg-[var(--cream,#f3ead2)] shrink-0"
                        />
                    ))}
                </div>

                <a
                    href={href}
                    style={{
                        background: hov ? accent : "rgba(255, 255, 255, 0.03)",
                        borderColor: hov ? accent : accent + "55",
                        boxShadow: hov ? `0 8px 20px ${accent}40` : "none",
                    }}
                    className="relative flex items-stretch rounded-[10px] border border-solid no-underline overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
                >
                    <div
                        style={{
                            background: hov ? "rgba(0,0,0,0.12)" : accent + "18",
                            borderRight: `1px dashed ${hov ? "rgba(0,0,0,0.2)" : accent + "44"}`,
                        }}
                        className="py-[10px] px-3 flex flex-col justify-center items-center min-w-[75px] transition-colors duration-300"
                    >
                        <span
                            style={{
                                color: hov ? "var(--navy-deep, #0f172a)" : accent,
                            }}
                            className="text-[7px] tracking-[0.15em] uppercase font-bold"
                        >
                            BOARDING
                        </span>
                        <span
                            style={{
                                color: hov ? "var(--navy-deep, #0f172a)" : "rgba(243,234,210,0.6)",
                            }}
                            className="text-[9px] tracking-[0.1em] font-medium"
                        >
                            PASS
                        </span>
                    </div>

                    <div className="flex-1 py-[10px] px-4 flex items-center justify-between">
                        <span
                            style={{
                                fontFamily: "var(--font-title)",
                                color: hov ? "var(--navy-deep, #0f172a)" : "var(--cream, #f3ead2)",
                            }}
                            className="italic text-[clamp(11px,1.05vw,13px)] font-bold tracking-[0.02em] transition-colors duration-300"
                        >
                            Buka Riset {num}
                        </span>

                        <div
                            style={{
                                color: hov ? "var(--navy-deep, #0f172a)" : accent,
                                transform: hov ? "translateX(4px)" : "translateX(0)",
                            }}
                            className="flex items-center gap-1.5 transition-[transform,color] duration-300"
                        >
                            <span className="text-[11px]">✈</span>
                            <span className="text-[13px] font-bold">→</span>
                        </div>
                    </div>
                </a>
            </div>
        </div>
    );
}