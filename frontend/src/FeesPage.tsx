import { useState, useEffect } from 'react';
import {
  FileText, Banknote, ClipboardList, Award,
  Filter, Download, MoreVertical, Plus, X, Search,
  CheckCircle, AlertCircle, Clock, Percent, ShieldCheck, Printer
} from 'lucide-react';
import api from './lib/api';

const FMT_CURRENCY = (v: number) =>
  '₹' + Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 });

export default function FeesPage() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'assignments' | 'settings'>('overview');

  // Core data states
  const [stats, setStats] = useState<any>({ collected: 0, pending: 0, overdue: 0, fineCollected: 0, monthlyRevenue: 0 });
  const [assignments, setAssignments] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [feeTypes, setFeeTypes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  // Loading indicators
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Filters & Searches
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [feeTypeFilter, setFeeTypeFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

  // Late Fee Config state
  const [fineRule, setFineRule] = useState({ rule_type: 'FIXED', rule_value: 100 });

  // Creation Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    student_id: '',
    fee_type_id: '',
    amount: '',
    due_date: ''
  });

  // Printing & detail previews
  const [printInvoice, setPrintInvoice] = useState<any>(null);

  useEffect(() => {
    fetchStaticData();
    fetchStats();
    fetchAssignments();
    fetchPayments();
    fetchInvoices();
    fetchFineRules();
  }, []);

  // Fetch lists dynamically when filters update
  useEffect(() => {
    fetchAssignments();
    fetchPayments();
    fetchInvoices();
  }, [searchQuery, statusFilter, feeTypeFilter, classFilter, dateStart, dateEnd]);

  const fetchStaticData = async () => {
    try {
      const [stuRes, typeRes, clsRes] = await Promise.all([
        api.get('/students?page=0&limit=200'),
        api.get('/fees/types'),
        api.get('/classes')
      ]);
      setStudents(stuRes.data.data || []);
      setFeeTypes(typeRes.data.data || []);
      setClasses(clsRes.data || []);
    } catch (err) {
      console.error('Failed to load static data', err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/fees/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      let params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (feeTypeFilter) params.set('feeType', feeTypeFilter);
      if (classFilter) params.set('classId', classFilter);
      
      const res = await api.get(`/fees?${params}`);
      setAssignments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      let params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (classFilter) params.set('classId', classFilter);
      if (dateStart) params.set('dateStart', dateStart);
      if (dateEnd) params.set('dateEnd', dateEnd);

      const res = await api.get(`/fees/payments?${params}`);
      setPayments(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchInvoices = async () => {
    try {
      let params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);

      const res = await api.get(`/fees/invoices?${params}`);
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFineRules = async () => {
    try {
      const res = await api.get('/fees/rules');
      if (res.data) {
        setFineRule({
          rule_type: res.data.rule_type,
          rule_value: Number(res.data.rule_value)
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveFineRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/fees/rules', fineRule);
      alert('Fine rule updated successfully!');
      fetchStats();
    } catch (err) {
      console.error(err);
      alert('Failed to update rules configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleAssignFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/fees', assignForm);
      setShowAssignModal(false);
      setAssignForm({ student_id: '', fee_type_id: '', amount: '', due_date: '' });
      fetchAssignments();
      fetchStats();
      fetchInvoices();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign fee');
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = (data: any[], title: string) => {
    if (data.length === 0) {
      alert('No data available to export.');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item =>
      Object.values(item).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusStyle = (s: string) => {
    const term = (s || 'Pending').toLowerCase();
    if (term === 'paid') return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400';
    if (term === 'overdue') return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-455';
    return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50 dark:text-indigo-400';
  };

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 dark:text-slate-100 min-h-full">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#3b3dbf] dark:text-indigo-400">Fee Administration</h1>
          <p className="text-zinc-400 text-sm mt-0.5 dark:text-slate-400">Oversee billing schedules, generate invoices, late fees rules, and payments logs.</p>
        </div>
        
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white rounded-xl text-sm font-bold transition-all shadow-sm shrink-0 active:scale-[0.98] cursor-pointer"
        >
          <Plus size={16} />
          Assign Fee
        </button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-zinc-200 dark:border-slate-800">
        {[
          { id: 'overview', label: 'Payments Overview' },
          { id: 'invoices', label: 'Generated Invoices' },
          { id: 'assignments', label: 'Student Assignments' },
          { id: 'settings', label: 'Late Fine Rules' }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === t.id
                ? 'border-[#3b3dbf] text-[#3b3dbf] dark:border-indigo-400 dark:text-indigo-400'
                : 'border-transparent text-zinc-450 hover:text-zinc-650 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Dashboard Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Analytics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-slate-500">Collected</span>
              <p className="text-xl font-bold text-zinc-900 mt-2 dark:text-slate-100">{FMT_CURRENCY(stats.collected)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-slate-500">Pending</span>
              <p className="text-xl font-bold text-zinc-900 mt-2 dark:text-slate-100">{FMT_CURRENCY(stats.pending)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-slate-500">Overdue</span>
              <p className="text-xl font-bold text-zinc-900 mt-2 dark:text-slate-105">{FMT_CURRENCY(stats.overdue)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-slate-500">Fines Collected</span>
              <p className="text-xl font-bold text-zinc-900 mt-2 dark:text-slate-105">{FMT_CURRENCY(stats.fineCollected)}</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider dark:text-slate-500">Monthly Revenue</span>
              <p className="text-xl font-bold text-teal-650 mt-2 dark:text-teal-400">{FMT_CURRENCY(stats.monthlyRevenue)}</p>
            </div>
          </div>

          {/* Payments list with Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden dark:bg-slate-900 dark:border-slate-800">
            <div className="p-4 px-6 border-b border-zinc-100 flex flex-col gap-4 bg-zinc-50/30 dark:bg-slate-900/40 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-base text-zinc-900 dark:text-slate-100">All Payments History</h3>
                <button
                  onClick={() => exportCSV(payments, 'payments')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-bold text-zinc-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 cursor-pointer"
                >
                  <Download size={13} /> Export CSV
                </button>
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search student..."
                    className="pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg w-full dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                  />
                </div>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-200 rounded-lg dark:bg-slate-850 dark:border-slate-750"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input
                  type="date"
                  value={dateStart}
                  onChange={e => setDateStart(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-200 rounded-lg dark:bg-slate-850 dark:border-slate-750"
                />
                <input
                  type="date"
                  value={dateEnd}
                  onChange={e => setDateEnd(e.target.value)}
                  className="px-3 py-2 text-xs border border-zinc-200 rounded-lg dark:bg-slate-850 dark:border-slate-750"
                />
              </div>
            </div>

            <div className="w-full overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-650 dark:text-slate-350">
                <thead className="bg-zinc-50/50 border-b border-zinc-100 dark:bg-slate-900/30 dark:border-slate-800 text-zinc-400 dark:text-slate-500 font-bold text-xs">
                  <tr>
                    <th className="px-6 py-3.5">Receipt No</th>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Class</th>
                    <th className="px-6 py-3.5">Fee Category</th>
                    <th className="px-6 py-3.5">Payment Method</th>
                    <th className="px-6 py-3.5">Payment Date</th>
                    <th className="px-6 py-3.5">Fines Paid</th>
                    <th className="px-6 py-3.5">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60 font-semibold text-xs">
                  {payments.length === 0 ? (
                    <tr><td colSpan={8} className="px-6 py-10 text-center text-zinc-300">No payment logs found.</td></tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id} className="hover:bg-zinc-50/40 dark:hover:bg-slate-850/15">
                        <td className="px-6 py-4 text-zinc-400">#{p.receipt_number}</td>
                        <td className="px-6 py-4 text-zinc-800 dark:text-slate-200 font-bold">{p.student_name}</td>
                        <td className="px-6 py-4">{p.class_name}</td>
                        <td className="px-6 py-4">{p.fee_type_name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold text-[10px] dark:bg-slate-850 dark:text-slate-350 border dark:border-slate-800">
                            {p.payment_method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-amber-500">₹{Number(p.fine_paid)}</td>
                        <td className="px-6 py-4 text-teal-600 font-black dark:text-teal-400">₹{Number(p.amount).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Generated Invoices */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 px-6 border-b border-zinc-100 flex flex-col gap-4 bg-zinc-50/30 dark:bg-slate-900/40 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-zinc-900 dark:text-slate-100">Automated Generated Invoices</h3>
              <button
                onClick={() => exportCSV(invoices, 'invoices')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-xs font-bold text-zinc-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-350 cursor-pointer"
              >
                <Download size={13} /> Export CSV
              </button>
            </div>
            
            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student invoices..."
                  className="pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg w-full dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-zinc-200 rounded-lg dark:bg-slate-850 dark:border-slate-750"
              >
                <option value="">All Invoice Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-650 dark:text-slate-350">
              <thead className="bg-zinc-50/50 border-b border-zinc-100 dark:bg-slate-900/30 dark:border-slate-800 text-zinc-400 font-bold text-xs">
                <tr>
                  <th className="px-6 py-3.5">Invoice No</th>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Class</th>
                  <th className="px-6 py-3.5">Fee Category</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Original Amount</th>
                  <th className="px-6 py-3.5">Late Fine</th>
                  <th className="px-6 py-3.5">Total Due</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60 font-semibold text-xs">
                {invoices.length === 0 ? (
                  <tr><td colSpan={10} className="px-6 py-10 text-center text-zinc-300">No invoices generated yet.</td></tr>
                ) : (
                  invoices.map(i => (
                    <tr key={i.id} className="hover:bg-zinc-50/40 dark:hover:bg-slate-850/15">
                      <td className="px-6 py-4 text-zinc-400">#{i.invoice_number}</td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-slate-200 font-bold">{i.student_name}</td>
                      <td className="px-6 py-4">{i.class_name}</td>
                      <td className="px-6 py-4">{i.fee_type_name}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(i.generated_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">₹{Number(i.original_amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-amber-500">₹{Number(i.fine_amount)}</td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-slate-200 font-bold">₹{Number(i.total_due).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-0.5 border text-[10px] rounded-full font-bold ${getStatusStyle(i.payment_status)}`}>
                          {i.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setPrintInvoice(i)}
                          className="px-3 py-1.5 bg-slate-50 border border-zinc-200 hover:bg-slate-100 rounded-lg text-[10px] font-bold text-zinc-650 cursor-pointer dark:bg-slate-850 dark:border-slate-750 dark:text-slate-350"
                        >
                          View & Print
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Assignments List */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm dark:bg-slate-900 dark:border-slate-800 flex flex-col overflow-hidden">
          <div className="p-4 px-6 border-b border-zinc-100 flex flex-col gap-4 bg-zinc-50/30 dark:bg-slate-900/40 dark:border-slate-800">
            <h3 className="font-bold text-base text-zinc-900 dark:text-slate-100">Student Fee Assignments Ledger</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search student ledger..."
                  className="pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-lg w-full dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                />
              </div>
              <select
                value={feeTypeFilter}
                onChange={e => setFeeTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-zinc-200 rounded-lg dark:bg-slate-850 dark:border-slate-750"
              >
                <option value="">All Categories</option>
                {feeTypes.map(ft => <option key={ft.id} value={ft.name}>{ft.name}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-zinc-200 rounded-lg dark:bg-slate-850 dark:border-slate-750"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-650 dark:text-slate-350">
              <thead className="bg-zinc-50/50 border-b border-zinc-100 dark:bg-slate-900/30 dark:border-slate-800 text-zinc-400 font-bold text-xs">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Class</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Original Amount</th>
                  <th className="px-6 py-3.5">Paid</th>
                  <th className="px-6 py-3.5">Fine Amount</th>
                  <th className="px-6 py-3.5">Remaining Due</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-slate-800/60 font-semibold text-xs">
                {loading ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-zinc-300">Loading...</td></tr>
                ) : assignments.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center text-zinc-300">No fee assignments recorded.</td></tr>
                ) : (
                  assignments.map(a => (
                    <tr key={a.id} className="hover:bg-zinc-50/40 dark:hover:bg-slate-850/15">
                      <td className="px-6 py-4 text-zinc-800 dark:text-slate-200 font-bold">{a.student_name}</td>
                      <td className="px-6 py-4">{a.class_name}</td>
                      <td className="px-6 py-4">{a.fee_type_name}</td>
                      <td className="px-6 py-4">₹{Number(a.amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-teal-650 dark:text-teal-400">₹{Number(a.paid_amount)}</td>
                      <td className="px-6 py-4 text-amber-500">₹{Number(a.fine_amount)}</td>
                      <td className="px-6 py-4 text-zinc-800 dark:text-slate-100 font-bold">₹{Number(a.remaining_amount).toLocaleString()}</td>
                      <td className="px-6 py-4 text-zinc-400">{new Date(a.due_date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 border text-[10px] rounded-full font-bold ${getStatusStyle(a.status)}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Fine configuration rules */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 max-w-lg dark:bg-slate-900 dark:border-slate-800">
          <h3 className="font-bold text-base text-zinc-900 dark:text-slate-100 mb-2">Late Fee Penalties Policy</h3>
          <p className="text-xs text-zinc-400 leading-relaxed mb-6">
            Configure the late fee assessment rule. Whenever an assigned invoice passes its due date, the system automatically marks it overdue and applies the late penalty according to this selection.
          </p>

          <form onSubmit={handleSaveFineRule} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Rule Type *</label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFineRule(prev => ({ ...prev, rule_type: 'FIXED' }))}
                  className={`flex-1 py-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    fineRule.rule_type === 'FIXED'
                      ? 'bg-indigo-50 border-[#3b3dbf] text-[#3b3dbf] dark:bg-indigo-950/20'
                      : 'bg-white border-zinc-200 text-zinc-500 dark:bg-slate-850 dark:border-slate-750'
                  }`}
                >
                  Fixed Penalty Dues (e.g. ₹100)
                </button>
                <button
                  type="button"
                  onClick={() => setFineRule(prev => ({ ...prev, rule_type: 'PERCENTAGE' }))}
                  className={`flex-1 py-3 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    fineRule.rule_type === 'PERCENTAGE'
                      ? 'bg-indigo-50 border-[#3b3dbf] text-[#3b3dbf] dark:bg-indigo-950/20'
                      : 'bg-white border-zinc-200 text-zinc-500 dark:bg-slate-850 dark:border-slate-750'
                  }`}
                >
                  Percentage Penalty Dues (e.g. 2%)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                {fineRule.rule_type === 'FIXED' ? 'Penalty Amount (₹) *' : 'Monthly Percentage Rate (%) *'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                  {fineRule.rule_type === 'FIXED' ? '₹' : '%'}
                </span>
                <input
                  type="number" required min="1"
                  value={fineRule.rule_value}
                  onChange={e => setFineRule(prev => ({ ...prev, rule_value: parseFloat(e.target.value) || 0 }))}
                  className="pl-7 pr-3 py-2.5 text-xs border border-zinc-200 rounded-xl bg-slate-50 dark:bg-slate-850 dark:border-slate-750 w-full focus:outline-none focus:border-[#3b3dbf]"
                />
              </div>
            </div>

            <div className="flex gap-2.5 items-center justify-center p-3 bg-zinc-50 dark:bg-slate-850/60 rounded-xl text-[10px] text-zinc-400 font-bold border border-zinc-150 dark:border-slate-800">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Configurations will apply to all future invoice overdue updates.</span>
            </div>

            <button
              type="submit" disabled={saving}
              className="w-full py-2.5 bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Saving...' : 'Save Penalty Policies'}
            </button>
          </form>
        </div>
      )}

      {/* Assign Fee Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowAssignModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm dark:bg-slate-900 dark:border dark:border-slate-800" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-slate-100">Assign Fee Invoice</h3>
                <p className="text-xs text-zinc-400 mt-0.5 dark:text-slate-400">Generate a billing assignment for a student.</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="p-1.5 text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 rounded-lg dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssignFee} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-slate-400 mb-1.5">Select Student *</label>
                <select
                  required
                  value={assignForm.student_id}
                  onChange={e => setAssignForm({ ...assignForm, student_id: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                >
                  <option value="">-- Select student --</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.class_name})</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-600 dark:text-slate-400 mb-1.5">Select Category *</label>
                <select
                  required
                  value={assignForm.fee_type_id}
                  onChange={e => setAssignForm({ ...assignForm, fee_type_id: e.target.value })}
                  className="w-full px-3 py-2.5 text-xs border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                >
                  <option value="">-- Select fee category --</option>
                  {feeTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-slate-400 mb-1.5">Amount (₹) *</label>
                  <input
                    required type="number" min="1"
                    value={assignForm.amount}
                    onChange={e => setAssignForm({ ...assignForm, amount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2.5 text-xs border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-600 dark:text-slate-400 mb-1.5">Due Date *</label>
                  <input
                    required type="date"
                    value={assignForm.due_date}
                    onChange={e => setAssignForm({ ...assignForm, due_date: e.target.value })}
                    className="w-full px-3 py-2.5 text-xs border border-zinc-200 rounded-xl focus:border-[#3b3dbf] focus:outline-none transition-colors dark:bg-slate-850 dark:border-slate-750 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAssignModal(false)} className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-650 rounded-xl text-xs font-bold hover:bg-zinc-50 dark:text-slate-450 dark:border-slate-850">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-[#3b3dbf] text-white rounded-xl text-xs font-bold hover:bg-[#2c2eb5] shadow-sm disabled:opacity-60 cursor-pointer">
                  {saving ? 'Assigning...' : 'Assign Fee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Printing View Modal */}
      {printInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-6 print:shadow-none print:border-none print:p-0 print:static">
            
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 print:hidden">
              <span className="font-bold text-xs text-slate-500 uppercase tracking-wider">Print Invoice Document</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3b3dbf] text-white rounded-xl text-xs font-bold hover:bg-[#2c2eb5] transition-all cursor-pointer"
                >
                  <Printer size={13} /> Print
                </button>
                <button 
                  onClick={() => setPrintInvoice(null)}
                  className="p-2 text-slate-400 hover:text-slate-650 rounded-xl cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div className="space-y-6 text-zinc-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-2">
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-slate-850 pb-6">
                <div>
                  <h2 className="text-xl font-black text-[#3b3dbf]">Skillyon ERP Suite</h2>
                  <p className="text-[10px] text-zinc-400 mt-1">Smart School Administration & Ledger</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black text-zinc-800 dark:text-slate-100">FEE INVOICE</h3>
                  <p className="text-[10px] font-bold text-zinc-400">Invoice No: #{printInvoice.invoice_number}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Issued To</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-slate-200 mt-1">Student: {printInvoice.student_name}</p>
                  <p className="text-zinc-500 mt-0.5">Class: {printInvoice.class_name}</p>
                  <p className="text-zinc-500 mt-0.5">Parent Notification: {printInvoice.parent_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Invoice Details</p>
                  <p className="text-zinc-800 dark:text-slate-200 mt-1">Date Generated: {new Date(printInvoice.generated_date).toLocaleDateString()}</p>
                  <p className="text-rose-500 font-bold mt-0.5">Due Date: {new Date(printInvoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border border-zinc-150 rounded-2xl overflow-hidden mt-6 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-150 dark:bg-slate-950/20 dark:border-slate-850 text-zinc-400 font-bold">
                    <tr>
                      <th className="px-5 py-3">Fee Category Item</th>
                      <th className="px-5 py-3 text-right">Base Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-slate-850/60 text-zinc-700 dark:text-slate-355 font-semibold">
                    <tr>
                      <td className="px-5 py-3.5">{printInvoice.fee_type_name}</td>
                      <td className="px-5 py-3.5 text-right">₹{Number(printInvoice.original_amount).toLocaleString()}</td>
                    </tr>
                    {Number(printInvoice.fine_amount) > 0 && (
                      <tr className="text-amber-600 dark:text-amber-400 bg-amber-50/10">
                        <td className="px-5 py-3.5">Late Overdue Penalty Fine</td>
                        <td className="px-5 py-3.5 text-right">+₹{Number(printInvoice.fine_amount).toLocaleString()}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-4">
                <div className="w-56 space-y-2 text-xs font-bold text-zinc-650 dark:text-slate-350">
                  <div className="flex justify-between">
                    <span className="font-semibold text-zinc-400">Total Outstanding</span>
                    <span className="text-teal-650 dark:text-teal-400 font-black text-sm">₹{Number(printInvoice.total_due).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-slate-800 pt-6 text-center text-[10px] text-zinc-400 font-semibold">
                <p>This is an automatically generated system invoice.</p>
                <p className="mt-0.5">Please clear the payment from your Parent portal before the late fine escalates.</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
