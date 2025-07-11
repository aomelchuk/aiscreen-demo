// src/stores/templates.ts
import { defineStore } from 'pinia'
import { apiFetch } from '../utils/api'
import type { CanvasTemplate } from '../types/canvas'


export const useCanvasStore = defineStore('templates', {
    state: () => ({
        templates: [] as CanvasTemplate[],
        loading: false as boolean,
        error: '' as string,
        createError: '' as string,
        createLoading: false as boolean,
    }),
    actions: {
        async fetchTemplates() {
            this.loading = true
            this.error = ''
            try {
                const res = await apiFetch('https://dev-api.aiscreen.io/api/v1/canvas_templates')
                if (!res.ok) throw new Error(`Error ${res.status}`)

                this.templates = await res.json()
            } catch (e: any) {
                this.error = e.message || 'Unknown error'
            } finally {
                this.loading = false
            }
        },
        async createCanvasTemplate(template: CanvasTemplate) {
            this.loading = true
            this.error = ''
            try {
                const form = new FormData()
                form.append('name', template.name)
                form.append('objects', '')

                if (template.description) form.append('description', template.description)
                if (template.width) form.append('width', template.width)
                if (template.height) form.append('height', template.height)
                if (template.preview_image) form.append('preview_image', template.preview_image)
                if (template.tags?.length) {
                    template.tags.forEach(tag => form.append('tags[]', tag))
                }
                if (template.type) form.append('type', template.type)

                const token = localStorage.getItem('auth_token')
                const response = await fetch('https://dev-api.aiscreen.io/api/v1/canvas_templates', {
                    method: 'POST',
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    body: form,
                })
                if (!response.ok) throw new Error(`Error ${response.status}`)
                const data = await response.json()
                this.templates.unshift(data)
                return data
            } catch (e: any) {
                this.createError = e.message || 'Unknown error'
                throw e
            } finally {
                this.createLoading = false
            }
        }
    },
})
