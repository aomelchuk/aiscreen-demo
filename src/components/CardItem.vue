<script setup lang="ts">
import type { CanvasTemplate } from '../types/canvas'


const props = defineProps<{ card: CanvasTemplate }>()
const emit = defineEmits<{
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
  (e: 'filter', tag: string): void
}>()

const onEdit = () => emit('edit', props.card.id)
const onDelete = () => emit('delete', props.card.id)
const filterByTag = (tag: string) => emit('filter', tag)
</script>

<template>
  <div
      class="hover:grayscale-50 border border-gray-300 rounded p-4 shadow-sm flex flex-col"
  >
    <img :src="card.preview_image as string || '/placeholder.webp'" :class="{'opacity-50': !card.preview_image}" alt="">
    <h2 class="text-lg font-semibold mb-2 mt-2">{{ card.name }}</h2>
    <p class="flex flex-grow gap-1">
      <span
          v-for="tag in card.tags"
          :key="tag"
          class="h-fit cursor-pointer inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset"
          @click="filterByTag(tag)"
      >{{ tag }}</span>
    </p>

    <div class="mt-4 flex justify-end space-x-2">
      <button
          @click="onEdit"
          class="bg-yellow-400 hover:bg-yellow-500 hover:cursor-pointer text-white px-3 py-1 rounded"
      >
        Edit
      </button>
      <button
          @click="onDelete"
          class="bg-red-500 hover:bg-red-600 hover:cursor-pointer  text-white px-3 py-1 rounded"
      >
        Delete
      </button>
    </div>

  </div>

</template>

<style scoped>

</style>
