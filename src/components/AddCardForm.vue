<script setup lang="ts">
import { useCanvasStore } from '../stores/canvas'
import type { CanvasTemplate } from '../types/canvas'
import { ref, reactive, watch, computed, onMounted, Teleport, Transition } from 'vue'
import * as events from "node:events";
import { useRouter } from 'vue-router'
const router = useRouter()

const store = useCanvasStore()

const props = defineProps<{
  id?: number
}>()

const formImageFile = ref<File | null>(null)
const previewUrl = ref<string>('')

const emit = defineEmits<{
  (e: 'add', canvas: CanvasTemplate): void
  (e: 'cancel'): void
}>()

// Form state for new template
const form = reactive({
  name: '',
  tags: '',         // comma-separated
  width: '',
  height: '',
  preview: '',
  description: '',
})
const formError = ref('')

const isEdit = computed(() => props.id !== undefined)

onMounted(async () => {
  if (isEdit.value && props.id !== undefined) {
    try {
      const data = await store.getCanvasTemplateById(props.id)
      form.name = data.name
      if (data.tags) form.tags = data.tags.join(', ')
      if (data.width) form.width = data.width
      if (data.height)  form.height = data.height
      if (data.preview_image ) {
        form.preview = data.preview_image as string || ''
        previewUrl.value = data.preview_image as string
      }
    } catch (e) {
      formError.value = 'Failed to load template'
    }
  }
})

watch(formImageFile, (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      previewUrl.value = reader.result as string
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = ''
  }
})

const createError = computed(() => {
  return store.createError
})

watch(createError, (value) => {
  if (value) {
    setTimeout(() => {
      store.createError = null
    }, 5000)
  }
})

function resetForm() {
  form.name = ''
  form.tags = ''
  form.width = ''
  form.height = ''
  form.preview = ''
  formError.value = ''

  formImageFile.value = null
  previewUrl.value = ''

  store.createError = null
}

function formToCanvas(form: any): CanvasTemplate {
  console.log('formImageFile', formImageFile)
  return {
    id: props.id ?? Date.now(),
    name: form.name.trim(),
    width: form.width.trim(),
    height: form.height.trim(),
    tags: form.tags
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t !== ''),
    type: 'own',
    preview_image: formImageFile.value || '',
    ...(isEdit.value ? { description: form.description.trim() } : {}),
  }
}

function validateRequired() {
  if (!form.name.trim() || !form.tags.trim() || !form.width.trim() || !form.height.trim()) {
    formError.value = 'Name, tags, width, and height are required.'
    return false
  }
  formError.value = ''
  return true
}

async function addCard() {
   if (!validateRequired()) return
  // form.name, form.tags, form.width, form.height, form.preview

  try {
    await store.createCanvasTemplate(formToCanvas(form))
  } catch (e) {
    store.createError = e.message
     console.log(e)
  }

  if (!store.createError) emit('add', form)
}

async function saveCard() {
  if (!validateRequired()) return
  const canvas = formToCanvas(form)
  try {
    await store.updateCanvasTemplateById(props.id!, canvas)
    resetForm()
    router.push({ path: '/' })
  } catch {
    formError.value = 'Failed to save'
  }
}

function cancelCard() {
  resetForm()
  emit('cancel')
}

function backToHomepage() {
  router.push({ path: '/' })
  resetForm()
  emit('cancel')
}

function uplodImage(e: events):void {
  console.log('uplodImage', e)
  if (e?.target) {
    const file = e.target.files?.[0] || null;
    if (file && file.type.startsWith('image/')) {
      formImageFile.value = file;
      console.log('formImageFile', formImageFile.value)
      form.preview = '';
    } else {
      formError.value = 'Please select a valid image file.'
    }
  }
}
</script>

<template>
  <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
    <h2 class="text-lg font-medium mb-4">Add Card</h2>
    <div class="grid grid-cols-1 gap-y-4 sm:grid-cols-6 gap-x-6">
      <!-- Name (required) -->
      <div class="sm:col-span-6">
        <label for="name" class="block text-sm font-medium text-gray-900">Name <span class="text-red-600 ">*</span></label>
        <div class="mt-1 flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
              v-model="form.name"
              type="text"
              id="name"
              class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              placeholder="Template Name"
          />
        </div>
      </div>
      <!-- Tags -->
      <div class="sm:col-span-6">
        <label for="tags" class="block text-sm font-medium text-gray-900">Tags</label>
        <div class="mt-1 flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
              v-model="form.tags"
              type="text"
              id="tags"
              class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              placeholder="tag1, tag2"
          />
        </div>
      </div>
      <!-- Width -->
      <div class="sm:col-span-3">
        <label for="width" class="block text-sm font-medium text-gray-900">Width</label>
        <div class="mt-1 flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
              v-model="form.width"
              type="text"
              id="width"
              class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              placeholder="1920"
          />
        </div>
      </div>
      <!-- Height -->
      <div class="sm:col-span-3">
        <label for="height" class="block text-sm font-medium text-gray-900">Height</label>
        <div class="mt-1 flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <input
              v-model="form.height"
              type="text"
              id="height"
              class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
              placeholder="1080"
          />
        </div>
      </div>
      <!-- Description (shown only in edit mode) -->
      <div v-if="isEdit" class="sm:col-span-6">
        <label for="description" class="block text-sm font-medium text-gray-900">Description</label>
        <div class="mt-1 flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
          <textarea
            v-model="form.description"
            id="description"
            rows="3"
            class="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm"
            placeholder="Enter description"
          ></textarea>
        </div>
      </div>
      <!-- Preview Image URL -->
      <div class="sm:col-span-6">
        <label for="cover-photo" class="block text-sm/6 font-medium text-gray-900">Cover photo</label>
        <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 relative overflow-hidden">
          <div class="text-center">
            <img
              v-if="previewUrl"
              :src="previewUrl"
              class="mx-auto opacity-25 absolute -top-50 left-0"
              alt="Cover preview"
            />
            <img
              v-else
              src="/photoIcon.svg"
              class="mx-auto opacity-25"
              width="48"
              height="48"
              alt="Cover photo"
            />
            <div class="mt-4 flex text-sm/6 text-gray-600">
              <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 focus-within:outline-hidden hover:text-indigo-500">
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="uplodImage"
                />
              </label>
              <p class="pl-1">or drag and drop</p>
            </div>
            <p class="text-xs/5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
    </div>
    <p v-if="formError" class="mt-1 text-sm text-red-600">{{ formError }}</p>
  </div>

  <div v-if="!isEdit" class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
    <button type="button" class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 sm:ml-3 sm:w-auto" @click="addCard">Add</button>
    <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="cancelCard" ref="cancelButtonRef">Cancel</button>
  </div>
  <div v-else class="px-4 py-6 sm:flex sm:flex-row-reverse sm:px-6 border-t border-gray-300">
    <button type="button" class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 sm:ml-3 sm:w-auto" @click="saveCard">Save</button>
    <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto" @click="backToHomepage" ref="cancelButtonRef">Back</button>
  </div>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="store.createError" id="toast-danger" class="absolute top-5 right-5 z-1001 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow-sm dark:text-gray-400 dark:bg-gray-800" role="alert">
        <div class="inline-flex items-center justify-center shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
          <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
          </svg>
          <span class="sr-only">Error icon</span>
        </div>
        <div class="ms-3 text-sm font-normal">{{ store.createError }}</div>
        <button @click="store.createError = null" type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-danger" aria-label="Close">
          <span class="sr-only">Close</span>
          <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
          </svg>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>

</style>
