import { Suspense, lazy, useState } from 'react'
import { readStored, writeStored } from './storage'
import './App.css'

const ExamMap = lazy(() => import('./views/ExamMap'))
const HierarchyBuilder = lazy(() => import('./views/HierarchyBuilder'))
const ResponsibilitySort = lazy(() => import('./views/ResponsibilitySort'))

const views = [
  { id: 'map', name: 'Exam map', component: ExamMap },
  { id: 'hierarchy', name: 'Resource hierarchy', component: HierarchyBuilder },
  { id: 'responsibility', name: 'Who is responsible', component: ResponsibilitySort },
] as const

type ViewId = (typeof views)[number]['id']

function App() {
  const [viewId, setViewId] = useState<ViewId>(() => {
    const saved = readStored<string>('az900.view', 'map')
    return views.some((v) => v.id === saved) ? (saved as ViewId) : 'map'
  })
  const View = views.find((v) => v.id === viewId)!.component

  function open(id: ViewId) {
    setViewId(id)
    writeStored('az900.view', id)
  }

  return (
    <div className="app">
      <header className="topbar">
        <h1>AZ-900 study map</h1>
        <nav aria-label="Study tools">
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              className="nav-tab"
              aria-current={v.id === viewId ? 'page' : undefined}
              onClick={() => open(v.id)}
            >
              {v.name}
            </button>
          ))}
        </nav>
      </header>
      <main className="view">
        <Suspense fallback={<p className="view-loading">Loading…</p>}>
          <View />
        </Suspense>
      </main>
    </div>
  )
}

export default App
