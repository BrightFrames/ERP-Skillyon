import React, { useEffect, useState } from 'react';

export default function ParentCommunication({ childId }){
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!childId) return;
    fetchMessages();
  }, [childId]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/parent/${childId}/messages`, { headers: { ...authHeader }, credentials: 'include' });
      const json = await res.json();
      setMessages(json.data || []);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`/api/parent/${childId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ content: newMessage }),
        credentials: 'include'
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-[calc(100vh-140px)]">
      <h1 className="text-xl sm:text-2xl font-bold mb-3">Communication</h1>
      <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3">
          {loading ? (
            <div className="text-sm text-zinc-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-zinc-500 text-center py-4">No messages yet.</div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex flex-col ${m.sender === 'PARENT' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${m.sender === 'PARENT' ? 'bg-[#3b3dbf] text-white' : 'bg-gray-100 text-zinc-800'}`}>
                  {m.content}
                </div>
                <div className="text-xs text-zinc-400 mt-1">{new Date(m.timestamp).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <form onSubmit={handleSend} className="flex gap-2 border-t pt-3">
          <input
            type="text"
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:border-[#3b3dbf]"
            placeholder="Type a message to the teacher..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button type="submit" className="px-6 py-2 bg-[#3b3dbf] text-white rounded-full font-medium" disabled={!newMessage.trim()}>Send</button>
        </form>
      </div>
    </div>
  )
}
