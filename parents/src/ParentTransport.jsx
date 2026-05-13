import React from 'react';

export default function ParentTransport({ childId }){
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Transport</h1>
      <div className="bg-white rounded-xl shadow-sm p-4">
        <p className="text-zinc-600">Live bus GPS, route map and driver contact will appear here.</p>
      </div>
    </div>
  )
}
