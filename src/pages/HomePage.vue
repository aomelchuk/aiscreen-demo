<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { useCanvasStore } from '../stores/canvas'
import CardItem from "../components/CardItem.vue";
import AddCardForm from "../components/AddCardForm.vue";

const store = useCanvasStore()

const search = ref('')

const filteredCards = computed(() =>
    store.templates.filter(c =>
        c.name.toLowerCase().includes(search.value.toLowerCase())
    )
)

// Add Dialog state and form
const openAddDialog = ref(false)



onMounted(() => {
  store.fetchTemplates()
})

function editCard(id: number) {
  const card = store.templates.find(c => c.id === id)
  if (card) card.name += ' (edited)'
}

function deleteCard(id: number) {
  store.templates = store.templates.filter(c => c.id !== id)
  store.deleteCanvasTemplate(id)

}

function addCard() {
  openAddDialog.value = false
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Cards</h1>

    <div class="mb-4 flex justify-between items-center">
      <input
          v-model="search"
          type="text"
          placeholder="Search..."
          class="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
      />
      <button
          @click="openAddDialog = true"
          class="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Card
      </button>

      <TransitionRoot as="template" :show="openAddDialog">
        <Dialog class="relative z-10" @close="openAddDialog = false">
          <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
            <div class="fixed inset-0 bg-gray-500/75 transition-opacity" />
          </TransitionChild>

          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
                <DialogPanel class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <AddCardForm @cancel="openAddDialog = false" @add="addCard"/>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </TransitionRoot>

    </div>

    <div v-if="store.loading" class="text-center py-10">Loading…</div>
    <div v-else-if="store.error" class="text-red-500">{{ store.error }}</div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <CardItem
          v-for="card in filteredCards"
          :key="card.id"
          :card="card"
          @edit="editCard"
          @delete="deleteCard"
      />
    </div>

  </div>
</template>
