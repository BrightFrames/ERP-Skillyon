import React, { useState } from 'react'

export default function App() {
  const [parents, setParents] = useState([
    { id: 1, name: 'Linda Jenkins', student: 'Sarah Jenkins' },
    { id: 2, name: 'Paul Thompson', student: 'Marcus Thompson' },
  ])

  const addParent = () => {
    const id = Date.now()
    setParents([...parents, { id, name: `New Parent ${parents.length + 1}`, student: 'TBD' }])
  }

  return (
    <div className="app-root">
      <header className="header">
        <h1>Parents Panel</h1>
        <button className="btn" onClick={addParent}>Add Parent</button>
      </header>
      <main>
        <section className="list">
          {parents.map(p => (
            <div key={p.id} className="card">
              <div className="name">{p.name}</div>
              <div className="meta">Child: {p.student}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
