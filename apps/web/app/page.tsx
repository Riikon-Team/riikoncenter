import { HeroSection } from "@/components/landing/HeroSection";
import { ProductivitySection } from "@/components/landing/ProductivitySection";
import { ToolsSection } from "@/components/landing/ToolsSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { FooterSection } from "@/components/landing/FooterSection";
import { LandingHeader } from "@/components/landing/LandingHeader";

export default function Home() {
  return (
    <main id="landing-scroll-container" className="h-dvh w-full overflow-y-auto snap-y snap-mandatory scroll-smooth relative">
      <LandingHeader />
      <HeroSection />
      <ProductivitySection />
      <ToolsSection />
      <TeamSection />
      <FooterSection />
    </main>
  );
}
