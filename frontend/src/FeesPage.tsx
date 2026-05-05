import { 
  FileText, 
  Banknote, 
  ClipboardList, 
  Award,
  Filter,
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function FeesPage() {
  const transactions = [
    {
      initials: 'JD',
      name: 'Jonathan Doe',
      grade: 'Grade 10-A',
      refId: '#INV-2024-001',
      invoiceDate: 'Oct 12, 2023',
      dueDate: 'Oct 30, 2023',
      amount: '$1,250.00',
      status: 'Paid',
      color: 'blue'
    },
    {
      initials: 'SM',
      name: 'Sarah Miller',
      grade: 'Grade 8-C',
      refId: '#INV-2024-045',
      invoiceDate: 'Nov 05, 2023',
      dueDate: 'Nov 20, 2023',
      amount: '$850.00',
      status: 'Pending',
      color: 'orange'
    },
    {
      initials: 'RK',
      name: 'Robert King',
      grade: 'Grade 12-B',
      refId: '#INV-2023-982',
      invoiceDate: 'Sep 15, 2023',
      dueDate: 'Sep 30, 2023',
      amount: '$1,400.00',
      status: 'Overdue',
      color: 'red'
    },
    {
      initials: 'AW',
      name: 'Alice Wong',
      grade: 'Grade 9-A',
      refId: '#INV-2024-088',
      invoiceDate: 'Nov 10, 2023',
      dueDate: 'Nov 25, 2023',
      amount: '$1,100.00',
      status: 'Paid',
      color: 'teal'
    }
  ];

  return (
    <div className="flex flex-col gap-8 text-zinc-900 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 mb-2">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-[#3b3dbf]">Fee Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Fee Management</h1>
          <p className="text-zinc-500 font-medium">Oversee school finances, student dues, and scholarship disbursements.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-[#3b3dbf] rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors shadow-sm">
          <FileText size={18} />
          Generate Report
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Collection */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-zinc-500 mb-1">Total Collection</p>
              <p className="text-4xl font-bold text-zinc-900">$1,284,500</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center">
              <Banknote size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            +12% from last month
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-zinc-500 mb-1">Pending Dues</p>
              <p className="text-4xl font-bold text-zinc-900">$42,350</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <ClipboardList size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-red-500">
            <span className="font-extrabold">!</span> Requires attention
          </div>
        </div>

        {/* Scholarships */}
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-bold text-zinc-500 mb-1">Scholarships</p>
              <p className="text-4xl font-bold text-zinc-900">$15,200</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award size={24} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-zinc-400">
            Across 48 students
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        
        {/* Table Header */}
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/50">
           <h3 className="font-bold text-xl">Recent Fee Transactions</h3>
           <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm text-zinc-700">
               <Filter size={16} />
               Filter
             </button>
             <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm text-zinc-700">
               <Download size={16} />
               Export CSV
             </button>
           </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-white text-zinc-500 font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Ref ID</th>
                <th className="px-6 py-4">Invoice Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold">
              {transactions.map((tx, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-${tx.color}-50 text-${tx.color}-600`}>
                        {tx.initials}
                      </div>
                      <div>
                        <div className="text-zinc-900 font-bold">{tx.name}</div>
                        <div className="text-xs text-zinc-400 font-medium">{tx.grade}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">{tx.refId}</td>
                  <td className="px-6 py-4 text-zinc-500">{tx.invoiceDate}</td>
                  <td className="px-6 py-4 text-zinc-500">{tx.dueDate}</td>
                  <td className="px-6 py-4 text-zinc-900 font-bold">{tx.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                      tx.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
                      tx.status === 'Pending' ? 'bg-indigo-50 text-indigo-600' :
                      'bg-red-50 text-red-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        tx.status === 'Paid' ? 'bg-emerald-500' :
                        tx.status === 'Pending' ? 'bg-indigo-500' :
                        'bg-red-500'
                      }`}></span>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-lg transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:px-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <div className="text-sm font-semibold text-zinc-500">
            Showing 1 to 4 of 124 records
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 border border-zinc-200 bg-white rounded-lg text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 transition-colors shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-transparent bg-[#3b3dbf] text-white rounded-lg text-sm font-bold shadow-sm">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 rounded-lg text-sm font-bold transition-colors shadow-sm">
              3
            </button>
            <button className="p-2 border border-zinc-200 bg-white rounded-lg text-zinc-500 hover:bg-zinc-50 transition-colors shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
