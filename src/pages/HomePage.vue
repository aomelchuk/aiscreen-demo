<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot, Listbox, ListboxButton, ListboxLabel, ListboxOptions, ListboxOption } from '@headlessui/vue'

import { useCanvasStore } from '../stores/canvas'
import { defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const CardItem = defineAsyncComponent(() => import('../components/CardItem.vue'))
import AddCardForm from "../components/AddCardForm.vue";
import EmptyState from "../components/EmptyState.vue";

const store = useCanvasStore()

const search = ref('')

// Tag filter state
const tagFilter = ref('')
// Compute unique tag list
const allTags = computed(() => {
  const tags = store.templates.flatMap(t => t.tags || [])
  return Array.from(new Set(tags))
})

const filteredCards = computed(() =>
  store.templates.filter(c =>
    c.name.toLowerCase().includes(search.value.toLowerCase())
    && (tagFilter.value === '' || (c.tags && c.tags.includes(tagFilter.value)))
  )
)

function filterByTag(tag: string) {
  tagFilter.value = tag
}

// Add Dialog state and form
const openAddDialog = ref(false)



onMounted(() => {
   store.fetchTemplates()
})

function editCard(id: number) {
  router.push({ path: `/template/${id}` })
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
      <div class="flex justify-between">
        <input
            v-model="search"
            type="text"
            placeholder="Search..."
            class="border border-gray-300 rounded px-3 py-2 w-full max-w-xs"
        />
        <Listbox v-model="tagFilter">
          <div class="relative ml-4 min-w-[8rem]">
            <ListboxButton class="grid w-full cursor-default grid-cols-2 rounded-md bg-white py-4 pr-2 pl-3 text-left text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm">
            <span class="block truncate">
              {{ tagFilter || 'All tags' }}
            </span>
              <img src="/chevron-down.svg"  width="16" height="16" class="self-center justify-self-end" alt="">
            </ListboxButton>
            <ListboxOptions class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-hidden sm:text-sm">
              <ListboxOption as="li" :value="''" class="cursor-pointer hover:bg-gray-300  select-none py-2 pl-3 pr-9">
                <span class="block truncate">All tags</span>
              </ListboxOption>
              <ListboxOption
                  as="li"
                  v-for="tag in allTags"
                  :key="tag"
                  :value="tag"
                  class="relative cursor-pointer hover:bg-gray-300 select-none py-2 pl-3 pr-9"
                  v-slot="{ selected }"
              >
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ tag }}
              </span>
              </ListboxOption>
            </ListboxOptions>
          </div>
        </Listbox>
      </div>

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

    <div v-if="store.loading" class="flex justify-center items-center px-3 py-2 bg-white">
      <div class="text-center py-10" role="status">
        <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
          <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
    <div v-else-if="store.error" class="text-red-500">{{ store.error }}</div>
    <EmptyState v-else-if="!filteredCards?.length" class="flex justify-between items-center"/>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <CardItem
          v-for="card in filteredCards"
          :key="card.id"
          :card="card"
          @edit="editCard"
          @delete="deleteCard"
          @filter="filterByTag"
      />
    </div>

  </div>
</template>
