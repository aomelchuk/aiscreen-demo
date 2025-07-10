// src/stores/templates.ts
import { defineStore } from 'pinia'
import { apiFetch } from '../utils/api'
import type { CanvasTemplate } from '../types/canvas'


export const useCanvasStore = defineStore('templates', {
    state: () => ({
        templates: [] as CanvasTemplate[],
        loading: false as boolean,
        error: '' as string,
    }),
    actions: {
        async fetchTemplates() {
            this.loading = true
            this.error = ''
            try {
                const res = await apiFetch('https://dev-api.aiscreen.io/api/v1/canvas_templates')
                if (!res.ok) throw new Error(`Error ${res.status}`)
                const data = await res.json()

                this.templates = data
            } catch (e: any) {
                this.error = e.message || 'Unknown error'
            } finally {
                this.loading = false
            }
        },
    },
})
