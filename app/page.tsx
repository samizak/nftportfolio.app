import LandingHeader from "@/components/landing-page/LandingHeader";
import HeroSection from "@/components/landing-page/HeroSection";
import FeaturesSection from "@/components/landing-page/FeaturesSection";
import HowItWorksSection from "@/components/landing-page/HowItWorksSection";
import PricingSection from "@/components/landing-page/PricingSection";
import FaqSection from "@/components/landing-page/FaqSection";
import CtaSection from "@/components/landing-page/CtaSection";
import LandingFooter from "@/components/landing-page/LandingFooter";
import LenisScroller from "@/components/LenisScroller";

export default function LandingPage() {
  return (
    <LenisScroller>
      <div className="flex min-h-screen flex-col">
        <LandingHeader />
        <main className="flex-1 w-full">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <PricingSection />
          <FaqSection />
          <CtaSection />
        </main>
        <LandingFooter />
      </div>
    </LenisScroller>
  );
}
