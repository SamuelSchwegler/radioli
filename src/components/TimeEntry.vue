<template>
  <li class="px-4 py-4 sm:px-6" :class="{[type.color]: true}">
    <div class="flex justify-between items-center">
      <div>
        <div class="font-semibold">{{ item.title }}</div>
        <div class="text-sm">Startet um {{ formattedStart }}</div>
      </div>
      <div class="text-sm ">{{formattedDuration}} </div>
    </div>
  </li>
</template>

<script setup>
import {ref} from "vue";

const props = defineProps({
  item: Object
})

const types = [{
  value: 'jingle',
  label: 'Jingle',
  color: 'bg-blue-500'
}, {
  value: 'moderation',
  label: 'Moderation',
  color: 'bg-green-500'
}, {
  value: 'song',
  label: 'Song',
  color: 'bg-yellow-500'
}]

const item = ref(props.item)
const type = types.find(type => type.value === item.value.type)

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const formattedStart = formatSeconds(props.item.start);
const formattedDuration = formatSeconds(props.item.duration);
</script>