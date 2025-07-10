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

<style scoped lang="scss"></style>
