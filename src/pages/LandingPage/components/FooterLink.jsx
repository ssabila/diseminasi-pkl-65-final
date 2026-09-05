import { useState } from "react";

export default function FooterLink({ children }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="#"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ color: hov ? "var(--beige)" : "rgba(243,234,210,0.3)" }}
      className="text-[11px] tracking-[0.12em] uppercase no-underline transition-colors duration-200"
    >
      {children}
    </a>
  );
}