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
        async getCanvasTemplateById(id: number): Promise<CanvasTemplate> {
            this.loading = true;
            this.error = '';
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch(`https://dev-api.aiscreen.io/api/v1/canvas_templates/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (!response.ok) throw new Error(`Error ${response.status}`);
                const data: CanvasTemplate = await response.json();
                return data;
            } catch (e: any) {
                this.error = e.message || 'Unknown error';
                throw e;
            } finally {
                this.loading = false;
            }
        },
        async updateCanvasTemplateById(id: number, payload: CanvasTemplate): Promise<CanvasTemplate> {
          this.loading = true
          this.error = ''
          const form = new FormData()
          form.append('id', id.toString())
          form.append('name', payload.name)
          form.append('objects', '')

          if (payload.description) form.append('description', payload.description)
          if (payload.width) form.append('width', payload.width)
          if (payload.height) form.append('height', payload.height)
          if (payload.preview_image) form.append('preview_image', payload.preview_image)
          const tags = Array.isArray(payload.tags) ? payload.tags : []
            tags.forEach(tag => form.append('tags[]', tag))
          if (payload.type) form.append('type', payload.type)

          try {
            const token = localStorage.getItem('auth_token')
            const response = await fetch(
              `https://dev-api.aiscreen.io/api/v1/canvas_templates/${id}?_method=PATCH`,
              {
                method: 'POST',
                headers: {
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: form,
              }
            )
            if (!response.ok) throw new Error(`Error ${response.status}`)
            const data: CanvasTemplate = await response.json()
            // update local list
            const index = this.templates.findIndex(t => t.id === id)
            if (index !== -1) {
              this.templates[index] = data
            }
            return data
          } catch (e: any) {
            this.error = e.message || 'Unknown error'
            throw e
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
        },
        async deleteCanvasTemplate(id: number) {
            this.loading = true
            this.error = ''
            try {
                const token = localStorage.getItem('auth_token')
                const response = await fetch('https://dev-api.aiscreen.io/api/v1/canvas_templates', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({ id }),
                })
                if (!response.ok) throw new Error(`Error ${response.status}`)
                this.templates = this.templates.filter(template => template.id !== id)
            } catch (e: any) {
                this.error = e.message || 'Unknown error'
                throw e
            } finally {
                this.loading = false
            }
        },


    },
})
