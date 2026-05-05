import { useParams } from 'react-router-dom';
import { 
  Mail, 
  TrendingUp,
  Award,
  Sigma,
  FlaskConical,
  BookText,
  Plus,
  ChevronDown
} from 'lucide-react';

export default function StudentProfilePage() {
  const { id } = useParams();

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">
      
      {/* Top Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-200 p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
          <div className="relative shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=3&w=256&h=256&q=80" 
              alt="Benjamin Carter" 
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-md"
            />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#3b3dbf] text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap border-2 border-white">
              Grade 11-B
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left mt-2 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#3b3dbf] leading-tight">Benjamin<br />Carter</h1>
              </div>
              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#2c2eb5] transition-colors shrink-0">
                <Mail size={16} />
                Message Parent
              </button>
            </div>
            
            <p className="text-zinc-500 font-medium text-sm mt-4 leading-relaxed max-w-xl">
              Consistently demonstrating strong analytical skills in STEM subjects. Shows active participation in extra-curricular debate and robotics club.
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-6">
              <span className="px-4 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                <Award size={14} /> Honors Student
              </span>
              <span className="px-4 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-orange-500"></div> Athletics
              </span>
            </div>
          </div>
        </div>

        {/* Academic Standing Card */}
        <div className="bg-[#595cdb] rounded-2xl shadow-lg p-6 relative overflow-hidden flex flex-col justify-between text-white">
          <div className="absolute -right-8 -bottom-8 opacity-10">
            <Award size={180} strokeWidth={1} />
          </div>
          
          <div className="relative z-10">
            <p className="text-sm font-semibold text-indigo-100 mb-1">Academic Standing</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold">3.85</span>
              <span className="text-indigo-200 font-semibold">GPA</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <TrendingUp size={14} />
              +0.2 from last term
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8 relative z-10">
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-xs font-semibold text-indigo-100 mb-1">Attendance</p>
              <p className="text-xl font-bold">98.2%</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <p className="text-xs font-semibold text-indigo-100 mb-1">Rank</p>
              <p className="text-xl font-bold">#4 / 120</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GPA Trend Analysis */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-bold text-xl text-zinc-900">GPA Trend Analysis</h3>
              <p className="text-xs font-semibold text-zinc-500 mt-1">Progression over the last 6 months</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 transition-colors">
              Current Year
              <ChevronDown size={14} />
            </button>
          </div>
          
          {/* Custom SVG Line Chart */}
          <div className="flex-1 relative min-h-[200px] mt-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pt-4 pb-8">
              <div className="border-t border-zinc-200 w-full"></div>
              <div className="border-t border-zinc-200 w-full"></div>
              <div className="border-t border-zinc-200 w-full"></div>
            </div>
            
            <svg viewBox="0 0 600 150" className="w-full h-full absolute inset-0 pt-4 pb-8 overflow-visible" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b3dbf" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3b3dbf" stopOpacity="1" />
                </linearGradient>
              </defs>
              <polyline 
                points="50,110 150,105 250,90 350,95 450,50 550,20" 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              {/* Data points */}
              <circle cx="50" cy="110" r="4" fill="#fff" stroke="#3b3dbf" strokeWidth="2" />
              <circle cx="150" cy="105" r="4" fill="#fff" stroke="#3b3dbf" strokeWidth="2" />
              <circle cx="250" cy="90" r="4" fill="#fff" stroke="#3b3dbf" strokeWidth="2" />
              <circle cx="350" cy="95" r="4" fill="#fff" stroke="#3b3dbf" strokeWidth="2" />
              <circle cx="450" cy="50" r="4" fill="#fff" stroke="#3b3dbf" strokeWidth="2" />
              <circle cx="550" cy="20" r="6" fill="#3b3dbf" />
            </svg>
            
            {/* Value Tooltip for last point */}
            <div className="absolute right-[calc(8.33%-14px)] top-3 bg-zinc-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
              3.85
            </div>

            {/* X-Axis Labels */}
            <div className="absolute bottom-0 inset-x-0 flex justify-between px-8 text-xs font-semibold text-zinc-400">
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Dec</span>
              <span>Jan</span>
              <span>Feb</span>
            </div>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <h3 className="font-bold text-lg text-zinc-900">Recent Tasks</h3>
            <button className="text-[#3b3dbf] text-xs font-bold hover:underline">View All</button>
          </div>
          
          <div className="flex flex-col gap-6 flex-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center shrink-0 border border-indigo-100">
                <Sigma size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-900">Calculus Quiz</h4>
                <p className="text-xs text-zinc-500 font-medium">Feb 12, 2024</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-[#3b3dbf]">98/100</div>
                <div className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-[#3b3dbf] text-[10px] font-bold rounded">A+</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <FlaskConical size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-900">Chemistry Lab</h4>
                <p className="text-xs text-zinc-500 font-medium">Feb 10, 2024</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-teal-600">85/100</div>
                <div className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded">B+</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                <BookText size={24} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-zinc-900">Modern History Essay</h4>
                <p className="text-xs text-zinc-500 font-medium">Feb 05, 2024</p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-orange-600">92/100</div>
                <div className="inline-block mt-1 px-2 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-bold rounded">A-</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-xl font-bold text-zinc-900">
            <BookText className="text-[#3b3dbf]" size={24} />
            Teacher Observations & Private Notes
          </div>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-sm font-bold transition-colors">
            <Plus size={16} />
            New Note
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#3b3dbf]">Academic Progress</span>
                <span className="text-xs font-medium text-zinc-500">Feb 14, 2024</span>
              </div>
              <p className="text-sm font-medium text-zinc-700 italic leading-relaxed mb-6">
                "Benjamin has shown exceptional growth in his mathematical reasoning. He assisted peers during the group project today, demonstrating leadership and deep conceptual understanding."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Prof. Marcus Chen" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs font-medium text-zinc-500">Added by Prof. Marcus Chen</span>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-teal-600">Behavioral</span>
                <span className="text-xs font-medium text-zinc-500">Jan 28, 2024</span>
              </div>
              <p className="text-sm font-medium text-zinc-700 italic leading-relaxed mb-6">
                "Quiet during the morning session but extremely engaged in the afternoon robotics workshop. Seems to thrive in hands-on, practical environments."
              </p>
            </div>
            <div className="flex items-center gap-3">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Dr. Sarah Wilson" className="w-6 h-6 rounded-full object-cover" />
              <span className="text-xs font-medium text-zinc-500">Added by Dr. Sarah Wilson</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
