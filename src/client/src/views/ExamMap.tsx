import cytoscape from 'cytoscape'
import type { Core, ElementDefinition } from 'cytoscape'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { lines, stations, transfers } from '../data/examMap'
import type { LineId, Station } from '../data/examMap'
import { readStored, writeStored } from '../storage'

const PER_ROW = 9
const STEP_X = 160
const STEP_Y = 150
const LINE_GAP = 70

const lineById = Object.fromEntries(lines.map((l) => [l.id, l])) as Record<
  LineId,
  (typeof lines)[number]
>
const stationById = Object.fromEntries(stations.map((s) => [s.id, s])) as Record<string, Station>

// Lay each line out as a snake: left to right, drop down, right to left, and so on.
function buildElements(): ElementDefinition[] {
  const elements: ElementDefinition[] = []
  let y = 0
  for (const line of lines) {
    const onLine = stations.filter((s) => s.line === line.id)
    onLine.forEach((s, i) => {
      const row = Math.floor(i / PER_ROW)
      const col = i % PER_ROW
      const x = (row % 2 === 0 ? col : PER_ROW - 1 - col) * STEP_X
      elements.push({
        group: 'nodes',
        data: { id: s.id, label: s.name, line: line.id, color: line.color },
        position: { x, y: y + row * STEP_Y },
        classes: i === 0 ? 'terminus' : '',
      })
      if (i > 0) {
        elements.push({
          group: 'edges',
          data: {
            id: `${onLine[i - 1].id}__${s.id}`,
            source: onLine[i - 1].id,
            target: s.id,
            line: line.id,
            color: line.color,
          },
          classes: 'track',
        })
      }
    })
    y += Math.ceil(onLine.length / PER_ROW) * STEP_Y + LINE_GAP
  }
  for (const [a, b] of transfers) {
    elements.push({
      group: 'edges',
      data: { id: `t__${a}__${b}`, source: a, target: b },
      classes: 'transfer',
    })
  }
  return elements
}

const style: cytoscape.StylesheetJson = [
  {
    selector: 'node',
    style: {
      width: 22,
      height: 22,
      'background-color': '#FFFFFF',
      'border-width': 5,
      'border-color': 'data(color)',
      label: 'data(label)',
      'font-family': 'Overpass, system-ui, sans-serif',
      'font-size': 14,
      'font-weight': 600,
      color: '#1B2330',
      'text-valign': 'bottom',
      'text-margin-y': 8,
      'text-wrap': 'wrap',
      'text-max-width': '130px',
      'text-background-color': '#F3F5F8',
      'text-background-opacity': 0.85,
      'text-background-padding': '2px',
      'transition-property': 'background-color, width, height, opacity',
      'transition-duration': 180,
    },
  },
  { selector: 'node.terminus', style: { width: 30, height: 30, 'border-width': 7 } },
  { selector: 'node.learned', style: { 'background-color': 'data(color)' } },
  {
    selector: 'node:selected, node.found',
    style: { width: 34, height: 34, 'border-color': '#1B2330', 'border-width': 6 },
  },
  { selector: 'node.miss', style: { 'border-color': '#C22B3A', 'background-color': '#F7D4D8' } },
  {
    selector: 'edge.track',
    style: {
      width: 9,
      'line-color': 'data(color)',
      'curve-style': 'straight',
      'line-cap': 'round',
    },
  },
  {
    selector: 'edge.transfer',
    style: {
      width: 2.5,
      'line-color': '#8A93A3',
      'line-style': 'dashed',
      'line-dash-pattern': [6, 6],
      'curve-style': 'bezier',
      opacity: 0.18,
      'z-index': 0,
    },
  },
  {
    selector: 'edge.transfer.lit',
    style: { opacity: 1, width: 3.5, 'line-color': '#1B2330', 'z-index': 10 },
  },
  { selector: '.dimmed', style: { opacity: 0.12 } },
]

type Mode = 'explore' | 'quiz'

