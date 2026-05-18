import { Navbar } from '@components/layout/Navbar';
import { Footer } from '@components/layout/Footer';
import { HeroSection } from '@components/home/HeroSection';
import { ProblemSection } from '@components/home/ProblemSection';
import { HowItWorksSection } from '@components/home/HowItWorksSection';
import { FrameworksSection } from '@components/home/FrameworksSection';
import { FeaturesSection } from '@components/home/FeaturesSection';
import { PricingSection } from '@components/home/PricingSection';
import { WaitlistSection } from '@components/home/WaitlistSection';
import { CtaSection } from '@components/home/CtaSection';

export default function HomePage() {
 return (
  <>
   <Navbar />
   <main>
    <HeroSection />
    <ProblemSection />
    <HowItWorksSection />
    <FrameworksSection />
    <FeaturesSection />
    <PricingSection />
    <WaitlistSection />
    <CtaSection />
   </main>
   <Footer />
  </>
 );
}
