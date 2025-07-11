import type { Preview } from '@storybook/vue3-vite'
import '../src/styles/tokens/colors.scss'
import '../src/styles/tokens/spacing.scss'

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    // Add global viewport sizes
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1024px',
            height: '768px',
          },
        },
      },
    },
  },
  // Global decorators for all stories
  decorators: [
    () => ({
      template: '<div style="padding: 2rem;"><story /></div>',
    }),
  ],
}

export default preview
