import { 
  Edit, 
  Phone, 
  Video, 
  Info, 
  Plus, 
  Paperclip, 
  Image as ImageIcon, 
  Smile, 
  Send, 
  FileText, 
  Download, 
  Users, 
  Megaphone,
  MoreHorizontal
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from './lib/api';

export default function MessagesPage() {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    api.get('/messages').then(res => {
      // transform real messages into chat format for UI
      const dbChats = (res.data.data || []).map((m: any) => ({
        id: m.id,
        name: `Parent of ${m.student_name} (${m.class_name})`,
        role: m.sender,
        message: m.content,
        time: new Date(m.timestamp).toLocaleTimeString(),
        avatar: m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.student_name)}&background=random`,
        active: true,
        selected: false,
        type: 'user'
      }));
      setChats(dbChats);
    }).catch(err => console.error(err));
  }, []);

  return (
    <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden text-zinc-900">
      
      {/* Left Pane: Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-zinc-200 flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold">Messages</h2>
          <button className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3b3dbf] flex items-center justify-center hover:bg-indigo-100 transition-colors">
            <Edit size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-5 pt-3 border-b border-zinc-100 bg-white">
          <button className="pb-3 text-sm font-bold text-[#3b3dbf] border-b-2 border-[#3b3dbf] mr-6">
            All Chats
          </button>
          <button className="pb-3 text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors mr-6">
            Classes
          </button>
          <button className="pb-3 text-sm font-semibold text-zinc-500 hover:text-zinc-800 transition-colors">
            Groups
          </button>
        </div>

        {/* Chats Feed */}
        <div className="flex-1 overflow-y-auto">
          <div className="divide-y divide-zinc-100">
            {chats.map(chat => (
              <div 
                key={chat.id} 
                className={`p-4 flex gap-4 cursor-pointer hover:bg-zinc-50 transition-colors relative ${chat.selected ? 'bg-indigo-50/50' : ''}`}
              >
                {chat.selected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3b3dbf]"></div>
                )}
                
                <div className="relative shrink-0 mt-1">
                  {chat.type === 'user' ? (
                    <img src={chat.avatar} alt={chat.name} className="w-11 h-11 rounded-full object-cover" />
                  ) : (
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center ${chat.bg}`}>
                      {chat.icon}
                    </div>
                  )}
                  {chat.active && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-bold text-sm truncate text-zinc-900 pr-2">{chat.name}</h3>
                    <span className={`text-[10px] font-bold shrink-0 ${chat.selected ? 'text-[#3b3dbf]' : 'text-zinc-400'}`}>
                      {chat.time}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-semibold mb-1 truncate">{chat.role}</p>
                  <p className="text-xs text-zinc-600 font-medium truncate">{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Active Chat */}
      <div className="flex-1 flex flex-col hidden md:flex bg-zinc-50/30">
        
        {/* Chat Header */}
        <div className="h-[76px] px-6 border-b border-zinc-200 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={chats[0].avatar} alt="Sarah Mitchell" className="w-10 h-10 rounded-full object-cover" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-base text-zinc-900">Sarah Mitchell</h2>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                Active now
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-zinc-500">
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><Phone size={18} /></button>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><Video size={20} /></button>
            <div className="w-px h-6 bg-zinc-200"></div>
            <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors"><Info size={20} /></button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          <div className="flex justify-center mb-2">
            <span className="px-4 py-1 bg-zinc-100 rounded-full text-xs font-bold text-zinc-500">Monday, Oct 24th</span>
          </div>

          {/* Incoming Message */}
          <div className="flex gap-3 max-w-[85%]">
            <img src={chats[0].avatar} alt="Sarah Mitchell" className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto hidden md:block" />
            <div className="flex flex-col gap-1">
              <div className="bg-zinc-100 p-4 rounded-2xl rounded-bl-sm text-sm text-zinc-700 font-medium leading-relaxed">
                Hello Mr. Adams, I just reviewed Leo's mid-term report for History. He seems to be struggling with the essay portion. Are there any extra resources you could share?
              </div>
              <span className="text-[10px] font-bold text-zinc-400 ml-1">10:15 AM</span>
            </div>
          </div>

          {/* Outgoing Message */}
          <div className="flex gap-3 max-w-[85%] self-end">
            <div className="flex flex-col gap-1 items-end">
              <div className="bg-[#3b3dbf] p-4 rounded-2xl rounded-br-sm text-sm text-white font-medium leading-relaxed shadow-sm">
                Hello Mrs. Mitchell. I've noticed that too. Leo has great ideas but struggles with structuring them under timed conditions. I'll send over a few essay templates we use in class.
              </div>
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[10px] font-bold text-zinc-400">10:22 AM</span>
                <div className="flex">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#3b3dbf]" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Outgoing Message with Attachments */}
          <div className="flex gap-3 max-w-[85%] self-end mt-2">
            <div className="flex flex-col gap-1 items-end w-full max-w-md">
              <div className="bg-[#3b3dbf] p-4 rounded-2xl rounded-br-sm text-sm text-white font-medium leading-relaxed shadow-sm w-full">
                <p className="mb-4">Here are the files I mentioned. They include a rubric and a few sample structures.</p>
                
                <div className="flex flex-col gap-2">
                  <div className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20 p-3 rounded-xl flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 text-white">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">Essay_Template.pdf</div>
                      <div className="text-[10px] text-indigo-100 font-semibold mt-0.5">1.2 MB • PDF Document</div>
                    </div>
                    <button className="text-indigo-100 hover:text-white p-2 shrink-0">
                      <Download size={16} />
                    </button>
                  </div>
                  
                  <div className="bg-white/10 hover:bg-white/20 transition-colors border border-white/20 p-3 rounded-xl flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center shrink-0 text-white">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate">Grading_Rubric_V2.pdf</div>
                      <div className="text-[10px] text-indigo-100 font-semibold mt-0.5">850 KB • PDF Document</div>
                    </div>
                    <button className="text-indigo-100 hover:text-white p-2 shrink-0">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[10px] font-bold text-zinc-400">10:23 AM</span>
                <div className="flex">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-[#3b3dbf]" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
              </div>
            </div>
          </div>
          
          {/* New Message Typing Indicator (mock) */}
          <div className="flex gap-3 max-w-[85%] mt-4">
            <img src={chats[0].avatar} alt="Sarah Mitchell" className="w-8 h-8 rounded-full object-cover shrink-0 mt-auto hidden md:block" />
            <div className="flex flex-col gap-1">
              <div className="bg-zinc-100 py-3 px-4 rounded-2xl rounded-bl-sm flex items-center gap-1.5 w-16">
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>

        </div>

        {/* Chat Input Area */}
        <div className="p-4 px-6 border-t border-zinc-200 bg-white">
          <div className="flex items-end gap-3">
            <div className="flex items-center gap-1 text-zinc-400 pb-2">
              <button className="p-2 hover:bg-zinc-100 hover:text-zinc-600 rounded-full transition-colors">
                <Plus size={20} />
              </button>
              <button className="p-2 hover:bg-zinc-100 hover:text-zinc-600 rounded-full transition-colors">
                <Paperclip size={18} />
              </button>
              <button className="p-2 hover:bg-zinc-100 hover:text-zinc-600 rounded-full transition-colors">
                <ImageIcon size={18} />
              </button>
            </div>
            
            <div className="flex-1 relative">
              <textarea 
                placeholder="Type your message here..."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/30 focus:border-[#3b3dbf] resize-none text-sm font-medium placeholder:text-zinc-400"
                rows={1}
                style={{ minHeight: '48px' }}
              ></textarea>
              <button className="absolute right-3 bottom-3 text-zinc-400 hover:text-[#3b3dbf] transition-colors">
                <Smile size={20} />
              </button>
            </div>
            
            <button className="w-12 h-12 bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white rounded-full flex items-center justify-center transition-colors shadow-sm shrink-0">
              <Send size={18} className="ml-1" />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-3 px-2">
            <span className="text-[10px] font-bold text-zinc-400">Press Enter to send, Shift + Enter for new line</span>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400">
              <div className="w-1.5 h-1.5 rounded-full bg-[#3b3dbf]"></div>
              Draft saved 10:24 AM
            </div>
          </div>
        </div>
        
      </div>

    </div>
  );
}
