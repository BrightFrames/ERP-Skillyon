import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ParentFees({ childId }){
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    if (!childId) return;
    const fetchFees = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`/api/parent/${childId}/fees`, { headers: { ...authHeader }, credentials: 'include' });
        const json = await res.json();
        setFees(json.data || []);
      } catch (err) {
        console.error('Failed to load fees', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFees();
  }, [childId]);

  const handlePay = async (fee) => {
    setPayingId(fee.id);
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/parent/${childId}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ term: fee.term, amount: fee.amount, method: 'UPI_STUB' }),
        credentials: 'include'
      });
      const json = await res.json();
      if (json && json.receipt) {
        const blob = new Blob([JSON.stringify(json.receipt, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `receipt_${json.paymentId}.json`;
        a.click();
        URL.revokeObjectURL(url);
        const r = await fetch(`/api/parent/${childId}/fees`, { headers: { ...authHeader }, credentials: 'include' });
        const j = await r.json();
        setFees(j.data || []);
      }
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment failed (demo)');
    } finally {
      setPayingId(null);
    }
  };

  const totalDue = fees.filter(f => f.status !== 'PAID').reduce((s, f) => s + Number(f.amount || 0), 0);
  const totalPaid = fees.filter(f => f.status === 'PAID').reduce((s, f) => s + Number(f.amount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Fees & Payments</h2>
        <p className="text-sm text-gray-400 mt-0.5">Manage payments and download receipts</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-xl"></div>)}</div>
          <div className="skeleton h-48 rounded-xl"></div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-bold text-gray-900">₹{(totalDue + totalPaid).toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Total</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className="text-2xl font-bold text-teal-600">₹{totalPaid.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Paid</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 text-center">
              <div className={`text-2xl font-bold ${totalDue > 0 ? 'text-rose-600' : 'text-teal-600'}`}>₹{totalDue.toLocaleString()}</div>
              <div className="text-xs text-gray-400 mt-1">Due</div>
            </div>
          </div>

          {/* Fee list */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Installments</h3>
            </div>

            {fees.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">No fee records found</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {fees.map(f => (
                  <div key={f.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-center gap-3">
                      {f.status === 'PAID'
                        ? <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
                        : <AlertCircle size={18} className="text-amber-500 shrink-0" />
                      }
                      <div>
                        <div className="text-sm font-medium text-gray-800">{f.term}</div>
                        <div className="text-xs text-gray-400">Due {f.due_date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-gray-900">₹{Number(f.amount).toLocaleString()}</span>
                      {f.status !== 'PAID' ? (
                        <button
                          onClick={() => handlePay(f)}
                          disabled={payingId === f.id}
                          className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          {payingId === f.id ? 'Processing...' : 'Pay Now'}
                        </button>
                      ) : (
                        <span className="px-3 py-1 bg-teal-50 text-teal-600 rounded-lg text-xs font-semibold">Paid</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
