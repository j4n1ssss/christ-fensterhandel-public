import { baseConfig, extendConfig } from '@delmaredigital/payload-puck/config'
import { HeroBlock } from '@/components/puck-blocks/hero-block'
import { TextBlock } from '@/components/puck-blocks/text-block'
import { FeatureGridBlock } from '@/components/puck-blocks/feature-grid-block'
import { CTABannerBlock } from '@/components/puck-blocks/cta-banner-block'
import { ImageTextBlock } from '@/components/puck-blocks/image-text-block'

/**
 * Extended Puck configuration with custom Muster Fenster block components.
 *
 * Extends the base config (server-safe) with 5 custom blocks organized
 * in two categories: layout and content.
 *
 * Used by:
 * - PageRenderer on the frontend for rendering published pages
 * - The Puck editor in the admin for editing pages
 */
export const puckConfig = extendConfig({
  base: baseConfig,
  components: {
    HeroBlock,
    TextBlock,
    FeatureGridBlock,
    CTABannerBlock,
    ImageTextBlock,
  },
  categories: {
    'block-layout': {
      title: 'Layout',
      components: ['HeroBlock', 'CTABannerBlock'],
    },
    'block-content': {
      title: 'Inhalt',
      components: ['TextBlock', 'FeatureGridBlock', 'ImageTextBlock'],
    },
  },
})
