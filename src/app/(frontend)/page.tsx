import { HeroVideo } from "@/components/marketing/hero-section";
import { ProductsSection } from "@/components/marketing/products-section";
import { ContactSection } from "@/components/marketing/contact-section";
import { ShippingSection } from "@/components/marketing/shipping-section";
import { FaqSection } from "@/components/marketing/faq-section";
import { GallerySection } from "@/components/marketing/gallery-section";
import { AboutSection } from "@/components/marketing/about-section";
import { DrutexSection } from "@/components/marketing/drutex-section";
import { ConfiguratorCtaSection } from "@/components/marketing/configurator-cta-section";
import { ScrollAnimationSection } from "@/components/marketing/scroll-animation-section";

/**
 * Homepage · Sektions-Stack.
 *
 * Reihenfolge bewusst: vom Hero (Immersion) → Produkte (Was) →
 * Kontakt (Wer ist erreichbar) → Versand (Wie gehts weiter) →
 * FAQ (Fragen) → Galerie (Beweis) → Über uns (Werte) →
 * DRUTEX (Hersteller-Vertrauen) → Konfigurator-CTA (Abschluss).
 *
 * Design-Rhythmus: Weiss ↔ Black-50 im Wechsel, DRUTEX dark als
 * dramaturgischer Kontrast vor dem Brand-500 Endstrip.
 *
 * Copy-Quellen: Platzhalter aus firmendaten.md. Finaler Copy via
 * docs/website/relaunch/neuer-content/homepage.md (aktuell TODO).
 */
export default function HomePage() {
  return (
    <>
      <HeroVideo
        videoSrc="https://www.drutex.de/media/_upload/sections/movie-block/1920x940-firma-animacja_02.mp4"
        eyebrow="Muster Fenster · Musterstadt"
        headline="Massgefertigte Fenster und Türen."
        body="Kunststoff-, Aluminium- und Holzfenster, Türen und Rollläden — individuell konfiguriert, vermessen und eingebaut. Exklusiver DRUTEX-Partner in Musterstadt."
        ctaPrimary={{ label: "Konfigurator starten", href: "/konfigurator" }}
        ctaSecondary={{ label: "Produkte ansehen", href: "/produkte" }}
      />
      <ProductsSection />

      <ScrollAnimationSection
        basePath="/assets/scroll-animations/01-messe-nuernberg-2026"
        slug="targi-norymberga-zaproszenie-2026"
        textPosition="left"
        eyebrow="Live erleben"
        headline="Messe Nürnberg 2026"
        body="Besuchen Sie uns mit DRUTEX auf der wichtigsten Branchenmesse Europas — Produktneuheiten, Material-Kombinationen, Expertengespräche."
        cta={{ label: "Termin vereinbaren", href: "/kontakt" }}
      />

      <ScrollAnimationSection
        basePath="/assets/scroll-animations/03-iglo-edge-rolladen-turner-oak"
        slug="iglo-edge-z-roleta-turner-oak-white"
        textPosition="left"
        eyebrow="Dämmung und Sichtschutz in einem Rahmen"
        headline="Iglo Edge — Fenster mit integriertem Rolladen"
        body="Bündig eingebauter Rolladen, keine sichtbaren Kästen, keine Kältebrücken. Maximale Energieeffizienz mit klaren Linien."
      />

      <ScrollAnimationSection
        basePath="/assets/scroll-animations/04-d-art-line-weiss"
        slug="d-art-line-white-far"
        textPosition="left"
        eyebrow="Maximum Glas, minimaler Rahmen"
        headline="D-Art Line — Fenster für moderne Architektur"
        body="Die schlanksten Ansichten im DRUTEX-Programm. Mehr Licht, mehr Aussicht, weniger Rahmen."
      />

      <ScrollAnimationSection
        basePath="/assets/scroll-animations/05-d-gate-tor"
        slug="brama-d-gate"
        textPosition="left"
        eyebrow="Eingang mit Statement"
        headline="D-Gate — Ihre Haustür, Ihre Visitenkarte"
        body="Aluminium-Haustüren mit höchster Wärmedämmung, einbruchhemmend, über 200 Designs konfigurierbar. Smart-Lock ready."
      />

      <ContactSection />
      <ShippingSection />
      <FaqSection />
      <GallerySection />
      <AboutSection />
      <DrutexSection />
      <ConfiguratorCtaSection />
    </>
  );
}
