<template>
  <Layout current-name="Meta">
    <div class="p-4 max-w-md mx-auto space-y-4">
      <!-- Title Field -->
      <TextInput v-model="title" label="Title"/>

      <!-- Date Field -->
      <DateInput v-model="date" label="Date"/>

      <!-- Contributors List -->
      <div>
        <label class="block mb-2 text-sm font-medium text-gray-700">Contributors</label>

        <div v-for="(contributor, index) in contributors" :key="index" class="flex items-center gap-2 mb-2">
          <TextInput
              v-model="contributors[index]"
              :label="`Contributor ${index + 1}`"
          />
          <button
              @click="removeContributor(index)"
              class="px-2 py-1 text-sm text-black bg-red-500 rounded hover:bg-red-600"
          >
            ✕
          </button>
        </div>

        <button
            @click="addContributor"
            class="px-4 py-2 text-sm text-black bg-blue-500 rounded hover:bg-blue-600"
        >
          + Add Contributor
        </button>
      </div>
      <button
          @click="saveMetadata"
          class="px-4 py-2 text-sm text-black bg-blue-500 rounded hover:bg-blue-600"
      >
        Speichern
      </button>
    </div>
  </Layout>
</template>

<script setup>
import {ref} from 'vue'
import TextInput from './../components/TextInput.vue'
import DateInput from './../components/DateInput.vue'
import Layout from "../Layout.vue";

const title = ref('')
const date = ref('')
const contributors = ref(['']) // Start with one contributor input
const apiUrl = import.meta.env.VITE_API_URL

const addContributor = () => {
  contributors.value.push('')
}

const removeContributor = (index) => {
  contributors.value.splice(index, 1)
}

import axios from 'axios'

const loadMetadata = async () => {
  const response = await axios.get(apiUrl + '/programme')
  title.value = response.data.meta.title
  date.value = response.data.meta.date
  contributors.value = response.data.meta.contributors
}
loadMetadata();

const saveMetadata = async () => {
  await axios.post(apiUrl + '/programme/meta', {
    title: title.value,
    date: date.value,
    contributors: contributors.value
  })
  console.log('Metadata saved to XML!')
}
</script>