import React from 'react';

export default function ParentAcademics({ childId }){
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Academics</h1>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-zinc-600">Exam-wise marks, subject analysis and downloadable report cards will appear here.</p>
      </div>
    </div>
  )
}
