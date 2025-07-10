<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCanvasStore } from '../stores/canvas'

const store = useCanvasStore()

const search = ref('')

const filteredCards = computed(() =>
    store.templates.filter(c =>
        c.title.toLowerCase().includes(search.value.toLowerCase())
    )
)

onMounted(() => {
  store.fetchTemplates()
})

function addCard() {
  const id = Date.now()
  store.templates.push({
    id,
    title: `New Card ${id}`,
    description: 'New card description',
  })
}

function editCard(id: number) {
  const card = store.templates.find(c => c.id === id)
  if (card) card.title += ' (edited)'
}

function deleteCard(id: number) {
  store.templates = store.templates.filter(c => c.id !== id)
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
          @click="addCard"
          class="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add Card
      </button>
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
