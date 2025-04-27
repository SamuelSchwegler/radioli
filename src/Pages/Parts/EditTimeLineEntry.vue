<script setup>

import SelectInput from "../../components/SelectInput.vue";
import Btn from "../../components/Btn.vue";
import TextInput from "../../components/TextInput.vue";
import TimeInput from "../../components/TimeInput.vue";
import {ref} from "vue";

const editEntry = defineModel();
const props = defineProps({
  types: {
    type: Array,
    required: true
  }
});
const emit = defineEmits(['remove', 'override' ]);
const showConfirmModal = ref(false);

function confirmRemove() {
  showConfirmModal.value = true
}

function cancelRemove() {
  showConfirmModal.value = false
}

function reallyRemove() {
  emit('remove')
  showConfirmModal.value = false
}

function overrideEntry() {
  emit('override');
}
</script>

<template>
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
  <Btn @click="overrideEntry">
    Eintrag Anpassen
  </Btn>
  <Btn
      @click="confirmRemove"
      class="bg-red-600 hover:bg-red-700"
  >
    Eintrag Löschen
  </Btn>
  <!-- Modal -->
  <div v-if="showConfirmModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded shadow-md text-center">
      <h2 class="text-lg font-bold mb-4">Eintrag löschen?</h2>
      <p class="text-gray-600 mb-6">Möchten Sie diesen Eintrag wirklich löschen?</p>
      <div class="flex justify-center gap-4">
        <button @click="reallyRemove" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Ja, löschen
        </button>
        <button @click="cancelRemove" class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
          Abbrechen
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>