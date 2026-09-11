export default function Kicker({ children }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-[1px] bg-[var(--gold)]" />
      <span className="font-[family-name:var(--font-content)] text-[10px] tracking-[0.2em] uppercase text-[var(--gold)] font-normal">
        {children}
      </span>
    </div>
  );
}