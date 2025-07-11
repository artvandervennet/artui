<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
    type?: 'button' | 'submit' | 'reset'
    fullWidth?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
    type: 'button',
    fullWidth: false,
  },
)

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const isDisabled = computed(() => props.disabled || props.loading)

const handleClick = (event: MouseEvent) => {
  if (!isDisabled.value) {
    emit('click', event)
  }
}
</script>

<template>
  <button
    :type="type"
    :disabled="isDisabled"
    :class="[
      'btn',
      `btn--${variant}`,
      `btn--${size}`,
      {
        'btn--loading': loading,
        'btn--full-width': fullWidth,
      },
    ]"
    @click="handleClick"
  >
    <span v-if="$slots.iconLeft" class="btn__icon btn__icon--left">
      <slot name="iconLeft" />
    </span>

    <span class="btn__content" :class="{ 'btn__content--hidden': loading }">
      <slot />
    </span>

    <span v-if="$slots.iconRight" class="btn__icon btn__icon--right">
      <slot name="iconRight" />
    </span>
  </button>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/styles/tokens/colors' as *;
@use '@/styles/tokens/spacing' as *;

.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: $border-radius-md;
  font-weight: 500;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
  white-space: nowrap;
  user-select: none;

  &:focus-visible {
    outline: $accent-500 solid 2px;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--full-width {
    width: 100%;
  }

  // Sizes
  &--sm {
    padding: $button-padding-y-sm $button-padding-x-sm;
    font-size: 0.875rem;
    line-height: 1.25rem;
    gap: $spacing-1;
  }

  &--md {
    padding: $button-padding-y-md $button-padding-x-md;
    font-size: 1rem;
    line-height: 1.5rem;
    gap: $spacing-2;
  }

  &--lg {
    padding: $button-padding-y-lg $button-padding-x-lg;
    font-size: 1.125rem;
    line-height: 1.75rem;
    gap: $spacing-2;
  }

  // Variants
  &--primary {
    background-color: $accent-500;
    color: white;

    &:hover:not(:disabled) {
      background-color: $accent-600;
    }

    &:active:not(:disabled) {
      background-color: $accent-700;
    }
  }

  &--secondary {
    background-color: $gray-100;
    color: $gray-900;

    &:hover:not(:disabled) {
      background-color: color.adjust($gray-100, $lightness: -5%);
    }

    &:active:not(:disabled) {
      background-color: color.adjust($gray-100, $lightness: -10%);
    }
  }

  &--ghost {
    background-color: transparent;
    color: $accent-500;

    &:hover:not(:disabled) {
      background-color: $accent-50;
    }

    &:active:not(:disabled) {
      background-color: $accent-100;
    }
  }

  &--danger {
    background-color: $error;
    color: white;

    &:hover:not(:disabled) {
      background-color: color.adjust($error, $lightness: -10%);
    }

    &:active:not(:disabled) {
      background-color: color.adjust($error, $lightness: -15%);
    }
  }

  // Icon styles
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--left {
      margin-right: $spacing-negative-1;
    }

    &--right {
      margin-left: $spacing-negative-1;
    }

    :deep(svg) {
      width: 1em;
      height: 1em;
    }
  }

  // Loading spinner
  &__spinner {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;

    &-svg {
      width: 1em;
      height: 1em;
      animation: spin 1s linear infinite;
    }

    &-circle {
      stroke-dasharray: 31.416;
      stroke-dashoffset: 31.416;
      animation: dash 2s ease-in-out infinite;
    }
  }

  &__content {
    transition: opacity 0.2s ease;

    &--hidden {
      opacity: 0;
    }
  }

  &--loading {
    pointer-events: none;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }

  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }

  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}
</style>
