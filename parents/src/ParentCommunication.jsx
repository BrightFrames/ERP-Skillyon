import React, { useEffect, useState, useRef } from 'react';
import { Send, GraduationCap, User } from 'lucide-react';

export default function ParentCommunication({ childId }){
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    if (!childId) return;
    fetchMessages();
  }, [childId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    setSending(true);
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
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Messages</h2>
        <p className="text-sm text-gray-400 mt-0.5">Chat with your child's teacher</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 flex flex-col flex-1 min-h-0 overflow-hidden">

        {/* Chat header */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
            <GraduationCap size={16} />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Class Teacher</div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span> Online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">Loading...</div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <Send size={20} className="text-gray-300" />
              </div>
              <p className="text-sm">No messages yet</p>
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'PARENT' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                  m.sender === 'PARENT'
                    ? 'bg-teal-600 text-white rounded-2xl rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-2xl rounded-bl-md'
                }`}>
                  {m.content}
                  <div className={`text-[10px] mt-1 ${m.sender === 'PARENT' ? 'text-teal-200' : 'text-gray-400'}`}>
                    {new Date(m.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 flex gap-2 shrink-0">
          <input
            type="text"
            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-teal-400 transition-colors"
            placeholder="Type a message..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
