<template>
  <div class="mb-4">
    <label class="block mb-1 text-sm font-medium text-gray-700">{{ label }}</label>
    <input
        type="date"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:ring-blue-300"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String
})
defineEmits(['update:modelValue'])
</script>