function pickRandom(exclude?: string): Station {
  const pool = stations.filter((s) => s.id !== exclude)
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function ExamMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const elements = useMemo(() => buildElements(), [])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [learned, setLearned] = useState<Set<string>>(
    () => new Set(readStored<string[]>('az900.learned', [])),
  )
  const [focusLine, setFocusLine] = useState<LineId | null>(null)
  const [mode, setMode] = useState<Mode>('explore')
  const [target, setTarget] = useState<Station>(() => pickRandom())
  const [score, setScore] = useState({ right: 0, tries: 0 })
  const [feedback, setFeedback] = useState<'right' | 'wrong' | null>(null)

  // Refs so the Cytoscape tap handler, bound once, sees current state.
  const modeRef = useRef(mode)
  const targetRef = useRef(target)
  const answeredRef = useRef(false)
  useLayoutEffect(() => {
    modeRef.current = mode
    targetRef.current = target
    answeredRef.current = feedback === 'right'
  }, [mode, target, feedback])

  const handleTap = useCallback((id: string) => {
    const cy = cyRef.current
    if (modeRef.current === 'explore') {
      setSelectedId(id)
      return
    }
    if (answeredRef.current) return
    const node = cy?.getElementById(id)
    setScore((s) => ({ right: s.right + (id === targetRef.current.id ? 1 : 0), tries: s.tries + 1 }))
    if (id === targetRef.current.id) {
      setFeedback('right')
      node?.addClass('found')
      setSelectedId(id)
    } else {
      setFeedback('wrong')
      node?.addClass('miss')
      setTimeout(() => node?.removeClass('miss'), 700)
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style,
      layout: { name: 'preset', padding: 48 },
      minZoom: 0.15,
      maxZoom: 2.5,
      wheelSensitivity: 0.3,
      autoungrabify: true,
      selectionType: 'single',
    })
    cy.on('tap', 'node', (e) => handleTap(e.target.id()))
    cy.on('tap', (e) => {
      if (e.target === cy && modeRef.current === 'explore') setSelectedId(null)
    })
    cyRef.current = cy

    // Cytoscape measures its container once; re-measure and re-fit when it resizes.
    let lastWidth = -1 // the observer fires once on start, which does the first fit
    const observer = new ResizeObserver(([entry]) => {
      cy.resize()
      if (Math.abs(entry.contentRect.width - lastWidth) > 1) {
        lastWidth = entry.contentRect.width
        cy.fit(undefined, 48)
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      cy.destroy()
      cyRef.current = null
    }
  }, [elements, handleTap])

  // Reflect learned stations on the map and save them.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.batch(() => {
      cy.nodes().forEach((n) => {
        n.toggleClass('learned', learned.has(n.id()))
      })
    })
    writeStored('az900.learned', [...learned])
  }, [learned])

  // Dim every line except the focused one.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.batch(() => {
      cy.elements().removeClass('dimmed')
      if (!focusLine) return
      cy.nodes().filter((n) => n.data('line') !== focusLine).addClass('dimmed')
      cy.edges('.track').filter((e) => e.data('line') !== focusLine).addClass('dimmed')
      cy.edges('.transfer').addClass('dimmed')
    })
  }, [focusLine])

  // Keep the selection on the map in sync with the panel.
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return
    cy.nodes().unselect()
    cy.edges('.transfer').removeClass('lit')
    if (selectedId) {
      const node = cy.getElementById(selectedId)
      node.select()
      node.connectedEdges('.transfer').addClass('lit')
    }
  }, [selectedId])

  const selected = selectedId ? stationById[selectedId] : null

  function toggleLearned(id: string) {
    setLearned((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function nextQuestion() {
    cyRef.current?.nodes().removeClass('found miss')
    setFeedback(null)
    setSelectedId(null)
    setTarget((t) => pickRandom(t.id))
  }

  function switchMode(next: Mode) {
    setMode(next)
    setSelectedId(null)
    setFeedback(null)
    cyRef.current?.nodes().removeClass('found miss')
    if (next === 'quiz') {
      setScore({ right: 0, tries: 0 })
      setTarget(pickRandom())
    }
  }

  return (
    <div className="map-layout">
      <div className="map-stage">
        <div ref={containerRef} className="map-canvas" aria-label="AZ-900 exam map" role="img" />
        <div className="map-controls">
          <button type="button" onClick={() => cyRef.current?.fit(undefined, 48)}>
            Fit map
          </button>
        </div>
      </div>

      <aside className="map-panel">
        <div className="segmented" role="tablist" aria-label="Map mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'explore'}
            onClick={() => switchMode('explore')}
          >
            Explore
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'quiz'}
            onClick={() => switchMode('quiz')}
          >
            Find the station
          </button>
        </div>

        <ul className="legend">
          {lines.map((line) => {
            const total = stations.filter((s) => s.line === line.id).length
            const done = stations.filter((s) => s.line === line.id && learned.has(s.id)).length
            const active = focusLine === line.id
            return (
              <li key={line.id}>
                <button
                  type="button"
                  className="legend-line"
                  aria-pressed={active}
                  onClick={() => setFocusLine(active ? null : line.id)}
                  style={{ '--line': line.color } as CSSProperties}
                >
                  <span className="bullet">{line.letter}</span>
                  <span className="legend-text">
                    <span className="legend-name">{line.name}</span>
                    <span className="legend-meta">
                      {line.weight} of the exam, {done} of {total} learned
                    </span>
                  </span>
                </button>
                <div
                  className="progress"
                  style={{ '--line': line.color } as CSSProperties}
                  role="progressbar"
                  aria-label={`${line.name} progress`}
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={done}
                >
                  <span style={{ width: `${(done / total) * 100}%` }} />
                </div>
              </li>
            )
          })}
        </ul>

        {mode === 'explore' && !selected && (
          <p className="hint">
            Select a station to read about it. Dashed lines are transfers between related topics.
            Select a line above to show only that line.
          </p>
        )}

        {mode === 'explore' && selected && (
          <StationCard
            station={selected}
            learned={learned.has(selected.id)}
            onToggleLearned={() => toggleLearned(selected.id)}
            onOpen={setSelectedId}
          />
        )}

        {mode === 'quiz' && (
          <div className="quiz-card" aria-live="polite">
            <p className="quiz-score">
              {score.right} found in {score.tries} {score.tries === 1 ? 'try' : 'tries'}
            </p>
            <p className="quiz-prompt">{target.summary}</p>
            {feedback === null && <p className="hint">Select the station this describes.</p>}
            {feedback === 'wrong' && <p className="quiz-wrong">Not that one. Try another station.</p>}
            {feedback === 'right' && (
              <>
                <p className="quiz-right">That's {target.name}.</p>
                <p className="tip">{target.tip}</p>
                <button type="button" className="primary" onClick={nextQuestion}>
                  Next question
                </button>
              </>
            )}
            {feedback !== 'right' && (
              <button type="button" className="quiet" onClick={nextQuestion}>
                Skip
              </button>
            )}
          </div>
        )}
      </aside>
    </div>
  )
}

function StationCard({
  station,
  learned,
  onToggleLearned,
  onOpen,
}: {
  station: Station
  learned: boolean
  onToggleLearned: () => void
  onOpen: (id: string) => void
}) {
  const line = lineById[station.line]
  const related = transfers
    .filter(([a, b]) => a === station.id || b === station.id)
    .map(([a, b]) => stationById[a === station.id ? b : a])
  return (
    <article className="station-card" style={{ '--line': line.color } as CSSProperties}>
      <p className="station-line">
        <span className="bullet small">{line.letter}</span>
        {line.name}
      </p>
      <h2>{station.name}</h2>
      <p>{station.summary}</p>
      <p className="tip">
        <strong>Exam tip:</strong> {station.tip}
      </p>
      {related.length > 0 && (
        <div className="transfers">
          <p>Transfer to</p>
          <ul>
            {related.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="transfer-link"
                  onClick={() => onOpen(r.id)}
                  style={{ '--line': lineById[r.line].color } as CSSProperties}
                >
                  <span className="bullet small">{lineById[r.line].letter}</span>
                  {r.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <label className="check">
        <input type="checkbox" checked={learned} onChange={onToggleLearned} />
        I know this one
      </label>
    </article>
  )
}
