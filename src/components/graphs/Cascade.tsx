import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'

export default function Cascade() {
  const ref = useRef<SVGSVGElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const svg = d3.select(ref.current)
    const width = 640, height = 320
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    const nodes = d3.range(16).map((i) => ({ id: i }))
    const links = d3.range(24).map(() => ({ source: Math.floor(Math.random() * 16), target: Math.floor(Math.random() * 16) }))

    const sim = d3.forceSimulation(nodes as any).force('charge', d3.forceManyBody().strength(-40)).force('center', d3.forceCenter(width / 2, height / 2)).force('link', d3.forceLink(links as any).id((d: any) => d.id).distance(60))

    const g = svg.append('g')
    const link = g.selectAll('line').data(links).enter().append('line').attr('stroke', '#9ca3af')
    const node = g.selectAll('circle').data(nodes).enter().append('circle').attr('r', 6).attr('fill', '#2563eb')

    sim.on('tick', () => {
      link.attr('x1', (d: any) => (d.source as any).x).attr('y1', (d: any) => (d.source as any).y).attr('x2', (d: any) => (d.target as any).x).attr('y2', (d: any) => (d.target as any).y)
      node.attr('cx', (d: any) => (d as any).x).attr('cy', (d: any) => (d as any).y)
    })

    const onCascade = () => {
      if (active) return
      console.info('[GRAPH] cascade triggered')
      setActive(true)
      node.transition().duration(500).attr('fill', '#ef4444').transition().duration(1500).attr('fill', '#2563eb').on('end', () => setActive(false))
    }

    const host = svg.node()?.parentElement
    host?.addEventListener('graph:cascade', onCascade as any)
    return () => {
      host?.removeEventListener('graph:cascade', onCascade as any)
      sim.stop()
    }
  }, [active])

  return <svg ref={ref} className="my-4 w-full" role="img" aria-label="Cascade graph" />
}


