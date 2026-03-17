import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustedBy, { domains } from "./components/TrustedBy";
import FeatureGrid1 from "./components/FeatureGrid1";
import QuickLinks from "./components/QuickLinks";
import BlogSection from "./components/BlogSection";
import PressSection from "./components/PressSection";
import FooterCTA from "./components/FooterCTA";
import FooterNav from "./components/FooterNav";
import DomainShowcase from "./components/DomainShowcase";

const defaultHeading = "Crafting digital experiences that matter";
const defaultSubheading =
  "I design and build end-to-end systems where hardware, mobile, and cloud converge.";

export default function App() {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const current = domains.find((d) => d.id === activeDomain) ?? null;

  return (
    <div className="min-h-screen bg-primary">
      {/* Terminal overlays */}
      <div className="scanline-overlay" />
      <div className="dot-grid-overlay" />

      <Navbar />

      {/* Hero */}
      <Hero />

      {/* Domain pills */}
      <TrustedBy activeDomain={activeDomain} onDomainChange={setActiveDomain} />

      {/* Domain showcase — particles + animated text */}
      <DomainShowcase
        domain={current}
        defaultHeading={defaultHeading}
        defaultSubheading={defaultSubheading}
      />

      {/* Featured Projects Grid */}
      <FeatureGrid1 />

      {/* Quick Links — Projects, Prizes, Certificates */}
      <QuickLinks />

      {/* Blog */}
      <BlogSection />

      {/* Press & Recognition */}
      <PressSection />

      {/* Footer CTA */}
      <FooterCTA />

      {/* Footer Nav */}
      <FooterNav />
    </div>
  );
}
