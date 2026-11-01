import { Background, Controls, ReactFlow, useNodesState } from '@xyflow/react'
import type { Node, NodeProps } from '@xyflow/react'
import { useMemo, useState } from 'react'

type Owner = 'customer' | 'shared' | 'microsoft'
type Model = 'onprem' | 'iaas' | 'paas' | 'saas'

const models: { id: Model; name: string }[] = [
  { id: 'onprem', name: 'On-premises' },
  { id: 'iaas', name: 'IaaS' },
  { id: 'paas', name: 'PaaS' },
  { id: 'saas', name: 'SaaS' },
]

// From Microsoft's shared responsibility model for on-premises, IaaS, PaaS, and SaaS.
const duties: { id: string; name: string; owner: Record<Model, Owner> }[] = [
  { id: 'data', name: 'Information and data', owner: { onprem: 'customer', iaas: 'customer', paas: 'customer', saas: 'customer' } },
  { id: 'devices', name: 'Devices (mobile and PCs)', owner: { onprem: 'customer', iaas: 'customer', paas: 'customer', saas: 'customer' } },
  { id: 'accounts', name: 'Accounts and identities', owner: { onprem: 'customer', iaas: 'customer', paas: 'customer', saas: 'customer' } },
  { id: 'directory', name: 'Identity and directory infrastructure', owner: { onprem: 'customer', iaas: 'customer', paas: 'shared', saas: 'shared' } },
  { id: 'apps', name: 'Applications', owner: { onprem: 'customer', iaas: 'customer', paas: 'shared', saas: 'microsoft' } },
  { id: 'netctl', name: 'Network controls', owner: { onprem: 'customer', iaas: 'customer', paas: 'shared', saas: 'microsoft' } },
  { id: 'os', name: 'Operating system', owner: { onprem: 'customer', iaas: 'customer', paas: 'microsoft', saas: 'microsoft' } },
  { id: 'hosts', name: 'Physical hosts', owner: { onprem: 'customer', iaas: 'microsoft', paas: 'microsoft', saas: 'microsoft' } },
  { id: 'network', name: 'Physical network', owner: { onprem: 'customer', iaas: 'microsoft', paas: 'microsoft', saas: 'microsoft' } },
  { id: 'dc', name: 'Physical datacenter', owner: { onprem: 'customer', iaas: 'microsoft', paas: 'microsoft', saas: 'microsoft' } },
]

const LANE_W = 310
const LANE_GAP = 24
const LANE_H = 620
const CARD_W = 290
const CARD_H = 44
const TRAY_X = -LANE_W - 60

const lanes: { id: Owner | 'tray'; name: string; x: number }[] = [
  { id: 'tray', name: 'To sort', x: TRAY_X },
  { id: 'customer', name: 'You', x: 0 },
  { id: 'shared', name: 'Shared', x: LANE_W + LANE_GAP },
  { id: 'microsoft', name: 'Microsoft', x: 2 * (LANE_W + LANE_GAP) },
]

type LaneData = { name: string; tray: boolean }
type CardData = { name: string; verdict?: 'ok' | 'bad' }
type LaneNode = Node<LaneData, 'lane'>
type CardNode = Node<CardData, 'card'>
type AnyNode = LaneNode | CardNode

function Lane({ data }: NodeProps<LaneNode>) {
  return (
    <div className={data.tray ? 'lane tray' : 'lane'} style={{ width: LANE_W, height: LANE_H }}>
      <span className="lane-name">{data.name}</span>
    </div>
  )
}

function Card({ data }: NodeProps<CardNode>) {
  const cls = ['duty-card', data.verdict ? `verdict-${data.verdict}` : ''].join(' ')
  return (
    <div className={cls} style={{ width: CARD_W }}>
      {data.name}
      {data.verdict === 'bad' && <span className="sr-only"> (wrong column)</span>}
    </div>
  )
}

const nodeTypes = { lane: Lane, card: Card }

function laneNodes(): LaneNode[] {
  return lanes.map((l) => ({
    id: `lane-${l.id}`,
    type: 'lane',
    position: { x: l.x, y: 0 },
    data: { name: l.name, tray: l.id === 'tray' },
    draggable: false,
    selectable: false,
    focusable: false,
    zIndex: -1,
  }))
}

function cardSlot(laneX: number, index: number) {
  return { x: laneX + (LANE_W - CARD_W) / 2, y: 52 + index * (CARD_H + 10) }
}

