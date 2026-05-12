import React, { useEffect, useState } from 'react'

export default function SettingsPage() {
  const [schoolName, setSchoolName] = useState('EduCore High School')
  const [adminEmail, setAdminEmail] = useState('admin@educore.local')
  const [termStart, setTermStart] = useState('2026-01-01')
  const [termEnd, setTermEnd] = useState('2026-06-30')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = localStorage.getItem('siteSettings')
    if (s) {
      try {
        const parsed = JSON.parse(s)
        setSchoolName(parsed.schoolName || schoolName)
        setAdminEmail(parsed.adminEmail || adminEmail)
        setTermStart(parsed.termStart || termStart)
        setTermEnd(parsed.termEnd || termEnd)
      } catch (e) {}
    }
  }, [])

  const save = () => {
    const payload = { schoolName, adminEmail, termStart, termEnd }
    localStorage.setItem('siteSettings', JSON.stringify(payload))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-zinc-500">Configure portal and academic settings</p>
        </div>
        <div>
          <button onClick={save} className="px-4 py-2 bg-[#3b3dbf] text-white rounded-lg font-semibold">Save Settings</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-500">School Name</label>
            <input value={schoolName} onChange={e => setSchoolName(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500">Admin Email</label>
            <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500">Term Start</label>
            <input type="date" value={termStart} onChange={e => setTermStart(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-500">Term End</label>
            <input type="date" value={termEnd} onChange={e => setTermEnd(e.target.value)} className="mt-2 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </div>

        {saved && <div className="mt-4 text-sm text-emerald-600 font-semibold">Settings saved</div>}
      </div>
    </div>
  )
}
