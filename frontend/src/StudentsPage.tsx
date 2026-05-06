import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  UserPlus, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  Users,
  GraduationCap,
  X,
  Trash2,
  Eye,
  Edit2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from './lib/api';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    parent_email: '',
    class_id: '',
    gender: 'Male',
    status: 'Active',
    avatar: ''
  });
  const [totalStudents, setTotalStudents] = useState(0);
  const [metrics, setMetrics] = useState({ male: 0, female: 0, newEnrollments: 0 });
  const [currentPage, setCurrentPage] = useState(0);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const limit = 10;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        api.get(`/students?page=${currentPage}&limit=${limit}&search=${encodeURIComponent(searchQuery)}`),
        api.get('/classes')
      ]);
      setStudents(studentsRes.data.data || []);
      setTotalStudents(studentsRes.data.total || 0);
      setMetrics(studentsRes.data.metrics || { male: 0, female: 0, newEnrollments: 0 });
      setClassesList(classesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', {
        ...formData,
        class_id: formData.class_id ? parseInt(formData.class_id) : undefined
      });
      setIsModalOpen(false);
      setFormData({ name: '', email: '', parent_email: '', class_id: '', gender: 'Male', status: 'Active', avatar: '' });
      fetchStudents();
    } catch (error) {
      console.error('Failed to add student', error);
      alert('Failed to add student. Please check your inputs.');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await api.delete(`/students/${id}`);
        fetchStudents();
        setActiveMenuId(null);
      } catch (error) {
        console.error('Failed to delete student', error);
        alert('Failed to delete student.');
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col gap-6 text-zinc-900 pb-10 min-h-full">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500 mb-2">
            <span>Dashboard</span>
            <span>&gt;</span>
            <span className="text-zinc-900">Student Management</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Student Management</h1>
          <p className="text-zinc-500 font-medium">Oversee and manage the student population records and academic enrollment.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#3b3dbf] text-white rounded-lg text-sm font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          Add New Student
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        
        {/* Filters Bar */}
        <div className="p-6 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50/30">
           <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-zinc-600">Filter by:</span>
             <button className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50">
               All Grades
             </button>
             <button className="px-4 py-1.5 bg-white border border-zinc-200 rounded-full text-xs font-bold text-zinc-600 shadow-sm hover:bg-zinc-50">
               All Status
             </button>
             <button className="flex items-center gap-1.5 text-xs font-bold text-[#3b3dbf] hover:text-[#2c2eb5] ml-2">
               <Filter size={14} />
               Clear Filters
             </button>
           </div>
           <div className="text-sm font-semibold text-zinc-500">
             Showing <span className="font-bold text-zinc-800">{students.length > 0 ? currentPage * limit + 1 : 0}-{currentPage * limit + students.length}</span> of <span className="font-bold text-zinc-800">{totalStudents}</span> students
           </div>
        </div>

        {/* Table Content */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50/50 text-zinc-500 font-bold border-b border-zinc-100">
              <tr>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Student ID</th>
                <th className="px-6 py-4">Grade/Class</th>
                <th className="px-6 py-4">Gender</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 font-medium">Loading students...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500 font-medium">No students found. Add a new student to get started.</td>
                </tr>
              ) : students.map((student, index) => (
                <tr key={index} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <Link to={`/students/${student.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                      <img 
                        src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`} 
                        alt={student.name} 
                        className="w-10 h-10 rounded-full bg-zinc-200 object-cover" 
                      />
                      <div>
                        <div className="text-zinc-900 font-bold hover:text-[#3b3dbf] transition-colors">{student.name}</div>
                        <div className="text-xs text-zinc-500">{student.email || 'N/A'}</div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-zinc-500">
                    {student.id >= 1000 ? student.id : `#STU-2024-${student.id.toString().padStart(3, '0')}`}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold whitespace-nowrap">
                      {student.class_name || 'Not Assigned'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-700">{student.gender || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      student.status === 'Active' 
                        ? 'bg-indigo-50 text-[#3b3dbf]' 
                        : student.status === 'Inactive'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-zinc-100 text-zinc-600'
                    }`}>
                      {student.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center relative">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === student.id ? null : student.id); }}
                      className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 p-2 rounded-lg transition-colors inline-flex"
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenuId === student.id && (
                      <div className="absolute right-10 top-10 w-48 bg-white border border-zinc-200 rounded-xl shadow-lg z-10 py-2 overflow-hidden flex flex-col items-start text-sm">
                        <Link to={`/students/${student.id}`} className="w-full px-4 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 font-semibold transition-colors">
                          <Eye size={16} /> View Profile
                        </Link>
                        <button className="w-full px-4 py-2 text-left hover:bg-zinc-50 flex items-center gap-2 text-zinc-700 font-semibold transition-colors">
                          <Edit2 size={16} /> Edit Student
                        </button>
                        <div className="w-full h-px bg-zinc-100 my-1"></div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(student.id); }}
                          className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 font-semibold transition-colors"
                        >
                          <Trash2 size={16} /> Delete Student
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 md:px-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50/50">
          <button 
            disabled={currentPage === 0}
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white rounded-lg text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(3, Math.ceil(totalStudents / limit)) }).map((_, i) => (
              <button 
                key={i}
                onClick={() => setCurrentPage(i)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                  currentPage === i ? 'bg-[#3b3dbf] text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            {Math.ceil(totalStudents / limit) > 3 && (
              <>
                <span className="w-8 h-8 flex items-center justify-center text-zinc-400 text-sm font-bold">
                  ...
                </span>
                <button 
                  onClick={() => setCurrentPage(Math.ceil(totalStudents / limit) - 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                    currentPage === Math.ceil(totalStudents / limit) - 1 ? 'bg-[#3b3dbf] text-white shadow-sm' : 'text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  {Math.ceil(totalStudents / limit)}
                </button>
              </>
            )}
          </div>

          <button 
            disabled={currentPage >= Math.ceil(totalStudents / limit) - 1}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="flex items-center gap-1.5 px-4 py-2 border border-zinc-200 bg-white rounded-lg text-zinc-600 text-sm font-bold hover:bg-zinc-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-2">
        {/* Total Students */}
        <div className="bg-[#595cdb] p-6 rounded-2xl shadow-lg text-white flex flex-col justify-between">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Users size={20} />
            </div>
            <div className="text-xs font-semibold text-indigo-100">+12% Monthly</div>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1">{totalStudents}</p>
            <p className="text-sm font-semibold text-indigo-100">Total Students</p>
          </div>
        </div>

        {/* Male Students */}
        <div className="bg-zinc-100/80 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#3b3dbf] flex items-center justify-center mb-6">
            {/* Custom SVG for Male symbol */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="14" r="5"></circle>
              <line x1="13.5" y1="10.5" x2="21" y2="3"></line>
              <polyline points="16 3 21 3 21 8"></polyline>
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">{metrics.male}</p>
            <p className="text-sm font-semibold text-zinc-500">Male Students</p>
          </div>
        </div>

        {/* Female Students */}
        <div className="bg-zinc-100/80 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
            {/* Custom SVG for Female symbol */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="9" r="5"></circle>
              <line x1="12" y1="14" x2="12" y2="22"></line>
              <line x1="9" y1="19" x2="15" y2="19"></line>
            </svg>
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">{metrics.female}</p>
            <p className="text-sm font-semibold text-zinc-500">Female Students</p>
          </div>
        </div>

        {/* New Enrollments */}
        <div className="bg-zinc-100/80 border border-zinc-200 p-6 rounded-2xl flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-3xl font-bold text-zinc-900 mb-1">{metrics.newEnrollments}</p>
            <p className="text-sm font-semibold text-zinc-500">New Enrollments</p>
          </div>
        </div>
      </div>

      {/* Global Footer */}
      <div className="mt-auto pt-6 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-zinc-500 gap-4">
        <p>© 2024 EduCore ERP. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-zinc-800 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-zinc-800 transition-colors">Terms of Service</a>
        </div>
      </div>
      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-zinc-900">Add New Student</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Student Name *</label>
                <input 
                  required
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Student Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. student@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Parent Email</label>
                <input 
                  type="email" 
                  name="parent_email"
                  value={formData.parent_email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. parent@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Class/Grade</label>
                <select 
                  name="class_id"
                  value={formData.class_id}
                  onChange={(e: any) => handleInputChange(e)}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all bg-white"
                >
                  <option value="">Select a class...</option>
                  {classesList.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Gender</label>
                  <select 
                    name="gender"
                    value={formData.gender}
                    onChange={(e: any) => handleInputChange(e)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-zinc-700 mb-1">Status</label>
                  <select 
                    name="status"
                    value={formData.status}
                    onChange={(e: any) => handleInputChange(e)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-1">Avatar URL (Optional)</label>
                <input 
                  type="url" 
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#3b3dbf]/20 focus:border-[#3b3dbf] transition-all"
                  placeholder="e.g. https://images.unsplash.com/..."
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-zinc-200 text-zinc-700 rounded-lg font-bold hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#3b3dbf] text-white rounded-lg font-bold hover:bg-[#2c2eb5] transition-colors shadow-sm"
                >
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
