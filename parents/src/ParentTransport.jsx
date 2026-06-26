import React from 'react';
import { Bus, MapPin, Phone, Clock, Shield } from 'lucide-react';

export default function ParentTransport({ childId }){
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Transport</h2>
        <p className="text-sm text-gray-400 mt-0.5">Bus tracking and route info</p>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2">
            <Bus size={16} />
          </div>
          <div className="text-sm font-bold text-teal-600">On Route</div>
          <div className="text-xs text-gray-400 mt-0.5">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-2">
            <Clock size={16} />
          </div>
          <div className="text-sm font-bold text-gray-900">12 min</div>
          <div className="text-xs text-gray-400 mt-0.5">ETA</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
          <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-500 flex items-center justify-center mx-auto mb-2">
            <MapPin size={16} />
          </div>
          <div className="text-sm font-bold text-gray-900">Route #5</div>
          <div className="text-xs text-gray-400 mt-0.5">Assigned</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Map placeholder */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Live Tracking</h3>
            <span className="flex items-center gap-1.5 text-xs text-teal-600 font-medium">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse"></span> Live
            </span>
          </div>
          <div className="flex items-center justify-center p-12 bg-gray-50/50 min-h-[250px]">
            <div className="text-center">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-500">GPS Tracking</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">Live location will appear here once configured.</p>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Driver info */}
          <div className="bg-teal-600 rounded-xl p-5 text-white">
            <h3 className="text-sm font-semibold text-teal-50 mb-3">Driver</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Shield size={14} className="text-teal-200 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Mr. Ramesh Kumar</div>
                  <div className="text-xs text-teal-200">Verified</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-teal-200 shrink-0" />
                <div className="text-sm font-medium">+91 98765 43210</div>
              </div>
              <div className="flex items-center gap-3">
                <Bus size={14} className="text-teal-200 shrink-0" />
                <div className="text-sm font-medium">KA-01-AB-1234</div>
              </div>
            </div>
          </div>

          {/* Route stops */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Route Stops</h3>
            <div className="space-y-2">
              {['School Gate', 'Main Road Junction', 'Park Avenue', 'Your Stop'].map((stop, i) => (
                <div key={stop} className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === 3 ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-600'}`}>
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${i === 3 ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-400'}`}>{i + 1}</span>
                  {stop}
                  {i === 3 && <span className="text-[10px] font-bold text-teal-600 uppercase ml-auto">You</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
