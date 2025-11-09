import { useEffect, useState } from 'react'
import type { EliasCueEventDetail } from '../../types/events'
import EliasOverlay from './EliasOverlay'
import EliasPortal from './EliasPortal'

type Cue = { mode: 'appear' | 'whisper' | 'hide' | 'takeover'; at: number; text: string }

export default function EliasController() {
  const [cues, setCues] = useState<Cue[]>([])
  const [overlayText, setOverlayText] = useState('')
  const [overlayVisible, setOverlayVisible] = useState(false)
  const [portalOpen, setPortalOpen] = useState(false)
  const [chapterProgress, setChapterProgress] = useState(0)

  useEffect(() => {
    const onCue = (e: Event) => {
      const customEvent = e as CustomEvent<EliasCueEventDetail>
      const d = customEvent.detail as Cue
      setCues((prev) => [...prev, d].sort((a, b) => a.at - b.at))
    }
    window.addEventListener('elias:cue', onCue as EventListener)
    return () => window.removeEventListener('elias:cue', onCue as EventListener)
  }, [])

  // Compute chapter progress using headings as anchors
  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('main h2')) as HTMLElement[]
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.3
      let idx = 1
      for (let i = 0; i < headings.length; i++) {
        const h = headings[i]
        const next = headings[i + 1]
        const top = h.offsetTop
        const end = next ? next.offsetTop : document.body.scrollHeight
        if (y >= top && y < end) {
          const local = Math.min(1, Math.max(0, (y - top) / Math.max(1, end - top)))
          idx = i + 1 + local
          break
        }
      }
      setChapterProgress(idx)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Orchestrate overlay/portal based on cues and progress
  useEffect(() => {
    const next = cues.find((c) => !c.mode.startsWith('hide') && chapterProgress >= c.at - 0.01)
    if (next) {
      if (next.mode === 'takeover') {
        console.info('[ELIAS] takeover at', next.at)
        setPortalOpen(true)
        setOverlayVisible(false)
        duckAudio(true)
        window.dispatchEvent(new CustomEvent('elias:takeover'))
      } else if (next.mode === 'appear' || next.mode === 'whisper') {
        setOverlayText(next.text)
        setOverlayVisible(chapterProgress >= 1.2 && chapterProgress < 7.9)
      }
    }
    const hideCue = cues.find((c) => c.mode === 'hide' && chapterProgress >= c.at - 0.01)
    if (hideCue) setOverlayVisible(false)

    if (chapterProgress >= 9.0 && portalOpen) {
      setPortalOpen(false)
      duckAudio(false)
    }
  }, [cues, chapterProgress, portalOpen])

  const onCloseOverlay = () => setOverlayVisible(false)
  const onClosePortal = () => {
    setPortalOpen(false)
    duckAudio(false)
  }

  return (
    <>
      <EliasOverlay text={overlayText} visible={overlayVisible} onClose={onCloseOverlay} />
      <EliasPortal open={portalOpen} onClose={onClosePortal} />
    </>
  )
}

function duckAudio(duck: boolean) {
  const audios = Array.from(document.querySelectorAll('audio')) as HTMLAudioElement[]
  audios.forEach((a) => {
    try {
      a.volume = duck ? Math.max(0, Math.min(1, a.volume * 0.25)) : Math.min(1, a.volume / 0.25)
    } catch (error) {
      console.warn('[EliasController] Failed to adjust audio volume:', error)
    }
  })
}


