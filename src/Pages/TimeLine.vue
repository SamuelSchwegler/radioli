<template>
  <Layout current-name="TimeLine">
    <Loader v-if="loading"/>
    <div class="grid gap-4 lg:grid-cols-3 h-screen py-10" v-if="!loading">
      <div class="relative lg:col-span-2 overflow-y-auto">
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
      </div>
      <div class="relative">
        <Btn @click="downloadProgramme">
          XML Herunterladen
        </Btn>
        <Btn @click="downloadExcel">
          Excel Herunterladen
        </Btn>
        <Btn @click="downloadWord">
          Download Moderation Word
        </Btn>
        <template v-if="editEntry.hasOwnProperty('type')">
          <HorizontalLine/>
          <EditTimeLineEntry v-model="editEntry" :types="types" v-on:override="overrideEntry"
                             v-on:remove="removeEntry"/>
        </template>
        <HorizontalLine/>
        <span class="text-sm">Totale Dauer: {{ formatSeconds(totalDuration) }}</span><br>
        <Btn @click="addEntry">
          Neuer Eintrag
        </Btn>
        <Btn @click="confirmDefault" class="bg-red-500 hover:bg-red-600">
          Programm leeren
        </Btn>
        <Btn @click="confirmReset" class="bg-red-500 hover:bg-red-600">
          Standardprogramm
        </Btn>
      </div>
    </div>

  </Layout>
</template>

<script setup>
import Layout from "../Layout.vue";
import {computed, ref} from "vue";
import TimeEntry from "../components/TimeEntry.vue";
import draggable from "vuedraggable";
import {useToast} from "vue-toastification";
import Btn from "../components/Btn.vue";

const apiUrl = import.meta.env.VITE_API_URL

const toast = useToast()

const timelineKey = ref(0);
const timeline = ref([]);
const editEntry = ref({});
const loading = ref(false);

const types = [{
  value: 'jingle',
  label: 'Jingle',
  color: 'bg-yellow-400'
}, {
  value: 'moderation',
  label: 'Moderation',
  color: 'bg-white'
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
  color: 'bg-green-200'
}, {
  value: 'otone',
  label: 'O-Ton',
  color: 'bg-purple-200'
}]

const programmTitle = ref('');

const loadMetadata = () => {
  loading.value = true;
  axios.get(apiUrl + '/programme').then((response) => {
    timeline.value = response.data.entries
    programmTitle.value = response.data.meta.title
  }).catch((error) => {
    console.log(error);
    toast(error.response?.data?.message || 'Fehler beim Laden der Daten', {
      type: 'error'
    });
  }).finally(() => {
    loading.value = false;
  })
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
import HorizontalLine from "../components/HorizontalLine.vue";
import EditTimeLineEntry from "./Parts/EditTimeLineEntry.vue";
import Loader from "../components/Loader.vue";

const saveProgramme = async () => {
  await axios.post(apiUrl + '/programme/entries', timeline.value)
  toast.success('Programm erfolgreich gespeichert!')
}

const confirmReset = () => {
  if (confirm('Willst du alle Einträge zurücksetzen auf ein minimales Gerüst?')) {
    resetProgramme();
  }
};

const resetProgramme = () => {
  const defaultTimeline = [{
    id: crypto.randomUUID(),
    title: 'Intro Jingle',
    type: 'jingle',
    duration: 20,
  }, {
    id: crypto.randomUUID(),
    title: 'Anmoderation',
    type: 'moderation',
    duration: 120,
    moderation: 'Du hörst Blaton mit B wie...'
  }, {
    id: crypto.randomUUID(),
    title: 'Song',
    type: 'song',
    duration: 180,
  }, {
    id: crypto.randomUUID(),
    title: 'Anmoderation Mal Ehrlich',
    type: 'moderation',
    duration: 60,
    moderation: ''
  }, {
    id: crypto.randomUUID(),
    title: 'Mal Ehrlich',
    type: 'feature',
    duration: 1380,
  }, {
    id: crypto.randomUUID(),
    title: 'Song',
    type: 'song',
    duration: 180,
  }, {
    id: crypto.randomUUID(),
    title: 'Abmoderation Sendung',
    type: 'moderation',
    duration: 60,
    moderation: ''
  }];
  axios.post(apiUrl + '/programme/entries', defaultTimeline).then((response) => {
    toast.success('Programm erfolgreich ausgedünnt!');
    timeline.value = defaultTimeline;
  }).catch((error) => {
    console.log(error);
    toast.error('Probleme beim löschen');
  })
}

const confirmDefault = () => {
  if (confirm('Willst du alle Einträge löschen?')) {
    defaultProgramme();
  }
};

const defaultProgramme = () => {
  axios.delete(apiUrl + '/programme/entries').then((response) => {
    toast.success('Programm erfolgreich geleert!');
    timeline.value = [];
  }).catch((error) => {
    console.log(error);
    toast.error('Probleme beim löschen');
  })
}

const downloadProgramme = async () => {
  const response = await fetch(apiUrl + '/programme/download')
  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = programmTitle.value + '.xml'
  a.click()
  window.URL.revokeObjectURL(url)
}

const downloadExcel = async () => {
  const response = await fetch(apiUrl + '/programme/excel')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = programmTitle.value + '.xlsx'
  link.click()
  URL.revokeObjectURL(url)
}

const downloadWord = async () => {
  const response = await fetch(apiUrl + '/programme/word')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = 'programme.docx'
  a.click()
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