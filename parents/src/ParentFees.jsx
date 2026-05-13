import React, { useEffect, useState } from 'react';

export default function ParentFees({ childId }){
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const r = await fetch(`/api/parent/${childId}/fees`, { credentials: 'include' });
        const j = await r.json();
        setFees(j.data || []);
      }
    } catch (err) {
      console.error('Payment failed', err);
      alert('Payment failed (demo)');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Fees & Payments</h1>
      {loading ? (
        <div className="text-sm text-zinc-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h3 className="font-semibold">Breakdown</h3>
          <ul className="mt-2 text-sm text-zinc-700">
            {fees.map(f => (
              <li key={f.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 sm:py-2 border-b last:border-b-0 gap-2">
                <div>
                  <div className="font-medium">{f.term}</div>
                  <div className="text-xs text-zinc-500">Due {f.due_date}</div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 sm:ml-4">
                  <div className="font-medium">₹{f.amount}</div>
                  {f.status !== 'PAID' ? (
                    <button onClick={() => handlePay(f)} className="px-3 py-1 w-full sm:w-auto bg-[#3b3dbf] text-white rounded-md text-sm">Pay Now</button>
                  ) : (
                    <div className="text-sm text-green-600 font-semibold">Paid</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
