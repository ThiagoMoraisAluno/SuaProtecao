import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Advantages } from "@/components/landing/Advantages";
import { About } from "@/components/landing/About";
import { Services } from "@/components/landing/Services";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Portfolio } from "@/components/landing/Portfolio";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { Coverage } from "@/components/landing/Coverage";
import { FAQ } from "@/components/landing/FAQ";
import { CTAFinal } from "@/components/landing/CTAFinal";
import { Blog } from "@/components/landing/Blog";
import { FeaturesBar } from "@/components/landing/FeaturesBar";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-white text-slate-900 antialiased selection:bg-brand-200 selection:text-navy-900">
      <Navbar />
      <main>
        <Hero />
        <Advantages />
        <About />
        <Services />
        <HowItWorks />
        <Portfolio />
        <Pricing />
        <Testimonials />
        <Coverage />
        <FAQ />
        <CTAFinal />
        <Blog />
        <FeaturesBar />
      </main>
      <Footer />
    </div>
  );
}
