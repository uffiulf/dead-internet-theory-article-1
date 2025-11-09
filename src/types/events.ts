// Custom Event Types for inter-component communication

export interface AnimProgressEventDetail {
  progress: number
}

export interface ProjectionChangeEventDetail {
  progress?: number
  value?: number
}

export interface EliasCueEventDetail {
  at: number
  mode: string
  text?: string
}

export type GraphCascadeEventDetail = Record<string, never>

export interface ScrollTriggerSelf {
  progress: number
  [key: string]: unknown
}

// D3 types for force simulation
export interface D3Node {
  id: string | number
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  [key: string]: unknown
}

export interface D3Link {
  source: D3Node | string | number
  target: D3Node | string | number
  [key: string]: unknown
}

