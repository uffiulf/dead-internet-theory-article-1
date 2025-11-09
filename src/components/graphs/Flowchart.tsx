import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Flowchart() {
  const ref = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = d3.select(ref.current)
    const width = 640
    const height = 240
    svg.attr('viewBox', `0 0 ${width} ${height}`)
    
    // Fade in on scroll
    const container = svg.node()?.parentElement
    if (container) {
      gsap.fromTo(
        container,
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        },
      )
    }

    const nodes = [
      { x: 40, y: 120, label: 'Bot creates' },
      { x: 220, y: 120, label: 'Alg amplifies' },
      { x: 420, y: 120, label: 'Users react' },
      { x: 600, y: 120, label: 'Clicks/Spam' },
    ]

    const g = svg.append('g')
    nodes.forEach((n) => {
      g.append('rect').attr('x', n.x - 60).attr('y', n.y - 20).attr('rx', 6).attr('width', 120).attr('height', 40).attr('fill', '#e5e7eb')
      g.append('text').attr('x', n.x).attr('y', n.y + 4).attr('text-anchor', 'middle').text(n.label).attr('font-size', 12)
    })

    const path = d3.path()
    path.moveTo(100, 120)
    path.lineTo(160, 120)
    path.moveTo(280, 120)
    path.lineTo(360, 120)
    path.moveTo(480, 120)
    path.lineTo(540, 120)
    g.append('path').attr('d', path.toString()).attr('stroke', '#111827').attr('stroke-width', 2).attr('fill', 'none').attr('stroke-dasharray', 8).attr('stroke-dashoffset', 64)

    const onEnter = () => {
      console.info('[GRAPH] flowchart enter: animate dashoffset')
      g.select('path').transition().duration(1200).ease(d3.easeLinear).attr('stroke-dashoffset', 0)
    }

    const host = svg.node()?.parentElement
    host?.addEventListener('graph:enter', onEnter as EventListener)
    return () => host?.removeEventListener('graph:enter', onEnter as EventListener)
  }, [])

  return <svg ref={ref} className="my-4 w-full" role="img" aria-label="Flowchart engagement-farming" />
}


