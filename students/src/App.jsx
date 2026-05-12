import React, { useState } from 'react'

export default function App() {
  const [students, setStudents] = useState([
    { id: 1, name: 'Sarah Jenkins', grade: '8-B' },
    { id: 2, name: 'Marcus Thompson', grade: '10-A' },
  ])

  const addStudent = () => {
    const id = Date.now()
    setStudents([...students, { id, name: `New Student ${students.length + 1}`, grade: '1-A' }])
  }

  return (
    <div className="app-root">
      <header className="header">
        <h1>Students Panel</h1>
        <button className="btn" onClick={addStudent}>Add Student</button>
      </header>
      <main>
        <section className="list">
          {students.map(s => (
            <div key={s.id} className="card">
              <div className="name">{s.name}</div>
              <div className="meta">{s.grade}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
