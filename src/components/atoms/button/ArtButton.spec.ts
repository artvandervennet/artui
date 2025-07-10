import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from './ArtButton.vue'

describe('Button', () => {
  it('renders correctly', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me',
      },
    })

    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.classes()).toContain('btn')
    expect(wrapper.classes()).toContain('btn--primary')
    expect(wrapper.classes()).toContain('btn--md')
  })

  it('applies correct variant classes', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const

    variants.forEach((variant) => {
      const wrapper = mount(Button, {
        props: { variant },
        slots: { default: 'Test' },
      })

      expect(wrapper.classes()).toContain(`btn--${variant}`)
    })
  })

  it('applies correct size classes', () => {
    const sizes = ['sm', 'md', 'lg'] as const

    sizes.forEach((size) => {
      const wrapper = mount(Button, {
        props: { size },
        slots: { default: 'Test' },
      })

      expect(wrapper.classes()).toContain(`btn--${size}`)
    })
  })

  it('handles disabled state', () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Test' },
    })

    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.element.hasAttribute('disabled')).toBe(true)
  })

  it('handles loading state', () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Test' },
    })

    expect(wrapper.classes()).toContain('btn--loading')
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn__spinner').exists()).toBe(true)
    expect(wrapper.find('.btn__content--hidden').exists()).toBe(true)
  })

  it('handles full width', () => {
    const wrapper = mount(Button, {
      props: { fullWidth: true },
      slots: { default: 'Test' },
    })

    expect(wrapper.classes()).toContain('btn--full-width')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button, {
      slots: { default: 'Test' },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
      slots: { default: 'Test' },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(Button, {
      props: { loading: true },
      slots: { default: 'Test' },
    })

    await wrapper.trigger('click')

    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders left icon slot', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Test',
        iconLeft: '<svg data-testid="left-icon"></svg>',
      },
    })

    expect(wrapper.find('[data-testid="left-icon"]').exists()).toBe(true)
    expect(wrapper.find('.btn__icon--left').exists()).toBe(true)
  })

  it('renders right icon slot', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Test',
        iconRight: '<svg data-testid="right-icon"></svg>',
      },
    })

    expect(wrapper.find('[data-testid="right-icon"]').exists()).toBe(true)
    expect(wrapper.find('.btn__icon--right').exists()).toBe(true)
  })

  it('sets correct button type', () => {
    const wrapper = mount(Button, {
      props: { type: 'submit' },
      slots: { default: 'Test' },
    })

    expect(wrapper.attributes('type')).toBe('submit')
  })

  it('has correct default props', () => {
    const wrapper = mount(Button, {
      slots: { default: 'Test' },
    })

    expect(wrapper.props()).toEqual({
      variant: 'primary',
      size: 'md',
      disabled: false,
      loading: false,
      type: 'button',
      fullWidth: false,
    })
  })
})
