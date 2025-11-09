import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import type { D3Node, D3Link } from '../../types/events'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export default function Cascade() {
  const ref = useRef<SVGSVGElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const svg = d3.select(ref.current)
    const width = 640, height = 320
    svg.attr('viewBox', `0 0 ${width} ${height}`).selectAll('*').remove()
    
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

    const nodes = d3.range(20).map((i) => ({ id: i }))
    
    // Use deterministic structure for consistent graph
    const links: Array<{ source: number; target: number }> = []
    
    // Create a more structured network: start from center and spread outward
    // Central hub connects to initial nodes
    for (let i = 0; i < 4; i++) {
      links.push({ source: 0, target: i + 1 })
    }
    
    // Second layer: connect to outer nodes
    for (let i = 1; i < 5; i++) {
      for (let j = 0; j < 2; j++) {
        const target = 4 + (i - 1) * 2 + j + 1
        if (target < nodes.length) {
          links.push({ source: i, target })
        }
      }
    }
    
    // Add some cross-connections for realism (deterministic)
    const crossLinks = [
      { source: 5, target: 7 },
      { source: 6, target: 8 },
      { source: 9, target: 11 },
      { source: 10, target: 12 },
      { source: 13, target: 15 },
      { source: 14, target: 16 },
      { source: 17, target: 19 },
      { source: 18, target: 0 },
    ]
    
    links.push(...crossLinks.filter(l => l.source < nodes.length && l.target < nodes.length))

    const sim = d3.forceSimulation<D3Node>(nodes)
      .force('charge', d3.forceManyBody().strength(-40))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('link', d3.forceLink<D3Node, D3Link>(links).id((d) => d.id).distance(60))
      .alphaDecay(0.02)

    const g = svg.append('g')
    const link = g.selectAll('line').data(links).enter().append('line').attr('stroke', '#9ca3af').attr('stroke-width', 1.5)
    const node = g.selectAll('circle').data(nodes).enter().append('circle').attr('r', 6).attr('fill', '#2563eb')

    sim.on('tick', () => {
      link
        .attr('x1', (d) => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          return source?.x ?? 0
        })
        .attr('y1', (d) => {
          const source = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source)
          return source?.y ?? 0
        })
        .attr('x2', (d) => {
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          return target?.x ?? 0
        })
        .attr('y2', (d) => {
          const target = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target)
          return target?.y ?? 0
        })
      node.attr('cx', (d) => d.x ?? 0).attr('cy', (d) => d.y ?? 0)
    })

    const onCascade = () => {
      if (active) return
      console.info('[GRAPH] cascade triggered')
      setActive(true)
      // Cascade effect: start from center and spread outward
      const orderedNodes = node.nodes().sort((a, b) => {
        const dxA = (a.x ?? 0) - width / 2
        const dyA = (a.y ?? 0) - height / 2
        const dxB = (b.x ?? 0) - width / 2
        const dyB = (b.y ?? 0) - height / 2
        const distA = Math.sqrt(dxA * dxA + dyA * dyA)
        const distB = Math.sqrt(dxB * dxB + dyB * dyB)
        return distA - distB
      })
      
      orderedNodes.forEach((n, i) => {
        d3.select(n)
          .transition()
          .delay(i * 50)
          .duration(300)
          .attr('fill', '#ef4444')
          .transition()
          .duration(800)
          .attr('fill', '#2563eb')
      })
      
      setTimeout(() => setActive(false), orderedNodes.length * 50 + 1100)
    }

    const host = svg.node()?.parentElement
    host?.addEventListener('graph:cascade', onCascade as EventListener)
    return () => {
      host?.removeEventListener('graph:cascade', onCascade as EventListener)
      sim.stop()
    }
  }, [active])

  return <svg ref={ref} className="my-4 w-full" role="img" aria-label="Cascade graph" />
}


