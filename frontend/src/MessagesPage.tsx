import { 
  Search,
  Send,
  MessageSquare,
  ChevronLeft,
  GraduationCap,
  User,
  Users
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import api from './lib/api';

interface Student {
  id: number;
  name: string;
  father_name?: string;
  email?: string;
  parent_email?: string;
  class_name?: string;
  avatar?: string;
}

interface ChatListItem {
  student_id: number;
  student_name: string;
  class_name: string;
  avatar: string;
  lastMessage: string;
  lastSender: string;
  timestamp: string;
}

interface Message {
  id: number;
  sender: 'PARENT' | 'ADMIN' | 'TEACHER' | 'STAFF';
  content: string;
  timestamp: string;
}

const TOPICS = [
  'General Query',
  'Academic Performance',
  'Attendance Management',
  'Discipline and Behavior',
  'Health and Well-being',
  'Co-curricular Activities',
  'Parent Involvement',
  'Learning Difficulties',
  'Student Development',
  'Career Guidance',
  'School Feedback and Suggestions',
  'Communication and Support',
  'Future Goals and Planning'
];

// Helper to parse topic prefixes in messages
const parseMessage = (content: string) => {
  const match = content.match(/^\[Topic:\s*([^\]]+)\]\s*(.*)/s);
  if (match) {
    return {
      topic: match[1],
      text: match[2]
    };
  }
  return {
    topic: null,
    text: content
  };
};

