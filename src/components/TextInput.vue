<template>
  <div>
    <label class="block mb-1 text-sm font-medium text-gray-700">{{ label }}</label>
    <div class="relative">
      <input
          type="text"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          class="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-150 ease-in-out"
          :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: String,
  label: String
})
defineEmits(['update:modelValue'])
</script>