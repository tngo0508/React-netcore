import {
  Background,
  Controls,
  Handle,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import type { Connection, Edge, Node, NodeProps } from '@xyflow/react'
import { useCallback, useMemo, useState } from 'react'

type Kind = 'root' | 'mg' | 'sub' | 'rg' | 'res'

type ScopeData = {
  kind: Kind
  name: string
  inherited?: boolean
  assigned?: boolean
}

type ScopeNode = Node<ScopeData, 'scope'>

const kindLabel: Record<Kind, string> = {
  root: 'Root management group',
  mg: 'Management group',
  sub: 'Subscription',
  rg: 'Resource group',
  res: 'Resource',
}

type Item = { id: string; kind: Kind; name: string; parent: string | null; answer: { x: number; y: number } }

const items: Item[] = [
  { id: 'root', kind: 'root', name: 'Tenant root group', parent: null, answer: { x: 420, y: 0 } },
  { id: 'corp', kind: 'mg', name: 'Corp', parent: 'root', answer: { x: 420, y: 130 } },
  { id: 'prod', kind: 'sub', name: 'Production', parent: 'corp', answer: { x: 190, y: 260 } },
  { id: 'dev', kind: 'sub', name: 'Development', parent: 'corp', answer: { x: 650, y: 260 } },
  { id: 'rg-web', kind: 'rg', name: 'rg-web-prod', parent: 'prod', answer: { x: 190, y: 390 } },
  { id: 'rg-test', kind: 'rg', name: 'rg-test-dev', parent: 'dev', answer: { x: 650, y: 390 } },
  { id: 'vm', kind: 'res', name: 'vm-web-prod-01', parent: 'rg-web', answer: { x: 60, y: 520 } },
  { id: 'st', kind: 'res', name: 'stwebprodlogs', parent: 'rg-web', answer: { x: 320, y: 520 } },
  { id: 'app', kind: 'res', name: 'app-test-dev', parent: 'rg-test', answer: { x: 650, y: 520 } },
]

const parentOf = Object.fromEntries(items.map((i) => [i.id, i.parent]))

// A fixed scramble so the puzzle starts the same way each time.
const scrambled: Record<string, { x: number; y: number }> = {
  st: { x: 0, y: 0 },
  dev: { x: 300, y: 20 },
  vm: { x: 620, y: 0 },
  root: { x: 60, y: 190 },
  app: { x: 380, y: 210 },
  'rg-web': { x: 680, y: 180 },
  corp: { x: 0, y: 380 },
  'rg-test': { x: 300, y: 400 },
  prod: { x: 640, y: 380 },
}

function makeNodes(layout: 'scrambled' | 'answer'): ScopeNode[] {
  return items.map((i) => ({
    id: i.id,
    type: 'scope',
    position: layout === 'answer' ? i.answer : scrambled[i.id],
    data: { kind: i.kind, name: i.name },
  }))
}

function ScopeCard({ data }: NodeProps<ScopeNode>) {
  const classes = ['scope-node', `kind-${data.kind}`]
  if (data.assigned) classes.push('assigned')
  else if (data.inherited) classes.push('inherited')
  return (
    <div className={classes.join(' ')}>
      {data.kind !== 'root' && <Handle type="target" position={Position.Top} />}
      <span className="scope-kind">{kindLabel[data.kind]}</span>
      <span className="scope-name">{data.name}</span>
      {data.assigned && <span className="scope-flag">Policy assigned here</span>}
      {data.inherited && !data.assigned && <span className="scope-flag">Inherits the policy</span>}
      {data.kind !== 'res' && <Handle type="source" position={Position.Bottom} />}
    </div>
  )
}

const nodeTypes = { scope: ScopeCard }

type Result = { correct: number; wrong: number; missing: number }

export default function HierarchyBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ScopeNode>(makeNodes('scrambled'))
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [result, setResult] = useState<Result | null>(null)
  const [assignedAt, setAssignedAt] = useState<string | null>(null)

  const solved = result !== null && result.wrong === 0 && result.missing === 0

  const onConnect = useCallback(
    (c: Connection) => {
      setResult(null)
      setAssignedAt(null)
      // Each scope has exactly one parent, so a new connection replaces the old one.
      setEdges((eds) =>
        addEdge(
          { ...c, id: `${c.source}->${c.target}` },
          eds.filter((e) => e.target !== c.target),
        ).map((e) => ({ ...e, className: '' })),
      )
    },
    [setEdges],
  )

  function check() {
    let correct = 0
    let wrong = 0
    const marked = edges.map((e) => {
      const ok = parentOf[e.target] === e.source
      if (ok) correct++
      else wrong++
      return { ...e, className: ok ? 'edge-ok' : 'edge-bad', animated: !ok }
    })
    const needed = items.filter((i) => i.parent).length
    setEdges(marked)
    setResult({ correct, wrong, missing: needed - correct - wrong })
  }

  function showAnswer() {
    setNodes(makeNodes('answer'))
    setEdges(
      items
        .filter((i) => i.parent)
        .map((i) => ({ id: `${i.parent}->${i.id}`, source: i.parent!, target: i.id, className: 'edge-ok' })),
    )
    setResult({ correct: items.length - 1, wrong: 0, missing: 0 })
  }

  function reset() {
    setNodes(makeNodes('scrambled'))
    setEdges([])
    setResult(null)
    setAssignedAt(null)
  }

  const descendants = useMemo(() => {
    if (!assignedAt) return new Set<string>()
    const out = new Set<string>()
    const walk = (id: string) => {
      for (const i of items) {
        if (i.parent === id) {
          out.add(i.id)
          walk(i.id)
        }
      }
    }
    walk(assignedAt)
    return out
  }, [assignedAt])

  const shownNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, assigned: n.id === assignedAt, inherited: descendants.has(n.id) },
      })),
    [nodes, assignedAt, descendants],
  )

  const shownEdges = useMemo(
    () =>
      assignedAt
        ? edges.map((e) => ({
            ...e,
            className: descendants.has(e.target) ? 'edge-flow' : 'edge-ok',
            animated: descendants.has(e.target),
          }))
        : edges,
    [edges, assignedAt, descendants],
  )

  return (
    <div className="flow-layout">
      <aside className="flow-panel">
        <h2>Build the resource hierarchy</h2>
        <p>
          Drag from the dot under a scope to the dot on top of the scope that belongs inside it.
          Each scope can only have one parent.
        </p>
        <div className="button-row">
          <button type="button" className="primary" onClick={check} disabled={edges.length === 0}>
            Check my tree
          </button>
          <button type="button" className="quiet" onClick={showAnswer}>
            Show answer
          </button>
          <button type="button" className="quiet" onClick={reset}>
            Start over
          </button>
        </div>

        <div aria-live="polite">
          {result && !solved && (
            <p className="quiz-wrong">
              {result.correct} right, {result.wrong} wrong, {result.missing} still missing. Red
              links point to the wrong parent.
            </p>
          )}
          {solved && (
            <>
              <p className="quiz-right">The tree is correct.</p>
              <p>
                Now select any scope to assign an Azure Policy there, such as "Allowed locations".
                Everything beneath it inherits the policy.
              </p>
            </>
          )}
        </div>

        <details className="facts">
          <summary>What to remember</summary>
          <ul>
            <li>Management groups hold subscriptions and other management groups, up to six levels deep (not counting the root).</li>
            <li>Subscriptions are boundaries for billing and access.</li>
            <li>A resource lives in exactly one resource group, and resource groups cannot be nested.</li>
            <li>Policies and role assignments made at a scope are inherited by every scope below it.</li>
          </ul>
        </details>
      </aside>

      <div className="flow-canvas">
        <ReactFlow
          nodes={shownNodes}
          edges={shownEdges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, n) => solved && setAssignedAt((cur) => (cur === n.id ? null : n.id))}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          proOptions={{ hideAttribution: false }}
        >
          <Background gap={24} color="#C9D0DA" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  )
}
