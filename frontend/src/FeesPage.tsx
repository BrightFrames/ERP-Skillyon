import { useState, useEffect } from 'react';
import {
  FileText, Banknote, ClipboardList, Award,
  Filter, Download, MoreVertical, ChevronLeft, ChevronRight,
  Plus, X, Search, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import api from './lib/api';

const FMT_CURRENCY = (v: number) =>
  '$' + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2 });

export default function FeesPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [form, setForm] = useState({
    student_name: '', class_name: '', amount: '', fee_type: 'Tuition', status: 'Pending', due_date: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
    api.get('/students?page=0&limit=100').then(r => setStudents(r.data.data || []));
    const close = () => setActiveMenu(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => { fetchData(); }, [statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);
      const res = await api.get(`/fees?${params}`);
      setTransactions(res.data.data || []);
      setStats(res.data.stats || {});
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/fees/${id}/status`, { status });
      setTransactions(prev => prev.map(t => t.id === id ? { ...t, status } : t));
      setActiveMenu(null);
      fetchData();
    } catch { alert('Failed to update status'); }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/fees', { ...form, amount: parseFloat(form.amount) });
      setShowModal(false);
      setForm({ student_name: '', class_name: '', amount: '', fee_type: 'Tuition', status: 'Pending', due_date: '' });
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Failed to create invoice');
    } finally { setSaving(false); }
  };

  const getStatusStyle = (s: string) => {
    if (s === 'Paid') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s === 'Pending') return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100';
    return 'bg-red-50 text-red-500 border-red-100';
  };

  const getStatusIcon = (s: string) => {
    if (s === 'Paid') return <CheckCircle size={12} />;
    if (s === 'Pending') return <Clock size={12} />;
    return <AlertCircle size={12} />;
  };

  const getInitials = (name: string) =>
    name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || '?';

  const avatarColors = [
    'bg-indigo-100 text-[#3b3dbf]', 'bg-orange-100 text-orange-600',
    'bg-red-100 text-red-600', 'bg-teal-100 text-teal-600',
    'bg-violet-100 text-violet-700', 'bg-pink-100 text-pink-600',
  ];

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#3b3dbf]">Fee Management</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Oversee school finances, student dues, and payment tracking.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm shrink-0"
        >
          <Plus size={16} />
          New Invoice
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Collected</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : FMT_CURRENCY(stats.collected || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center">
              <Banknote size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
            <CheckCircle size={12} /> {stats.paid_count || 0} paid invoices
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Pending Dues</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : FMT_CURRENCY(stats.pending || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center">
              <ClipboardList size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-zinc-400">
            <Clock size={12} /> {stats.pending_count || 0} awaiting payment
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Overdue</p>
              <p className="text-3xl font-bold text-zinc-900">{loading ? '...' : FMT_CURRENCY(stats.overdue || 0)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
              <Award size={24} strokeWidth={2} />
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-red-400">
            <AlertCircle size={12} /> {stats.overdue_count || 0} require attention
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        <div className="p-4 px-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-zinc-50/30">
          <h3 className="font-bold text-base text-zinc-900">Fee Transactions</h3>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student..."
                className="pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg bg-white focus:outline-none focus:border-[#3b3dbf] transition-colors w-44 font-medium"
              />
            </div>
            {['', 'Paid', 'Pending', 'Overdue'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  statusFilter === s
                    ? 'bg-[#3b3dbf] text-white border-[#3b3dbf]'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-500 hover:bg-zinc-50 transition-colors">
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50/50 border-b border-zinc-100">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Student</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Class</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Invoice Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Due Date</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Fee Type</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Amount</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-zinc-400 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 font-semibold">
              {loading ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-zinc-300 text-sm">Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-zinc-300 text-sm">No transactions found.</td></tr>
              ) : transactions.map((tx, i) => (
                <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {getInitials(tx.student_name)}
                      </div>
                      <span className="font-bold text-zinc-800">{tx.student_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {tx.class_name ? (
                      <span className="px-2 py-1 bg-indigo-50 text-[#3b3dbf] rounded-lg text-[10px] font-bold">{tx.class_name}</span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {tx.invoice_date ? new Date(tx.invoice_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-zinc-400 text-xs">
                    {tx.due_date ? new Date(tx.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{tx.fee_type}</td>
                  <td className="px-6 py-4 text-zinc-900 font-bold">{FMT_CURRENCY(tx.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold ${getStatusStyle(tx.status)}`}>
                      {getStatusIcon(tx.status)}
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="relative inline-block" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === tx.id ? null : tx.id)}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical size={15} />
                      </button>
                      {activeMenu === tx.id && (
                        <div className="absolute right-0 z-20 mt-1 w-44 bg-white border border-zinc-100 rounded-xl shadow-xl py-1">
                          <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 uppercase">Update Status</div>
                          {['Paid', 'Pending', 'Overdue'].filter(s => s !== tx.status).map(s => (
                            <button
                              key={s}
                              onClick={() => updateStatus(tx.id, s)}
                              className="w-full px-4 py-2 text-left text-xs font-bold text-zinc-600 hover:bg-zinc-50 flex items-center gap-2 transition-colors"
                            >
                              {getStatusIcon(s)}
                              Mark as {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50/50">
          <p className="text-xs font-bold text-zinc-400">{transactions.length} transaction{transactions.length !== 1 ? 's' : ''} shown</p>
        </div>
      </div>

      {/* New Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">New Invoice</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Create a new fee record</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Student Name *</label>
                <input
                  list="student-list"
                  required autoFocus
                  value={form.student_name}
                  onChange={e => setForm({ ...form, student_name: e.target.value })}
                  placeholder="Type student name..."
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
                <datalist id="student-list">
                  {students.map(s => <option key={s.id} value={s.name} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-600 mb-1.5">Class</label>
                <input
                  value={form.class_name}
                  onChange={e => setForm({ ...form, class_name: e.target.value })}
                  placeholder="e.g. Grade 10-A"
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">Amount ($) *</label>
                  <input
                    required type="number" min="1"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="1250"
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">Fee Type</label>
                  <select
                    value={form.fee_type}
                    onChange={e => setForm({ ...form, fee_type: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  >
                    <option>Tuition</option>
                    <option>Transportation</option>
                    <option>Exam</option>
                    <option>Library</option>
                    <option>Sports</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={form.due_date}
                    onChange={e => setForm({ ...form, due_date: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 mb-1.5">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors"
                  >
                    <option>Pending</option>
                    <option>Paid</option>
                    <option>Overdue</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-sm font-bold hover:bg-[#2c2eb5] shadow-sm disabled:opacity-60">
                  {saving ? 'Saving...' : 'Create Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
