<template>
  <li class="px-4 py-2.5 sm:px-6 cursor-move" :class="{[type.color]: true}">
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-1">
        <div class="text-sm text-left">{{ formattedStart }}</div>
        <div class="text-sm text-center w-12">
          {{ item.tecNumber }}
        </div>
        <div class="font-semibold">{{ item.title }}</div>
      </div>
      <div class="flex items-center gap-2 px-2">
        <div v-if="item.moderation" class="text-sm text-black whitespace-pre-wrap p-2 rounded max-h-24 overflow-scroll">
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