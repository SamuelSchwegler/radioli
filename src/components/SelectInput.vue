<template>
  <div class="mb-4">
    <label class="block mb-1 text-sm font-medium text-gray-700">{{ label }}</label>
    <select
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
        class="w-full px-3 py-2 border rounded-md bg-white focus:outline-none focus:ring focus:ring-blue-300"
    >
      <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  options: {
    type: Array,
    required: true,
    default: () => []
  }
})

defineEmits(['update:modelValue'])
</script>