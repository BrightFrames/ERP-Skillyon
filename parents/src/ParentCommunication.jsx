import React from 'react';

export default function ParentCommunication({ childId }){
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Communication</h1>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-zinc-600">Direct messaging, PTM scheduling and complaint system will be available here.</p>
      </div>
    </div>
  )
}