export default function MessagesPage() {
  const [activeChats, setActiveChats] = useState<ChatListItem[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General Query');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load all recent chats on mount
  const fetchRecentChats = async (showLoading = true) => {
    try {
      if (showLoading) setLoadingChats(true);
      const res = await api.get('/messages');
      const allMsgs = res.data.data || [];
      
      // Group messages by student to form chat list items
      const map: Record<number, ChatListItem> = {};
      allMsgs.forEach((m: any) => {
        if (!map[m.student_id]) {
          map[m.student_id] = {
            student_id: m.student_id,
            student_name: m.student_name,
            class_name: m.class_name || 'N/A',
            avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.student_name)}&background=random`,
            lastMessage: m.content,
            lastSender: m.sender,
            timestamp: m.timestamp
          };
        }
      });
      
      setActiveChats(Object.values(map));
    } catch (err) {
      console.error('Failed to load recent chats:', err);
    } finally {
      if (showLoading) setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchRecentChats();
  }, []);

  // Search students when query changes
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get(`/students?search=${encodeURIComponent(searchQuery)}&limit=20`);
        setSearchResults(res.data.data || []);
      } catch (err) {
        console.error('Failed to search students:', err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Fetch messages for selected student
  const loadMessages = async (studentId: number) => {
    try {
      setLoadingMessages(true);
      const res = await api.get(`/messages/student/${studentId}`);
      setMessages(res.data.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Select student handler
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    loadMessages(student.id);
    setSearchQuery('');
    setSearchResults([]);
    setMobileView('chat');
  };

  // Select existing chat item handler
  const handleSelectChat = (chat: ChatListItem) => {
    const student: Student = {
      id: chat.student_id,
      name: chat.student_name,
      class_name: chat.class_name,
      avatar: chat.avatar
    };
    
    // Fetch details to retrieve father_name if possible
    api.get(`/students?search=${encodeURIComponent(chat.student_name)}`).then(res => {
      const found = (res.data.data || []).find((s: any) => s.id === chat.student_id);
      if (found) {
        setSelectedStudent(found);
      } else {
        setSelectedStudent(student);
      }
    }).catch(() => {
      setSelectedStudent(student);
    });

    loadMessages(chat.student_id);
    setMobileView('chat');
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newMessage.trim() || sendingMessage) return;

    try {
      setSendingMessage(true);
      let messageContent = newMessage.trim();
      if (selectedTopic !== 'General Query') {
        messageContent = `[Topic: ${selectedTopic}] ${messageContent}`;
      }

      const res = await api.post('/messages/send', {
        student_id: selectedStudent.id,
        content: messageContent
      });

      // Add to messages display
      if (res.data) {
        setMessages(prev => [...prev, res.data]);
        setNewMessage('');
        setSelectedTopic('General Query'); // Reset to default
        
        // Refresh recent chats list to pull the latest update
        fetchRecentChats(false);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden text-zinc-900 transition-colors dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100">
      
      {/* Sidebar: Chat List & Search */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-zinc-200 flex flex-col shrink-0 dark:border-slate-800 ${
        mobileView === 'chat' ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-zinc-100 dark:border-slate-800/60">
          <h2 className="text-xl font-bold tracking-tight text-[#3b3dbf] dark:text-indigo-400">Queries & Messages</h2>
          <p className="text-xs text-zinc-400 mt-1">Message parent regarding student progress reports</p>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-zinc-100 dark:border-slate-800/60">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text"
              placeholder="Search student to start new query..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/30 focus:border-[#3b3dbf] transition-all dark:bg-slate-800 dark:border-slate-700"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim().length > 0 ? (
            // Search Results Mode
            <div>
              <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Search Results</div>
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-zinc-400 font-semibold">No students found</div>
              ) : (
                searchResults.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className="w-full p-4 flex gap-3 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-b-0 transition-colors dark:hover:bg-slate-800/50 dark:border-slate-800/60"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-[#3b3dbf] flex items-center justify-center font-bold text-sm shrink-0 dark:bg-slate-800 dark:text-indigo-300">
                      {student.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">{student.name}</div>
                      <div className="text-xs text-zinc-400 mt-0.5 truncate">
                        Class: {student.class_name || 'N/A'} {student.father_name ? `· Father: ${student.father_name}` : ''}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            // Recent Chats Mode
            <div>
              <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Conversations</div>
              {loadingChats ? (
                <div className="p-8 text-center text-xs text-zinc-400">Loading conversation history...</div>
              ) : activeChats.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-[#3b3dbf] rounded-full flex items-center justify-center dark:bg-slate-800 dark:text-indigo-300">
                    <MessageSquare size={20} />
                  </div>
                  <div className="text-xs text-zinc-400 font-bold">No query threads yet. Search for a student above to start a thread.</div>
                </div>
              ) : (
                activeChats.map(chat => {
                  const isSelected = selectedStudent?.id === chat.student_id;
                  const parsed = parseMessage(chat.lastMessage);
                  return (
                    <button
                      key={chat.student_id}
                      onClick={() => handleSelectChat(chat)}
                      className={`w-full p-4 flex gap-3 text-left hover:bg-zinc-50 border-b border-zinc-100 last:border-b-0 transition-colors relative dark:hover:bg-slate-800/50 dark:border-slate-800/60 ${
                        isSelected ? 'bg-indigo-50/50 dark:bg-slate-800' : ''
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b3dbf] dark:bg-indigo-500"></div>
                      )}
                      <img 
                        src={chat.avatar} 
                        alt={chat.student_name} 
                        className="w-10 h-10 rounded-full object-cover shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <h3 className="font-bold text-sm truncate text-zinc-800 dark:text-slate-200">{chat.student_name}</h3>
                          <span className="text-[9px] font-bold text-zinc-400 shrink-0">
                            {new Date(chat.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 font-semibold mb-1 truncate">Parent: {chat.class_name}</p>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 truncate font-semibold">
                          {parsed.topic && (
                            <span className="text-[10px] text-[#3b3dbf] dark:text-indigo-400 mr-1">
                              [{parsed.topic}]
                            </span>
                          )}
                          <span className="text-zinc-600 dark:text-slate-300">
                            {chat.lastSender === 'PARENT' ? 'Parent: ' : 'Admin: '} {parsed.text}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className={`flex-1 flex flex-col bg-zinc-50/30 dark:bg-slate-900/40 ${
        mobileView === 'list' ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedStudent ? (
          <>
            {/* Chat Pane Header */}
            <div className="h-[76px] px-6 border-b border-zinc-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                {/* Back Arrow for Mobile screen sizes */}
                <button 
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-1.5 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors dark:hover:bg-slate-800"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#3b3dbf] flex items-center justify-center font-bold text-sm shrink-0 dark:bg-slate-800 dark:text-indigo-300">
                  {selectedStudent.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-sm md:text-base text-zinc-900 dark:text-slate-100">{selectedStudent.name}</h2>
                  <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                    <span>Class: {selectedStudent.class_name || 'N/A'}</span>
                    {selectedStudent.father_name && (
                      <>
                        <span className="text-zinc-300 dark:text-slate-700">•</span>
                        <span>Father: {selectedStudent.father_name}</span>
                      </>
                    )}
                    {selectedStudent.parent_email && (
                      <>
                        <span className="text-zinc-300 dark:text-slate-700">•</span>
                        <span className="hidden sm:inline">Email: {selectedStudent.parent_email}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Message Logs */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center text-zinc-400 font-semibold text-xs">Loading message logs...</div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-2">
                  <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center dark:bg-slate-800 text-zinc-300">
                    <MessageSquare size={20} />
                  </div>
                  <div className="text-xs font-bold">Start a new query conversation regarding student progress with parent.</div>
                </div>
              ) : (
                messages.map(m => {
                  const isAdmin = m.sender !== 'PARENT';
                  const parsed = parseMessage(m.content);
                  return (
                    <div 
                      key={m.id} 
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] md:max-w-[70%] p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm ${
                        isAdmin 
                          ? 'bg-[#3b3dbf] text-white rounded-br-sm' 
                          : 'bg-white text-zinc-800 border border-zinc-100 rounded-bl-sm dark:bg-slate-800 dark:border-slate-800 dark:text-slate-200'
                      }`}>
                        <div className="text-[9px] font-bold opacity-60 uppercase mb-1">{m.sender}</div>
                        {parsed.topic && (
                          <div className="mb-1.5">
                            <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-md ${
                              isAdmin 
                                ? 'bg-white/20 text-white' 
                                : 'bg-indigo-50 text-[#3b3dbf] dark:bg-slate-700 dark:text-indigo-300'
                            }`}>
                              Topic: {parsed.topic}
                            </span>
                          </div>
                        )}
                        <div className="whitespace-pre-line">{parsed.text}</div>
                        <div className={`text-[9px] mt-1.5 text-right font-medium opacity-65`}>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Chat Box Input */}
            <form onSubmit={handleSendMessage} className="p-4 px-6 border-t border-zinc-200 bg-white dark:bg-slate-900 dark:border-slate-800 shrink-0 flex flex-col gap-3">
              {/* Category Dropdown Selection */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-slate-500 uppercase tracking-wider">Query Topic:</span>
                <select
                  value={selectedTopic}
                  onChange={e => setSelectedTopic(e.target.value)}
                  className="bg-zinc-50 border border-zinc-200 text-zinc-600 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#3b3dbf] dark:bg-slate-850 dark:border-slate-700 dark:text-slate-300"
                >
                  {TOPICS.map(topic => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                <input 
                  type="text"
                  placeholder="Type message content regarding student's report or academic query..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  disabled={sendingMessage}
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] dark:bg-slate-800 dark:border-slate-700"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() || sendingMessage}
                  className="w-11 h-11 bg-[#3b3dbf] hover:bg-[#2c2eb5] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shrink-0 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 gap-3 p-6">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center dark:bg-slate-800">
              <Users size={24} className="text-zinc-300" />
            </div>
            <div className="text-sm font-bold">Select a conversation thread or search for a student to begin messaging their parents.</div>
          </div>
        )}
      </div>

    </div>
  );
}
