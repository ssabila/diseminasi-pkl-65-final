import HeroSection from "./sections/HeroSection";
import StatsSection from "./sections/StatsSection";
import MandateSection from "./sections/MandateSection";
import QuoteSection from "./sections/QuoteSection";
import PortalsSection from "./sections/PortalSection";
import CloudLoadingOverlay from "./components/CloudLoadingOverlay"
import gsap from '../../utils/gsapConfig';
import FooterSection from "./sections/FooterSection";

export const masterTL = gsap.timeline();
export default function LandingPage() {
  return (
    <div className="bg-[#0f172a] text-[var(--beige)] font-[family-name:var(--font-content)] selection:bg-[var(--gold)] selection:text-[var(--navy)]">
      <CloudLoadingOverlay />
      <HeroSection />
      <MandateSection />
      <StatsSection />
      <QuoteSection />
      <PortalsSection />
      <FooterSection/>
    </div>
  );
}
