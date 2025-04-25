import { NavHeader } from "@/components/layout/nav-header";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { ScenariosSection } from "@/components/home/scenarios-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { Footer } from "@/components/layout/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <ScenariosSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
