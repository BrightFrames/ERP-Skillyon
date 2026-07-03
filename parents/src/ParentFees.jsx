import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, CreditCard, Receipt, FileText, X, ShieldCheck, ArrowRight, Sparkles, Loader2, Download, Printer, Check, ListChecks } from 'lucide-react';
import { useLanguage, t } from './i18n';

export default function ParentFees({ childId }) {
  const lang = useLanguage();
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Dynamic Theme Tracking for safe input colors
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const handleTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    window.addEventListener('appearance-changed', handleTheme);
    return () => window.removeEventListener('appearance-changed', handleTheme);
  }, []);

  const inputStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#ffffff' : '#0f172a',
    borderColor: isDark ? '#334155' : '#d1d5db',
  };

  const optionStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#ffffff' : '#0f172a',
  };

  const getButtonStyle = (isActive) => {
    if (isActive) {
      return {
        backgroundColor: '#0d9488', // Teal-600
        color: '#ffffff',
        borderColor: '#0d9488',
      };
    } else {
      return {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        color: isDark ? '#94a3b8' : '#4b5563',
        borderColor: isDark ? '#334155' : '#d1d5db',
      };
    }
  };

  // Multiple item selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Checkout modal states
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStep, setPaymentStep] = useState('checkout'); // checkout -> processing -> success
  const [paymentMethod, setPaymentMethod] = useState('upi'); // upi, card, cash
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cashReference, setCashReference] = useState('');
  const [successData, setSuccessData] = useState(null);

  // Quick Pay Modal states
  const [showQuickPay, setShowQuickPay] = useState(false);
  const [quickPayCategory, setQuickPayCategory] = useState('Tuition Fee');
  const [quickPayAmount, setQuickPayAmount] = useState('');
  const [quickPayStep, setQuickPayStep] = useState('checkout');

  // Print Invoice / Receipt states
  const [printDocument, setPrintDocument] = useState(null); // { type: 'invoice'|'receipt', data: object }

  // Custom partial payment amount
  const [isPartial, setIsPartial] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');

  const feeCategoriesList = [
    'Admission Fee',
    'Registration Fee',
    'Tuition Fee',
    'Examination Fee',
    'Development Fee',
    'Computer Fee',
    'Library Fee',
    'Laboratory Fee',
    'Sports Fee',
    'Activity / Cultural Fee',
    'Transportation (Bus) Fee',
    'Hostel Fee',
    'Uniform Fee',
    'Book & Stationery Fee',
    'Smart Class Fee',
    'Annual Fee',
    'Miscellaneous Fee',
    'Late Fee / Fine'
  ];

  useEffect(() => {
    if (!childId) return;
    fetchFees();
    fetchPaymentHistory();
  }, [childId]);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/parent/${childId}/fees`, { headers: { ...authHeader }, credentials: 'include' });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }
      const json = await res.json();
      setFees(json.data || []);
    } catch (err) {
      console.error('Failed to load fees', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/parent/${childId}/payments`, { headers: { ...authHeader }, credentials: 'include' });
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }
      const json = await res.json();
      setPayments(json.data || []);
    } catch (err) {
      console.error('Failed to load payments history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSelectToggle = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(x => x !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleSelectAllToggle = () => {
    const pendingIds = fees.filter(f => f.status !== 'PAID').map(f => f.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const openCheckout = (fee = null) => {
    let ids = selectedIds;
    if (fee) {
      ids = [fee.id];
      setSelectedIds([fee.id]);
    }
    if (ids.length === 0) return;
    
    setPaymentStep('checkout');
    setPaymentMethod('upi');
    setUpiId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCashReference('');
    setSuccessData(null);
    setIsPartial(false);
    
    if (ids.length === 1) {
      const activeFee = fee || fees.find(f => f.id === ids[0]);
      setPartialAmount(activeFee ? String(Number(activeFee.remaining_amount)) : '');
    } else {
      setPartialAmount('');
    }
    
    setShowCheckout(true);
  };

  const openQuickPay = () => {
    setQuickPayStep('checkout');
    setPaymentMethod('upi');
    setUpiId('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCashReference('');
    setQuickPayAmount('');
    setQuickPayCategory('Tuition Fee');
    setSuccessData(null);
    setShowQuickPay(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setPaymentStep('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      
      const payload = {
        assignmentIds: selectedIds,
        method: paymentMethod.toUpperCase()
      };

      if (selectedIds.length === 1 && isPartial && partialAmount) {
        payload.amount = parseFloat(partialAmount);
      }

      const res = await fetch(`/api/parent/${childId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      
      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }
      
      const json = await res.json();
      if (json.success) {
        setSuccessData({
          receipt: json.receipt,
          paymentId: json.paymentId
        });
        setPaymentStep('success');
        window.dispatchEvent(new Event('appearance-changed'));
      } else {
        throw new Error('Payment execution error');
      }
    } catch (err) {
      console.error(err);
      alert('Payment processing failed.');
      setPaymentStep('checkout');
    }
  };

  const handleQuickPaySubmit = async (e) => {
    e.preventDefault();
    setQuickPayStep('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/parent/${childId}/quick-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          feeTypeName: quickPayCategory,
          amount: parseFloat(quickPayAmount),
          method: paymentMethod.toUpperCase()
        }),
        credentials: 'include'
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
        return;
      }

      const json = await res.json();
      if (json.success) {
        setSuccessData({
          receipt: json.receipt,
          paymentId: json.paymentId
        });
        setQuickPayStep('success');
        window.dispatchEvent(new Event('appearance-changed'));
      } else {
        throw new Error('Quick pay failed');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process quick payment.');
      setQuickPayStep('checkout');
    }
  };

  const closeCheckoutFlow = () => {
    setShowCheckout(false);
    setShowQuickPay(false);
    setSelectedIds([]);
    setSuccessData(null);
    fetchFees();
    fetchPaymentHistory();
  };

  const handlePrint = (type, data) => {
    setPrintDocument({ type, data });
  };

  const executeSystemPrint = () => {
    window.print();
  };

  const getCategoryDetails = (type) => {
    const term = (type || 'Academic').toUpperCase();
    
    if (term.includes('ADMISSION')) {
      return { bg: 'bg-indigo-50 border border-indigo-150 dark:bg-indigo-955/20 dark:border-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-400', label: t('Admission Fee', lang) };
    }
    if (term.includes('REGISTRATION')) {
      return { bg: 'bg-indigo-50 border border-indigo-155 dark:bg-indigo-955/20 dark:border-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-400', label: t('Registration Fee', lang) };
    }
    if (term.includes('TUITION') || term.includes('ACADEMIC')) {
      return { bg: 'bg-indigo-50 border border-indigo-155 dark:bg-indigo-955/20 dark:border-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-400', label: t('Tuition Fee', lang) };
    }
    if (term.includes('ANNUAL')) {
      return { bg: 'bg-indigo-50 border border-indigo-155 dark:bg-indigo-955/20 dark:border-indigo-900/50', text: 'text-indigo-700 dark:text-indigo-400', label: t('Annual Fee', lang) };
    }
    
    if (term.includes('EXAM')) {
      return { bg: 'bg-sky-50 border border-sky-155 dark:bg-sky-955/20 dark:border-sky-900/50', text: 'text-sky-700 dark:text-sky-400', label: t('Examination Fee', lang) };
    }
    if (term.includes('COMPUTER')) {
      return { bg: 'bg-sky-50 border border-sky-155 dark:bg-sky-955/20 dark:border-sky-900/50', text: 'text-sky-700 dark:text-sky-400', label: t('Computer Fee', lang) };
    }
    if (term.includes('LABORATORY') || term.includes('LAB ')) {
      return { bg: 'bg-sky-50 border border-sky-155 dark:bg-sky-955/20 dark:border-sky-900/50', text: 'text-sky-700 dark:text-sky-400', label: t('Laboratory Fee', lang) };
    }
    if (term.includes('LIBRARY')) {
      return { bg: 'bg-sky-50 border border-sky-155 dark:bg-sky-955/20 dark:border-sky-900/50', text: 'text-sky-700 dark:text-sky-400', label: t('Library Fee', lang) };
    }
    if (term.includes('SMART CLASS')) {
      return { bg: 'bg-sky-50 border border-sky-155 dark:bg-sky-955/20 dark:border-sky-900/50', text: 'text-sky-700 dark:text-sky-400', label: t('Smart Class Fee', lang) };
    }

    if (term.includes('SPORT')) {
      return { bg: 'bg-emerald-50 border border-emerald-150 dark:bg-emerald-955/20 dark:border-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-400', label: t('Sports Fee', lang) };
    }
    if (term.includes('ACTIVITY') || term.includes('CULTURAL')) {
      return { bg: 'bg-emerald-50 border border-emerald-150 dark:bg-emerald-955/20 dark:border-emerald-900/50', text: 'text-emerald-700 dark:text-emerald-400', label: t('Activity / Cultural Fee', lang) };
    }

    if (term.includes('LATE') || term.includes('FINE') || term.includes('PENALTY')) {
      return { bg: 'bg-rose-50 border border-rose-150 dark:bg-rose-955/20 dark:border-rose-900/50', text: 'text-rose-700 dark:text-rose-400', label: t('Late Fee / Fine', lang) };
    }

    if (term.includes('TRANSPORT') || term.includes('BUS')) {
      return { bg: 'bg-amber-50 border border-amber-150 dark:bg-amber-955/20 dark:border-amber-900/50', text: 'text-amber-700 dark:text-amber-400', label: t('Transportation (Bus) Fee', lang) };
    }
    if (term.includes('HOSTEL')) {
      return { bg: 'bg-amber-50 border border-amber-150 dark:bg-amber-955/20 dark:border-amber-900/50', text: 'text-amber-700 dark:text-amber-400', label: t('Hostel Fee', lang) };
    }
    if (term.includes('DEVELOPMENT')) {
      return { bg: 'bg-purple-50 border border-purple-150 dark:bg-purple-955/20 dark:border-purple-900/50', text: 'text-purple-700 dark:text-purple-400', label: t('Development Fee', lang) };
    }
    if (term.includes('UNIFORM')) {
      return { bg: 'bg-purple-50 border border-purple-150 dark:bg-purple-955/20 dark:border-purple-900/50', text: 'text-purple-700 dark:text-purple-400', label: t('Uniform Fee', lang) };
    }
    if (term.includes('BOOK') || term.includes('STATIONERY')) {
      return { bg: 'bg-purple-50 border border-purple-150 dark:bg-purple-955/20 dark:border-purple-900/50', text: 'text-purple-700 dark:text-purple-400', label: t('Book & Stationery Fee', lang) };
    }
    
    return { 
      bg: 'bg-slate-50 border border-slate-100 dark:bg-slate-855/60 dark:border-slate-800/60', 
      text: 'text-slate-700 dark:text-slate-400', 
      label: t(type || 'Miscellaneous Fee', lang) 
    };
  };

  const getStatusColorBadge = (status) => {
    const s = (status || 'Pending').toLowerCase();
    if (s === 'paid') return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-teal-400 dark:border-teal-900/50';
    if (s === 'overdue') return 'bg-red-50 text-red-500 border-red-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/50';
    if (s === 'partially paid') return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-955/20 dark:text-amber-400 dark:border-amber-900/50';
    return 'bg-indigo-50 text-[#3b3dbf] border-indigo-100 dark:bg-indigo-955/20 dark:text-indigo-400 dark:border-indigo-900/50';
  };

  const totalDue = fees.reduce((acc, f) => acc + Number(f.remaining_amount || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + Number(f.paid_amount || 0), 0);
  const totalFine = fees.reduce((acc, f) => acc + Number(f.fine_amount || 0), 0);
  const aggregateTotal = fees.reduce((acc, f) => acc + Number(f.amount || 0), 0);

  // Selected subtotal calculations
  const selectedFees = fees.filter(f => selectedIds.includes(f.id));
  const selectedSubtotal = selectedFees.reduce((s, f) => s + Number(f.remaining_amount), 0);
  const selectedFineTotal = selectedFees.reduce((s, f) => s + Number(f.fine_amount), 0);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-slate-800 dark:text-teal-400">
            <CreditCard size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">{t("Fees & Payments", lang)}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{t("Manage payments, configure parameters, and download receipts", lang)}</p>
          </div>
        </div>

        {/* Quick Pay Button */}
        <button
          onClick={openQuickPay}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-655 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-teal-500/10 cursor-pointer"
        >
          <Sparkles size={13} className="text-teal-200" />
          <span>{t("Quick Pay / Submit Fee", lang)}</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="bg-slate-100 dark:bg-slate-855 h-20 rounded-[20px]"></div>)}
          </div>
          <div className="bg-slate-100 dark:bg-slate-855 h-48 rounded-[24px]"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("Total Billed", lang)}</span>
              <div className="text-xl font-extrabold text-slate-855 dark:text-slate-100 mt-2">₹{aggregateTotal.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("Total Paid", lang)}</span>
              <div className="text-xl font-extrabold text-teal-650 dark:text-teal-400 mt-2">₹{totalPaid.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t("Outstanding Dues", lang)}</span>
              <div className={`text-xl font-extrabold ${totalDue > 0 ? 'text-rose-500' : 'text-teal-600'} mt-2`}>₹{totalDue.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-[20px] p-4 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider">{t("Total Fine / Fines", lang)}</span>
              <div className={`text-xl font-extrabold ${totalFine > 0 ? 'text-amber-500' : 'text-slate-400'} mt-2`}>₹{totalFine.toLocaleString()}</div>
            </div>
          </div>

          {/* Overdue alert banner */}
          {fees.some(f => f.status.toLowerCase() === 'overdue') && (
            <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-3 dark:bg-rose-955/5 dark:border-rose-900/40">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-red-600 dark:text-red-400">{t("Late Fee Warning Notice", lang)}</h4>
                <p className="text-[10px] text-red-500/90 leading-relaxed mt-0.5">
                  {t("You have outstanding fee installments which have passed their due dates. Late fee fine penalties have been added.", lang)}
                </p>
              </div>
            </div>
          )}

          {/* Installments Assignments Card */}
          <div className="bg-white rounded-[24px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-slate-855 dark:text-slate-100">{t("Due Installments", lang)}</h3>
              
              {fees.some(f => f.status !== 'PAID') && (
                <button
                  onClick={handleSelectAllToggle}
                  className="text-xs text-teal-655 hover:text-teal-700 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                >
                  <ListChecks size={14} />
                  <span>
                    {selectedIds.length === fees.filter(f => f.status !== 'PAID').length 
                      ? t("Deselect All", lang) 
                      : t("Select All Dues", lang)
                    }
                  </span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fees.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">{t("No fee records assigned", lang)}</div>
              ) : (
                fees.map(f => {
                  const cat = getCategoryDetails(f.term);
                  const isPaid = f.status.toUpperCase() === 'PAID';
                  const isChecked = selectedIds.includes(f.id);
                  
                  // Calculate progress percentage
                  const pct = Math.min(100, Math.round((Number(f.paid_amount) / (Number(f.amount) + Number(f.fine_amount))) * 100) || 0);

                  return (
                    <div key={f.id} className={`px-6 py-5 flex flex-col gap-3.5 transition-all ${isChecked ? 'bg-teal-50/5 dark:bg-teal-955/5' : ''}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {/* Selection Checkbox */}
                          {!isPaid && (
                            <button
                              onClick={() => handleSelectToggle(f.id)}
                              className={`mt-1.5 w-4.5 h-4.5 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                isChecked 
                                  ? 'bg-teal-600 border-teal-600 text-white' 
                                  : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-855 dark:border-slate-700'
                              }`}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </button>
                          )}
                          
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-855 dark:text-slate-100">{cat.label}</span>
                              <span className={`text-[9px] font-bold border px-2 py-0.5 rounded-full uppercase ${getStatusColorBadge(f.status)}`}>
                                {t(f.status, lang)}
                              </span>
                              {Number(f.fine_amount) > 0 && (
                                <span className="text-[9px] font-bold bg-rose-50 border border-rose-100 text-rose-500 px-2.5 py-0.5 rounded-full dark:bg-rose-955/10 dark:border-rose-900 dark:text-rose-400">
                                  +{t("Fine", lang)}: ₹{Number(f.fine_amount)}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 flex gap-3 flex-wrap">
                              <span>{t("Due Date", lang)}: {new Date(f.due_date).toLocaleDateString()}</span>
                              {f.last_payment_date && (
                                <span className="text-teal-650 dark:text-teal-400 font-semibold">{t("Last Paid Date", lang)}: {new Date(f.last_payment_date).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Invoice & Actions Column */}
                        <div className="text-right flex flex-col gap-1.5">
                          <span className="text-sm font-black text-slate-855 dark:text-slate-100">₹{Number(f.remaining_amount).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{t("Paid", lang)}: ₹{Number(f.paid_amount)} / ₹{Number(f.amount)}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-teal-500' : 'bg-[#3b3dbf] dark:bg-indigo-500'}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 w-7 text-right">{pct}%</span>
                      </div>

                      {/* Printable Invoice trigger */}
                      <div className="flex justify-between items-center text-[10px]">
                        <button 
                          onClick={() => handlePrint('invoice', f)}
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 transition-colors font-bold uppercase tracking-wider cursor-pointer"
                        >
                          <FileText size={11} />
                          <span>{t("View Invoice", lang)}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Payment History section */}
          <div className="bg-white rounded-[24px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-855 dark:text-slate-100">{t("Payment History Logs", lang)}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 dark:bg-slate-950/20 dark:border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="px-6 py-3.5">{t("Receipt No", lang)}</th>
                    <th className="px-6 py-3.5">{t("Fee Category", lang)}</th>
                    <th className="px-6 py-3.5">{t("Payment Method", lang)}</th>
                    <th className="px-6 py-3.5">{t("Transaction Date", lang)}</th>
                    <th className="px-6 py-3.5">{t("Amount Paid", lang)}</th>
                    <th className="px-6 py-3.5 text-center">{t("Receipt", lang)}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40 text-slate-600 dark:text-slate-355 font-semibold">
                  {historyLoading ? (
                    <tr><td colSpan={6} className="text-center py-6 text-slate-300">...</td></tr>
                  ) : payments.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-slate-300">{t("No transactions found.", lang)}</td></tr>
                  ) : (
                    payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-855/10">
                        <td className="px-6 py-3.5 text-slate-400">{p.receipt_number}</td>
                        <td className="px-6 py-3.5 text-slate-800 dark:text-slate-200">{getCategoryDetails(p.fee_name).label}</td>
                        <td className="px-6 py-3.5">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] uppercase font-bold dark:bg-slate-800 dark:text-slate-300">{p.payment_method}</span>
                        </td>
                        <td className="px-6 py-3.5">{new Date(p.payment_date).toLocaleDateString()}</td>
                        <td className="px-6 py-3.5 text-teal-655 dark:text-teal-400 font-bold">₹{Number(p.amount).toLocaleString()}</td>
                        <td className="px-6 py-3.5 text-center">
                          <button
                            onClick={() => handlePrint('receipt', p)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1 text-[10px]"
                          >
                            <Receipt size={13} /> {t("Receipt", lang)}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Floating checkout drawer for multiple selections */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl border border-slate-150 shadow-2xl p-4 flex items-center justify-between gap-6 z-40 w-full max-w-lg dark:bg-slate-900 dark:border-slate-850 animate-in slide-in-from-bottom-6 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center dark:bg-teal-955/20 dark:text-teal-400 font-bold text-sm">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-855 dark:text-slate-100">{t("Selected Fees Selected", lang)}</p>
              <p className="text-[10px] text-slate-400 font-medium">{t("Platform charge and late fines included.", lang)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-right">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{t("Subtotal due", lang)}</p>
              <p className="text-sm font-black text-slate-855 dark:text-slate-100">₹{selectedSubtotal.toLocaleString()}</p>
            </div>
            <button
              onClick={() => openCheckout()}
              className="px-5 py-2.5 bg-teal-655 hover:bg-teal-755 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-500/10 cursor-pointer"
            >
              {t("Pay Selected Dues", lang)}
            </button>
          </div>
        </div>
      )}

      {/* Payment checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden dark:bg-slate-900 dark:border-slate-850">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-teal-500" />
                <h3 className="font-bold text-sm text-slate-855 dark:text-slate-100">{t("Secure Checkout", lang)}</h3>
              </div>
              <button 
                onClick={closeCheckoutFlow}
                disabled={paymentStep === 'processing'}
                className="p-1.5 text-slate-400 hover:text-slate-655 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {paymentStep === 'checkout' && (
              <form onSubmit={handlePaySubmit} className="flex flex-col">
                <div className="p-6 bg-slate-50 border-b border-slate-100 flex flex-col gap-2.5 dark:bg-slate-955/30 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-semibold">
                    <span>{t("Selected Items", lang)}</span>
                    <span className="text-slate-700 dark:text-slate-355">{selectedIds.length} fee installment(s)</span>
                  </div>
                  
                  {/* Single item partial pay configuration */}
                  {selectedIds.length === 1 && (
                    <div className="mt-2 space-y-3 p-3 bg-white border border-slate-150 rounded-xl dark:bg-slate-850 dark:border-slate-750">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="radio" name="payType" checked={!isPartial} 
                            onChange={() => setIsPartial(false)} 
                            className="cursor-pointer"
                          />
                          <span>{t("Pay Full Remaining", lang)}</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                          <input 
                            type="radio" name="payType" checked={isPartial} 
                            onChange={() => setIsPartial(true)} 
                            className="cursor-pointer"
                          />
                          <span>{t("Pay Partial Dues", lang)}</span>
                        </label>
                      </div>

                      {isPartial && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">{t("Payment Amount", lang)}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">₹</span>
                            <input
                              type="number" required
                              min={100}
                              max={selectedSubtotal}
                              value={partialAmount}
                              onChange={e => setPartialAmount(e.target.value)}
                              style={inputStyle}
                              className="pl-7 pr-3 py-2 text-xs border rounded-lg w-full bg-slate-50 focus:outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-semibold text-slate-400">{t("Subtotal Base", lang)}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      ₹{Number(selectedIds.length === 1 && isPartial ? partialAmount : selectedSubtotal).toLocaleString()}
                    </span>
                  </div>
                  {selectedFineTotal > 0 && !isPartial && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-400">{t("Late Fine", lang)}</span>
                      <span className="text-xs font-bold text-amber-500">₹{selectedFineTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-400">{t("Platform Fee", lang)}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">₹10.00</span>
                  </div>
                  <div className="h-px bg-slate-200/60 dark:bg-slate-800 my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-355">{t("Total Payable", lang)}</span>
                    <span className="text-sm font-black text-teal-650 dark:text-teal-400">
                      ₹{Number((selectedIds.length === 1 && isPartial ? Number(partialAmount) : selectedSubtotal) + 10).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-2">{t("Choose Payment Method", lang)}</label>
                    <div className="flex gap-2">
                      {['upi', 'card', 'cash'].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPaymentMethod(m)}
                          style={getButtonStyle(paymentMethod === m)}
                          className="flex-1 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          {m === 'upi' ? t('UPI', lang) : m === 'card' ? t('Card', lang) : t('Cash', lang)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {paymentMethod === 'upi' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("UPI Address", lang)} *</label>
                      <input
                        type="text" required
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="parent@upi"
                        style={inputStyle}
                        className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Card Number", lang)} *</label>
                        <input
                          type="text" required
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          placeholder="4111 2222 3333 4444"
                          style={inputStyle}
                          className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Expiry", lang)} *</label>
                          <input
                            type="text" required
                            value={cardExpiry}
                            onChange={e => setCardExpiry(e.target.value)}
                            placeholder="MM/YY"
                            style={inputStyle}
                            className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CVV *</label>
                          <input
                            type="password" required maxLength={3}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value)}
                            placeholder="•••"
                            style={inputStyle}
                            className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'cash' && (
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Cash Handover Details / Receipt No", lang)} *</label>
                      <input
                        type="text" required
                        value={cashReference}
                        onChange={e => setCashReference(e.target.value)}
                        placeholder="e.g. Paid at School Desk Counter 1"
                        style={inputStyle}
                        className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-2.5 items-center justify-center p-3 bg-slate-50 dark:bg-slate-850/60 rounded-xl text-[9px] text-slate-400 font-bold border border-slate-100 dark:border-slate-800">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>{t("Secured by SSL with 256-bit encryption", lang)}</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <span>{t("Proceed to Pay", lang)}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </form>
            )}

            {paymentStep === 'processing' && (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">{t("Securing Transaction...", lang)}</h4>
                  <p className="text-[11px] text-slate-455 mt-1">{t("Processing payment. Please do not refresh page...", lang)}</p>
                </div>
              </div>
            )}

            {paymentStep === 'success' && successData && (
              <div className="p-6 flex flex-col items-center text-center gap-6">
                <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-teal-950/20 dark:text-teal-400">
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                </div>
                
                <div>
                  <h4 className="font-extrabold text-base text-slate-850 dark:text-slate-100">{t("Payment Successful!", lang)}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t("Your receipt has been successfully generated.", lang)}</p>
                </div>

                <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2 text-xs dark:bg-slate-950/30 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">{t("Receipt No", lang)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-355">{successData.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">{t("Items Paid", lang)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-355">{successData.receipt.items.length} Category(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">{t("Amount Paid", lang)}</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">₹{Number(successData.receipt.amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handlePrint('receipt', successData.receipt)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-750 text-slate-655 hover:text-slate-800 rounded-xl text-xs font-bold transition-all dark:text-slate-350 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{t("Receipt PDF", lang)}</span>
                  </button>
                  
                  <button
                    onClick={closeCheckoutFlow}
                    className="flex-1 py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {t("Back to Fees", lang)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modern Quick Pay Modal */}
      {showQuickPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[28px] border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden dark:bg-slate-900 dark:border-slate-855">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-105 flex items-center justify-between dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-teal-500" />
                <h3 className="font-bold text-sm text-slate-855 dark:text-slate-100">{t("Custom Fee Submission", lang)}</h3>
              </div>
              <button 
                onClick={closeCheckoutFlow}
                disabled={quickPayStep === 'processing'}
                className="p-1.5 text-slate-450 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {quickPayStep === 'checkout' && (
              <form onSubmit={handleQuickPaySubmit} className="flex flex-col p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Select Fee Type", lang)} *</label>
                  <select
                    value={quickPayCategory}
                    onChange={e => setQuickPayCategory(e.target.value)}
                    style={inputStyle}
                    className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                  >
                    {feeCategoriesList.map(name => (
                      <option key={name} value={name} style={optionStyle}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Enter Amount (₹)", lang)} *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">₹</span>
                    <input
                      type="number" required min="100"
                      value={quickPayAmount}
                      onChange={e => setQuickPayAmount(e.target.value)}
                      placeholder="e.g. 1500"
                      style={inputStyle}
                      className="w-full pl-8 pr-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-405 uppercase tracking-wider mb-2">{t("Choose Payment Method", lang)}</label>
                  <div className="flex gap-2">
                    {['upi', 'card', 'cash'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        style={getButtonStyle(paymentMethod === m)}
                        className="flex-1 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        {m === 'upi' ? t('UPI', lang) : m === 'card' ? t('Card', lang) : t('Cash', lang)}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("UPI Address", lang)} *</label>
                    <input
                      type="text" required
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="parent@upi"
                      style={inputStyle}
                      className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Card Number", lang)} *</label>
                      <input
                        type="text" required
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        placeholder="4111 2222 3333 4444"
                        style={inputStyle}
                        className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Expiry", lang)} *</label>
                        <input
                          type="text" required
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          style={inputStyle}
                          className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">CVV *</label>
                        <input
                          type="password" required maxLength={3}
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          placeholder="•••"
                          style={inputStyle}
                          className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t("Cash Handover Details / Receipt No", lang)} *</label>
                    <input
                      type="text" required
                      value={cashReference}
                      onChange={e => setCashReference(e.target.value)}
                      placeholder="e.g. Paid at School Desk Counter 1"
                      style={inputStyle}
                      className="w-full px-3.5 py-2.5 text-xs border rounded-xl focus:outline-none focus:border-teal-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer mt-2"
                >
                  <span>{t("Confirm & Pay Fee", lang)}</span>
                  <ArrowRight size={14} />
                </button>
              </form>
            )}

            {quickPayStep === 'processing' && (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-200">{t("Securing Transaction...", lang)}</h4>
                  <p className="text-[11px] text-slate-450 mt-1">{t("Processing custom payment. Please wait...", lang)}</p>
                </div>
              </div>
            )}

            {quickPayStep === 'success' && successData && (
              <div className="p-6 flex flex-col items-center text-center gap-6">
                <div className="w-14 h-14 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center dark:bg-teal-955/20 dark:text-teal-400">
                  <CheckCircle2 size={32} className="stroke-[2.5]" />
                </div>
                
                <div>
                  <h4 className="font-extrabold text-base text-slate-850 dark:text-slate-100">{t("Payment Successful!", lang)}</h4>
                  <p className="text-xs text-slate-400 mt-1">{t("Your quick receipt has been generated.", lang)}</p>
                </div>

                <div className="w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 space-y-2 text-xs dark:bg-slate-950/30 dark:border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">{t("Receipt No", lang)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-350">{successData.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">{t("Category", lang)}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-355">{quickPayCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-semibold">{t("Amount Paid", lang)}</span>
                    <span className="font-bold text-teal-600 dark:text-teal-400">₹{Number(successData.receipt.amount).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={() => handlePrint('receipt', successData.receipt)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-750 text-slate-655 hover:text-slate-800 rounded-xl text-xs font-bold transition-all dark:text-slate-355 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>{t("Receipt PDF", lang)}</span>
                  </button>
                  
                  <button
                    onClick={closeCheckoutFlow}
                    className="flex-1 py-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {t("Back to Fees", lang)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PDF / Printing Modal Viewer */}
      {printDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-6 print:shadow-none print:border-none print:p-0 print:static">
            
            {/* Modal Controls (hidden on system print) */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 print:hidden">
              <span className="font-bold text-sm text-slate-500 uppercase tracking-wider">
                {printDocument.type === 'invoice' ? t("Download Invoice", lang) : t("Payment Receipt", lang)}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={executeSystemPrint}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Printer size={13} /> Print
                </button>
                <button 
                  onClick={() => setPrintDocument(null)}
                  className="p-2 text-slate-400 hover:text-slate-655 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="space-y-6 text-zinc-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-2">
              <div className="flex items-start justify-between border-b border-zinc-100 dark:border-slate-800 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-[#3b3dbf]" />
                    <span className="text-xl font-black tracking-tight text-[#3b3dbf]">EduCore ERP</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-semibold mt-1">Smart School Administration Suite</p>
                </div>
                <div className="text-right">
                  <h3 className="text-lg font-black uppercase text-zinc-800 dark:text-slate-100">
                    {printDocument.type === 'invoice' ? t("INVOICE", lang) : t("RECEIPT", lang)}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5">
                    {printDocument.type === 'invoice' 
                      ? `${t("Invoice No", lang)}: #INV-${printDocument.data.id}` 
                      : `${t("Receipt No", lang)}: #${printDocument.data.receipt_number || printDocument.data.receiptNumber}`
                    }
                  </p>
                </div>
              </div>

              {/* Details table */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t("Issued To", lang)}</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-slate-200 mt-1">{t("Student Name", lang)}: {printDocument.data.studentName || 'Ward'}</p>
                  <p className="text-zinc-500 mt-0.5">{t("Student ID", lang)}: #{childId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">{t("Details", lang)}</p>
                  <p className="text-zinc-800 dark:text-slate-200 mt-1">
                    {t("Date", lang)}: {new Date(printDocument.data.payment_date || printDocument.data.date || Date.now()).toLocaleDateString()}
                  </p>
                  {printDocument.type === 'invoice' && (
                    <p className="text-rose-500 mt-0.5 font-bold">
                      {t("Due Date", lang)}: {new Date(printDocument.data.due_date).toLocaleDateString()}
                    </p>
                  )}
                  {printDocument.type === 'receipt' && (
                    <p className="text-teal-655 mt-0.5 font-bold">
                      {t("Method", lang)}: {printDocument.data.payment_method || printDocument.data.method}
                    </p>
                  )}
                </div>
              </div>

              {/* Items details breakdown */}
              <div className="border border-zinc-150 rounded-2xl overflow-hidden mt-6 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 border-b border-zinc-155 dark:bg-slate-950/20 dark:border-slate-855 text-zinc-400 font-bold">
                    <tr>
                      <th className="px-5 py-3">{t("Fee Category Item", lang)}</th>
                      <th className="px-5 py-3 text-right">{printDocument.type === 'invoice' ? t("Base Amount", lang) : t("Amount Paid", lang)}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-slate-850/60 text-zinc-700 dark:text-slate-350 font-semibold">
                    {printDocument.type === 'invoice' ? (
                      <>
                        <tr>
                          <td className="px-5 py-3.5">{getCategoryDetails(printDocument.data.term).label}</td>
                          <td className="px-5 py-3.5 text-right">₹{Number(printDocument.data.amount).toLocaleString()}</td>
                        </tr>
                        {Number(printDocument.data.fine_amount) > 0 && (
                          <tr className="text-amber-600 dark:text-amber-400 bg-amber-50/10">
                            <td className="px-5 py-3.5">{t("Overdue Late Fine", lang)}</td>
                            <td className="px-5 py-3.5 text-right">+₹{Number(printDocument.data.fine_amount).toLocaleString()}</td>
                          </tr>
                        )}
                      </>
                    ) : (
                      printDocument.data.items ? (
                        printDocument.data.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-5 py-3.5">{getCategoryDetails(item.name).label}</td>
                            <td className="px-5 py-3.5 text-right">₹{Number(item.amount).toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="px-5 py-3.5">{getCategoryDetails(printDocument.data.fee_name).label}</td>
                          <td className="px-5 py-3.5 text-right">₹{Number(printDocument.data.amount).toLocaleString()}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total breakdown */}
              <div className="flex justify-end mt-4">
                <div className="w-56 space-y-2 text-xs font-bold text-zinc-650 dark:text-slate-355">
                  <div className="flex justify-between">
                    <span className="font-semibold text-zinc-400">{t("Subtotal", lang)}</span>
                    <span>
                      ₹{Number(
                        printDocument.type === 'invoice' 
                          ? Number(printDocument.data.amount) + Number(printDocument.data.fine_amount)
                          : (printDocument.data.items ? printDocument.data.items.reduce((s,i)=>s+Number(i.amount),0) : printDocument.data.amount)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-100 dark:border-slate-800 pt-2 text-sm text-zinc-800 dark:text-slate-100">
                    <span className="font-black">{t("Total Payable", lang)}</span>
                    <span className="text-teal-650 dark:text-teal-400 font-black">
                      ₹{Number(
                        printDocument.type === 'invoice' 
                          ? Number(printDocument.data.amount) + Number(printDocument.data.fine_amount)
                          : (printDocument.data.amount || printDocument.data.items?.reduce((s,i)=>s+Number(i.amount),0))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer notice */}
              <div className="border-t border-zinc-100 dark:border-slate-800 pt-6 text-center text-[10px] text-zinc-400 font-semibold leading-normal">
                <p>{t("This is an automatically generated system invoice/receipt.", lang)}</p>
                <p className="mt-0.5">{t("Thank you for your continuous support in our educational efforts.", lang)}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
