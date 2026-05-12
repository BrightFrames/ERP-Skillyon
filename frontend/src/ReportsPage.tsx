import React, { useState } from 'react'
import { Download } from 'lucide-react'

const sampleData = {
  admissions: [
    { id: 'A-1001', name: 'Sarah Jenkins', date: '2026-01-12', grade: '8-B' },
    { id: 'A-1002', name: 'Marcus Thompson', date: '2026-02-03', grade: '10-A' },
  ],
  attendance: [
    { id: 'STU-9821', name: 'Sarah Jenkins', present: 22, total: 22 },
    { id: 'STU-9744', name: 'Marcus Thompson', present: 20, total: 22 },
  ],
  fees: [
    { id: 'F-2001', student: 'Sarah Jenkins', amount: 1200, status: 'Paid' },
    { id: 'F-2002', student: 'Chloe Williams', amount: 1200, status: 'Pending' },
  ]
}

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [report, setReport] = useState('admissions')
  const [start, setStart] = useState('2026-01-01')
  const [end, setEnd] = useState('2026-06-30')
  const [rows, setRows] = useState<any[]>([])

  const generate = () => {
    // Use the sample data as mock results (filtering could be added)
    setRows(sampleData[report as keyof typeof sampleData] || [])
  }

  const handleExport = () => {
    if (!rows.length) return
    if (report === 'admissions') {
      const header = ['ID', 'Name', 'Date', 'Grade']
      const data = rows.map((r: any) => [r.id, r.name, r.date, r.grade])
      downloadCSV('admissions.csv', [header, ...data])
    } else if (report === 'attendance') {
      const header = ['ID', 'Name', 'Present', 'Total']
      const data = rows.map((r: any) => [r.id, r.name, r.present, r.total])
      downloadCSV('attendance.csv', [header, ...data])
    } else if (report === 'fees') {
      const header = ['ID', 'Student', 'Amount', 'Status']
      const data = rows.map((r: any) => [r.id, r.student, r.amount, r.status])
      downloadCSV('fees.csv', [header, ...data])
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-zinc-500">Generate and export administrative reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-[#3b3dbf] text-white rounded-lg text-sm font-semibold">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500">Report</label>
            <select value={report} onChange={e => setReport(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm">
              <option value="admissions">Admissions</option>
              <option value="attendance">Attendance</option>
              <option value="fees">Fees & Payments</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500">Start date</label>
            <input type="date" value={start} onChange={e => setStart(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-500">End date</label>
            <input type="date" value={end} onChange={e => setEnd(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <div className="flex items-end">
            <button onClick={generate} className="w-full py-2.5 bg-[#3b3dbf] text-white rounded-lg font-semibold">Generate</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6">
        {rows.length === 0 ? (
          <div className="text-zinc-500">No results. Choose parameters and click Generate.</div>
        ) : (
          <div className="w-full overflow-x-auto">
            {report === 'admissions' && (
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="text-zinc-500 font-semibold border-b border-zinc-100">
                  <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Grade</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((r:any) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50"><td className="px-4 py-3">{r.id}</td><td className="px-4 py-3">{r.name}</td><td className="px-4 py-3">{r.date}</td><td className="px-4 py-3">{r.grade}</td></tr>
                  ))}
                </tbody>
              </table>
            )}

            {report === 'attendance' && (
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="text-zinc-500 font-semibold border-b border-zinc-100">
                  <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Present</th><th className="px-4 py-3">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((r:any) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50"><td className="px-4 py-3">{r.id}</td><td className="px-4 py-3">{r.name}</td><td className="px-4 py-3">{r.present}</td><td className="px-4 py-3">{r.total}</td></tr>
                  ))}
                </tbody>
              </table>
            )}

            {report === 'fees' && (
              <table className="w-full text-left text-sm text-zinc-600">
                <thead className="text-zinc-500 font-semibold border-b border-zinc-100">
                  <tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((r:any) => (
                    <tr key={r.id} className="hover:bg-zinc-50/50"><td className="px-4 py-3">{r.id}</td><td className="px-4 py-3">{r.student}</td><td className="px-4 py-3">${r.amount}</td><td className="px-4 py-3">{r.status}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
