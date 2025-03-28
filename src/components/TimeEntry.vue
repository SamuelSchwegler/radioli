<template>
  <li class="px-4 py-4 sm:px-6 cursor-move" :class="{[type.color]: true}">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <div class="text-sm text-left">{{ formattedStart }}</div>
        <div class="font-semibold">{{ item.title }}</div>
      </div>
      <div class="flex items-center gap-2 px-2">
        <div v-if="item.moderation" class="text-sm text-white whitespace-pre-wrap bg-black/10 p-2 rounded">
          {{ item.moderation }}
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="text-sm ">{{ formattedDuration }}</div>
        <PencilIcon @click="editEntry" class="w-4 h-4 text-black"/>
      </div>
    </div>
  </li>
</template>

<script setup>
import {PencilIcon} from "@heroicons/vue/24/solid/index.js";
import {ref} from "vue";

const props = defineProps({
  item: Object,
  types: Array
})

const item = ref(props.item)
const type = props.types.find(type => type.value === item.value.type)

const emit = defineEmits(['edit']);

function editEntry() {
  emit('edit', item.value)
}

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const formattedStart = formatSeconds(props.item.start);
const formattedDuration = formatSeconds(props.item.duration);

</script>