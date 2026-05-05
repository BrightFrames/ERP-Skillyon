import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './lib/api';
import { 
  GraduationCap, 
  ShieldCheck, 
  Shield, 
  User, 
  Briefcase, 
  AtSign, 
  Lock 
} from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@educore.edu');
  const [password, setPassword] = useState('demo-password');
  const [role, setRole] = useState<'admin' | 'teacher' | 'staff'>('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Auto-fill dummy credentials when role changes
  useEffect(() => {
    if (role === 'admin') setEmail('admin@educore.edu');
    if (role === 'teacher') setEmail('teacher@educore.edu');
    if (role === 'staff') setEmail('staff@educore.edu');
    setPassword('demo-password');
  }, [role]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/user/login', { email });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 min-h-[600px]">
        
        {/* Left Panel - Branding */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#3b3dbf] to-[#2c2eb5] text-white p-12 flex-col justify-between relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black opacity-10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="bg-white p-2 rounded-lg text-[#3b3dbf]">
                <GraduationCap size={28} strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">EduCore ERP</h1>
            </div>

            <h2 className="text-4xl font-bold leading-tight mb-6 mt-8">
              Empowering the next<br/>generation of learners.
            </h2>
            <p className="text-blue-100 text-lg max-w-md leading-relaxed">
              Manage academic records, administrative tasks, and communication in one unified corporate portal.
            </p>
          </div>

          <div className="relative z-10 mt-16">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <ShieldCheck className="text-blue-200" size={24} />
              <div>
                <p className="text-sm font-semibold">Secure Access Portal</p>
                <p className="text-xs text-blue-200">ISO 27001 Certified Academic Management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-zinc-900 mb-2">Welcome Back</h2>
            <p className="text-zinc-500">Please select your role and enter credentials</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  role === 'admin' 
                    ? 'border-[#3b3dbf] bg-blue-50 text-[#3b3dbf]' 
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Shield size={20} className="mb-2" />
                <span className="text-sm font-semibold">Admin</span>
              </button>
              
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  role === 'teacher' 
                    ? 'border-[#3b3dbf] bg-blue-50 text-[#3b3dbf]' 
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <User size={20} className="mb-2" />
                <span className="text-sm font-semibold">Teacher</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('staff')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                  role === 'staff' 
                    ? 'border-[#3b3dbf] bg-blue-50 text-[#3b3dbf]' 
                    : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'
                }`}
              >
                <Briefcase size={20} className="mb-2" />
                <span className="text-sm font-semibold">Staff</span>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1.5">Username or Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <AtSign size={18} className="text-zinc-400" />
                  </div>
                  <input 
                    type="email" 
                    required
                    placeholder={role === 'admin' ? "@admin.office@educore.edu" : "Enter your email"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-zinc-700">Password</label>
                  <a href="#" className="text-sm font-semibold text-[#3b3dbf] hover:text-[#2c2eb5]">Forgot Password?</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={18} className="text-zinc-400" />
                  </div>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all tracking-widest"
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 rounded border-zinc-300 text-[#3b3dbf] focus:ring-[#3b3dbf]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-zinc-600">
                  Keep me logged in for 30 days
                </label>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white font-semibold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500">
            Problems logging in? <a href="#" className="text-[#3b3dbf] hover:underline">Contact Support Center</a>
          </div>
        </div>
      </div>
      
      {/* Global Footer */}
      <div className="mt-12 text-xs text-zinc-400 text-center pb-4">
        © 2024 EduCore ERP Solutions. All Rights Reserved. Authorized personnel only.
      </div>
    </div>
  );
}
 