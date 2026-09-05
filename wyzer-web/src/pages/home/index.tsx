import { Navbar } from '@components/layout/Navbar';
import { Footer } from '@components/layout/Footer';
import { Seo } from '@components/Seo';
import { SITE_URL, DEFAULT_DESCRIPTION } from '../../lib/site';
import { HeroSection } from '@components/home/HeroSection';
import { ProblemSection } from '@components/home/ProblemSection';
import { HowItWorksSection } from '@components/home/HowItWorksSection';
import { FrameworksSection } from '@components/home/FrameworksSection';
import { FeaturesSection } from '@components/home/FeaturesSection';
import { PricingSection } from '@components/home/PricingSection';
import { CtaSection } from '@components/home/CtaSection';

export default function HomePage() {
 const jsonLd = [
  {
   '@context': 'https://schema.org',
   '@type': 'Organization',
   name: 'Wyzer',
   url: SITE_URL,
   description: DEFAULT_DESCRIPTION,
  },
  {
   '@context': 'https://schema.org',
   '@type': 'WebSite',
   name: 'Wyzer',
   url: SITE_URL,
  },
 ];
 return (
  <>
   <Seo path='/' jsonLd={jsonLd} />
   <Navbar />
   <main id='main-content'>
    <HeroSection />
    <ProblemSection />
    <HowItWorksSection />
    <FrameworksSection />
    <FeaturesSection />
    <PricingSection />
    <CtaSection />
   </main>
   <Footer />
  </>
 );
}
