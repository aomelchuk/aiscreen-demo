
export interface CanvasTemplate {
    id: number
    name: string
    width?: string
    height?: string
    tags?: string[]
    type?: string,
    description?: string,
    preview_image?: File | string,
    created_at?: string
    updated_at?: string
    created_by?: string
    updated_by?: string
}
