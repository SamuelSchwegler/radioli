<template>
  <Layout current-name="TimeLine">
    <div class="grid gap-4 lg:grid-cols-3">
      <div class="relative lg:col-span-2">
        <div class="overflow-hidden bg-white shadow sm:rounded-md">
          <draggable v-model="timeline" item-key="title" tag="ul" class="divide-y divide-gray-200"
                     @change="changedOrder" :key="timelineKey">
            <template #item="{element, index}">
              <TimeEntry
                  v-on:edit="(item) => editEntry = item"
                  :item="{
                    ...element,
                    start: getStartTime(index),
                    tecNumber: getTecNumber(index)
                  }"
                  :key="element.title"
                  :types="types"
              />
            </template>
          </draggable>
        </div>
        <span class="text-sm">Totale Dauer: {{ formatSeconds(totalDuration) }}</span><br>
        <button
            @click="addEntry"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Neuer Eintrag
        </button>
      </div>
      <div class="relative">
        <button
            @click="downloadProgramme"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          XML Herunterladen
        </button>
        <button
            @click="downloadExcel"
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Excel Herunterladen
        </button>
        <template v-if="editEntry.hasOwnProperty('type')">
          <hr class="my-2">
          <TextInput v-model="editEntry.title" label="Name"/>
          <div class="grid grid-cols-2 items-center gap-2">
            <div>
              <SelectInput :options="types" v-model="editEntry.type" label="Type"/>
            </div>
            <div>
              <TimeInput v-model="editEntry.duration" label="Dauer"/>
            </div>
          </div>
          <textarea v-if="editEntry.type === 'moderation'"
                    v-model="editEntry.moderation"
                    rows="12"
                    placeholder="Enter moderation text..."
                    class="w-full p-2 text-sm border rounded bg-white text-black"
          />
          <button
              @click="overrideEntry"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Eintrag Anpassen
          </button>
          <button
              @click="removeEntry"
              class="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Eintrag Löschen
          </button>
        </template>
      </div>
    </div>

  </Layout>
</template>

<script setup>
import Layout from "../Layout.vue";
import {computed, ref} from "vue";
import TimeEntry from "../components/TimeEntry.vue";
import draggable from "vuedraggable";
import { useToast } from "vue-toastification";
const toast = useToast()

const timelineKey = ref(0);
const timeline = ref([]);
const editEntry = ref({});

const types = [{
  value: 'jingle',
  label: 'Jingle',
  color: 'bg-yellow-500'
}, {
  value: 'moderation',
  label: 'Moderation',
  color: 'bg-yellow-100'
}, {
  value: 'song',
  label: 'Song',
  color: 'bg-blue-400'
}, {
  value: 'unclear',
  label: 'Unklar',
  color: 'bg-red-500'
}, {
  value: 'feature',
  label: 'Beitrag',
  color: 'bg-blue-200'
}]

const programmTitle = ref('');

const loadMetadata = async () => {
  const response = await axios.get('http://localhost:3001/programme')
  timeline.value = response.data.entries
  programmTitle.value = response.data.meta.title
}
loadMetadata();

const getStartTime = (index) => {
  return timeline.value
      .slice(0, index)
      .reduce((acc, cur) => acc + cur.duration, 0)
}

const getTecNumber = (index) => {
  if (timeline.value[index].type === 'moderation') {
    return ''
  }

  return timeline.value
      .slice(0, index)
      .filter((item) => item.type !== 'moderation').length + 1
}

function changedOrder(event) {
  timelineKey.value++;
  saveProgramme();
}

function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const totalDuration = computed(() =>
    timeline.value.reduce((total, item) => total + item.duration, 0)
);

import axios from 'axios'
import SelectInput from "../components/SelectInput.vue";
import TimeInput from "../components/TimeInput.vue";
import TextInput from "../components/TextInput.vue";

const saveProgramme = async () => {
  await axios.post('http://localhost:3001/programme/entries', timeline.value)
  toast.success('Programm erfolgreich gespeichert!')
}

const downloadProgramme = async () => {
  const response = await fetch('http://localhost:3001/programme/download')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = programmTitle.value + '.xml'
  a.click()
  window.URL.revokeObjectURL(url)
}

const downloadExcel = async () => {
  const response = await fetch('http://localhost:3001/programme/excel')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = programmTitle.value + '.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

function addEntry() {
  editEntry.value = {
    id: crypto.randomUUID(),
    title: 'Neuer Eintrag',
    type: 'unclear',
    duration: 180
  };
  timeline.value.push(editEntry.value);
  timelineKey.value++;

  saveProgramme();
}

function removeEntry() {
  timeline.value = timeline.value.filter(item => item.id !== editEntry.value.id);
  timelineKey.value++;
  editEntry.value = {};

  saveProgramme();
}

function overrideEntry() {
  timeline.value = timeline.value.map(item => {
    if (item.id === editEntry.value.id) {
      return editEntry.value;
    }
    return item;
  });

  timelineKey.value++;
  saveProgramme();
}
</script>