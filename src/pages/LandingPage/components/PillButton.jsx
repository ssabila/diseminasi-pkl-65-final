import { useState } from "react";

export default function PillButton({ children, href, primary, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={(e) => onClick(e)}
      style={{
        backgroundColor: primary ? (hov ? "transparent" : "var(--beige)") : (hov ? "var(--beige)" : "transparent"),
        color: primary ? (hov ? "var(--beige)" : "var(--navy)") : (hov ? "var(--navy)" : "var(--beige)"),
        boxShadow: hov ? "0 10px 24px rgba(0,0,0,0.45)" : "0 4px 14px rgba(0,0,0,0.28)",
      }}
      className="inline-flex items-center gap-2 py-2.5 px-6.5 rounded-full font-[family-name:var(--font-title)] italic text-[clamp(13px,1.2vw,15px)] font-bold no-underline border-2 border-[var(--beige)] cursor-pointer transition-all duration-300"
    >
      {children}
    </a>
  );
}