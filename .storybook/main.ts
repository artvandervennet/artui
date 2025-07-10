import type { StorybookConfig } from '@storybook/vue3-vite'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Accessibility testing
    '@storybook/addon-viewport', // Responsive testing
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {},
  },
  typescript: {
    check: true,
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      // Add your Vite config customizations here
      css: {
        preprocessorOptions: {
          scss: {
            additionalData: `
              @import "../src/styles/tokens/colors.scss";
              @import "../src/styles/tokens/spacing.scss";
            `,
          },
        },
      },
    })
  },
}

export default config
