<template>
  <Layout current-name="TimeLine">
    <div class="overflow-hidden bg-white shadow sm:rounded-md">
      <draggable v-model="timeline" item-key="title" tag="ul" class="divide-y divide-gray-200"
                 @change="changedOrder" :key="timelineKey">
        <template #item="{element, index}">
          <TimeEntry
              :item="{
        ...element,
        start: getStartTime(index)
      }"
              :key="element.title"
          />
        </template>
      </draggable>
    </div>
    <span class="text-sm">Totale Dauer: {{ formatSeconds(totalDuration) }}</span>

  </Layout>
</template>

<script setup>
import Layout from "../Layout.vue";
import {computed, ref} from "vue";
import TimeEntry from "../components/TimeEntry.vue";
import draggable from "vuedraggable"

const timelineKey = ref(0);

const timeline = ref([
  {
    'title': 'Blaton Intro Jingle',
    'duration': 10, // sekunden
    'type': 'jingle'
  },
  {
    'title': 'Anmoderation',
    'duration': 80, // sekunden
    'type': 'moderation'
  },
  {
    'title': 'Song 1',
    'duration': 190, // sekunden
    'type': 'song'
  },
  {
    'title': 'Rabe Fly Jingle',
    'duration': 5, // sekunden
    'type': 'jingle'
  },
  {
    'title': 'Moderation Thema X',
    'duration': 180, // sekunden
    'type': 'moderation'
  },
  {
    'title': 'PA69 feat. Drunken Masters - Barfuss auf dem Floor',
    'duration': 145, // sekunden
    'type': 'song'
  },
  {
    'title': 'Jain - Makeba',
    'duration': 249, // sekunden
    'type': 'song'
  },
]);

const getStartTime = (index) => {
  return timeline.value
      .slice(0, index)
      .reduce((acc, cur) => acc + cur.duration, 0)
}

function changedOrder(event) {
  console.log(event);
  timelineKey.value++;
  //timeline.value = event
}

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const totalDuration = computed(() =>
    timeline.value.reduce((total, item) => total + item.duration, 0)
);
</script>