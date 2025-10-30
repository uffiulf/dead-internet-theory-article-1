import { useEffect } from 'react'

export default function EliasCue({ mode, at, text }: { mode: 'appear' | 'whisper' | 'hide' | 'takeover'; at: string | number; text?: string }) {
  useEffect(() => {
    const detail = { mode, at: parseFloat(String(at)), text: text ?? '' }
    window.dispatchEvent(new CustomEvent('elias:cue', { detail }))
  }, [mode, at, text])
  return null
}


