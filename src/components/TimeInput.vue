<template>
  <div class="mb-2">
    <label class="block mb-1 text-sm font-medium text-gray-700">{{ label }}</label>
    <input
        type="text"
        v-model="localTime"
        @blur="applyTime"
        placeholder="mm:ss"
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  modelValue: Number, // in seconds
  label: String
})

const emit = defineEmits(['update:modelValue'])

// Local editable input state
const localTime = ref('')

// Format seconds to mm:ss
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Sync local display when modelValue changes
watch(() => props.modelValue, (val) => {
  localTime.value = formatTime(val)
}, { immediate: true })

// Apply time on blur or enter
const applyTime = () => {
  const [m, s] = localTime.value.split(':').map(str => parseInt(str, 10))

  if (!isNaN(m)) {
    const seconds = (m || 0) * 60 + (s || 0)
    emit('update:modelValue', seconds)
    localTime.value = formatTime(seconds)
  } else {
    // fallback: reset display
    localTime.value = formatTime(props.modelValue)
  }
}
</script>