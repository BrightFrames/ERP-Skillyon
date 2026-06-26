import React, { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ message, onClose = () => {} }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onClose(), 3000)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return (
    <div className="fixed top-4 right-4 z-[100]">
      <div className="flex items-center gap-2.5 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100">
        <CheckCircle2 size={16} className="text-teal-500 shrink-0" />
        <span className="text-sm font-medium text-gray-800">{message}</span>
        <button onClick={onClose} className="ml-1 p-0.5 text-gray-400 hover:text-gray-600">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