function initialCards(): CardNode[] {
  // Shuffle once per mount so the order isn't a giveaway.
  const order = [...duties].sort(() => Math.random() - 0.5)
  return order.map((d, i) => ({
    id: d.id,
    type: 'card',
    position: cardSlot(TRAY_X, i),
    data: { name: d.name },
  }))
}

function laneAt(x: number): Owner | 'tray' | null {
  const center = x + CARD_W / 2
  for (const l of lanes) {
    if (center >= l.x && center <= l.x + LANE_W) return l.id
  }
  return null
}

export default function ResponsibilitySort() {
  const [model, setModel] = useState<Model>('iaas')
  const [nodes, setNodes, onNodesChange] = useNodesState<AnyNode>([...laneNodes(), ...initialCards()])
  const [summary, setSummary] = useState<{ right: number; unsorted: number } | null>(null)

  const cards = useMemo(() => nodes.filter((n): n is CardNode => n.type === 'card'), [nodes])

  function clearVerdicts() {
    setSummary(null)
    setNodes((ns) => ns.map((n) => (n.type === 'card' ? { ...n, data: { ...n.data, verdict: undefined } } : n)))
  }

  function check() {
    let right = 0
    let unsorted = 0
    const verdicts = new Map<string, 'ok' | 'bad'>()
    for (const c of cards) {
      const lane = laneAt(c.position.x)
      const duty = duties.find((d) => d.id === c.id)!
      if (lane === 'tray' || lane === null) {
        unsorted++
        continue
      }
      const ok = duty.owner[model] === lane
      if (ok) right++
      verdicts.set(c.id, ok ? 'ok' : 'bad')
    }
    setNodes((ns) =>
      ns.map((n) => (n.type === 'card' ? { ...n, data: { ...n.data, verdict: verdicts.get(n.id) } } : n)),
    )
    setSummary({ right, unsorted })
  }

  function showAnswer() {
    const counts: Record<Owner, number> = { customer: 0, shared: 0, microsoft: 0 }
    const placed = new Map<string, { x: number; y: number }>()
    for (const d of duties) {
      const owner = d.owner[model]
      const lane = lanes.find((l) => l.id === owner)!
      placed.set(d.id, cardSlot(lane.x, counts[owner]++))
    }
    setNodes((ns) =>
      ns.map((n) =>
        n.type === 'card' ? { ...n, position: placed.get(n.id)!, data: { ...n.data, verdict: 'ok' } } : n,
      ),
    )
    setSummary({ right: duties.length, unsorted: 0 })
  }

  function reset() {
    setNodes([...laneNodes(), ...initialCards()])
    setSummary(null)
  }

  const modelName = models.find((m) => m.id === model)!.name

  return (
    <div className="flow-layout">
      <aside className="flow-panel">
        <h2>Who is responsible?</h2>
        <p>
          Pick a service model, then drag each duty into the column for whoever handles it: you, Microsoft,
          or both.
        </p>

        <div className="segmented" role="radiogroup" aria-label="Service model">
          {models.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={model === m.id}
              onClick={() => {
                setModel(m.id)
                clearVerdicts()
              }}
            >
              {m.name}
            </button>
          ))}
        </div>

        <div className="button-row">
          <button type="button" className="primary" onClick={check}>
            Check {modelName}
          </button>
          <button type="button" className="quiet" onClick={showAnswer}>
            Show answer
          </button>
          <button type="button" className="quiet" onClick={reset}>
            Start over
          </button>
        </div>

        <div aria-live="polite">
          {summary && (
            <p className={summary.right === duties.length ? 'quiz-right' : 'quiz-wrong'}>
              {summary.right === duties.length
                ? `All ${duties.length} duties are in the right column for ${modelName}.`
                : `${summary.right} of ${duties.length} right${summary.unsorted ? `, ${summary.unsorted} not sorted yet` : ''}. Red cards are in the wrong column.`}
            </p>
          )}
        </div>

        <details className="facts">
          <summary>What to remember</summary>
          <ul>
            <li>You always own your data, devices, and accounts, whatever the service model.</li>
            <li>Microsoft always owns the physical hosts, network, and datacenter in the cloud.</li>
            <li>Moving from IaaS to PaaS to SaaS hands more of the middle layers to Microsoft.</li>
          </ul>
        </details>
      </aside>

      <div className="flow-canvas">
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStart={() => summary && clearVerdicts()}
          nodesConnectable={false}
          fitView
          fitViewOptions={{ padding: 0.08 }}
          minZoom={0.3}
        >
          <Background gap={24} color="#C9D0DA" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  )
}
