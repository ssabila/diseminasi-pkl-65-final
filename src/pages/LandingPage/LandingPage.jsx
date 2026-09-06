import HeroSection from "./sections/HeroSection";
import StatsSection from "./sections/StatsSection";
import MandateSection from "./sections/MandateSection";
import QuoteSection from "./sections/QuoteSection";
import PortalsSection from "./sections/PortalSection";
import CloudLoadingOverlay from "./components/CloudLoadingOverlay"
import gsap from '../../utils/gsapConfig';
import PlaneSeparator from "./components/PlaneSeparator";
import ScrollCue from "./components/ScrollCue";

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
export const masterTL = gsap.timeline();
export default function LandingPage() {
  return (
    <div className="bg-[#0f172a] z-0 text-[var(--beige)] font-[family-name:var(--font-content)] selection:bg-[var(--gold)] selection:text-[var(--navy)]">
      <CloudLoadingOverlay />
      <HeroSection />
      <PlaneSeparator />
      <MandateSection />
      <StatsSection />
      <ScrollCue />
      <QuoteSection />
      <PortalsSection />
    </div>
  );
}
