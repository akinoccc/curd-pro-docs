// uno.config.ts
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  shortcuts: [],
  rules: [],
  variants: [],
  theme: {
    colors: {
      // ...
    },
    fontSize: {
      'xs': '0.75rem',
      'sm': '0.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.375rem',
      '3xl': '1.5rem',
    },
  },
  presets: [
    presetWind3(),
    presetAttributify(),
    // presetIcons({
    //   collections: {
    //     tabler: () => import('@iconify-json/tabler/icons.json', { with: { type: 'json' } }).then(i => i.default),
    //   },
    //   extraProperties: {
    //     'display': 'inline-block',
    //     'height': '1.2em',
    //     'width': '1.2em',
    //     'vertical-align': 'text-bottom',
    //   },
    // }),
    presetTypography(),
    presetWebFonts(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  content: {
    pipeline: {
      include: [
        // default
        /\.(vue|[jt]sx|ts)($|\?)/,

        // 参考：https://unocss.dev/guide/extracting#extracting-from-build-tools-pipeline
      ],

      // exclude files
      // exclude: []
    },
  },
})
