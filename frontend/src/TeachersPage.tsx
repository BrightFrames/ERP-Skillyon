import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Search, Plus, X } from 'lucide-react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Teacher Name', flex: 1, minWidth: 200 },
  { field: 'email', headerName: 'Email Address', flex: 1, minWidth: 250 },
  { field: 'subject', headerName: 'Department', width: 150 },
  { field: 'join_date', headerName: 'Join Date', width: 150 },
];

const CBSE_ICSE_SUBJECTS = [
  "Accountancy", "Art", "Biology", "Business Studies", "Chemistry", "Commerce",
  "Computer Applications", "Economics", "English Language", "English Literature", 
  "Environmental Applications", "Geography", "Hindi", "History & Civics", 
  "Information Technology", "Mathematics", "Music", "Physical Education", 
  "Physics", "Science", "Social Science", "Regional Language"
];

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subject: '' });
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  
  const filteredSubjects = CBSE_ICSE_SUBJECTS.filter(s => s.toLowerCase().includes(subjectSearch.toLowerCase()));

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let mockData = [
        { id: 1, name: 'Sarah Jenkins', email: 'sarah.j@school.edu', subject: 'Mathematics', join_date: '2024-08-15' },
        { id: 2, name: 'Michael Chen', email: 'michael.c@school.edu', subject: 'Science', join_date: '2024-08-15' },
        { id: 3, name: 'Emily Davis', email: 'emily.d@school.edu', subject: 'English', join_date: '2024-08-20' },
      ];
      setTeachers(mockData);
      setTotalRowCount(mockData.length);
      setLoading(false);
    }, 600);
  }, [paginationModel]);

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = teachers.length ? Math.max(...teachers.map(t => t.id)) + 1 : 10;
    const addedTeacher = {
      id: newId,
      ...newTeacher,
      join_date: new Date().toISOString().split('T')[0]
    };
    
    setTeachers([addedTeacher, ...teachers]);
    setTotalRowCount(prev => prev + 1);
    setIsModalOpen(false);
    setNewTeacher({ name: '', email: '', subject: '' });
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200">
              <h2 className="text-xl font-bold">Add Teacher</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newTeacher.name} onChange={e => setNewTeacher({...newTeacher, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                <input 
                  type="email" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newTeacher.email} onChange={e => setNewTeacher({...newTeacher, email: e.target.value})}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-medium text-zinc-700 mb-1">Department / Subject</label>
                <div 
                  className={`w-full px-3 py-2 border rounded-lg flex justify-between items-center cursor-pointer bg-white ${subjectDropdownOpen ? 'ring-2 ring-blue-500 border-blue-500' : 'border-zinc-300'}`}
                  onClick={() => setSubjectDropdownOpen(!subjectDropdownOpen)}
                >
                  <span className={newTeacher.subject ? 'text-zinc-900' : 'text-zinc-500'}>
                    {newTeacher.subject || 'Select a subject...'}
                  </span>
                </div>
                
                {subjectDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-zinc-100 flex gap-2">
                      <Search className="text-zinc-400 w-4 h-4 mt-1.5" />
                      <input 
                        type="text"
                        placeholder="Search subjects..."
                        className="w-full px-1 py-1 text-sm border-none focus:outline-none focus:ring-0"
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredSubjects.map(sub => (
                        <div 
                          key={sub}
                          className="px-3 py-2 text-sm cursor-pointer hover:bg-zinc-50 hover:text-blue-600 text-zinc-700 transition"
                          onClick={() => {
                            setNewTeacher({...newTeacher, subject: sub});
                            setSubjectDropdownOpen(false);
                            setSubjectSearch('');
                          }}
                        >
                          {sub}
                        </div>
                      ))}
                      {filteredSubjects.length === 0 && (
                        <div className="px-3 py-2 text-sm text-zinc-500 text-center">No subjects found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setSubjectDropdownOpen(false); setSubjectSearch(''); }} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Teachers Management</h1>
          <p className="text-zinc-500 mt-2">Manage academic staff, teachers, and their assignments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm whitespace-nowrap">
          <Plus size={18} />
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
             <input type="text" placeholder="Search teachers..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        <div className="flex-1 min-h-[500px] w-full p-0">
          <DataGrid
            rows={teachers}
            columns={columns}
            rowCount={totalRowCount}
            loading={loading}
            pageSizeOptions={[10, 25, 50]}
            paginationModel={paginationModel}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            disableRowSelectionOnClick
            sx={{
              border: 0,
              '& .MuiDataGrid-cell': { borderBottom: '1px solid #e4e4e7' },
              '& .MuiDataGrid-columnHeaders': { borderBottom: '1px solid #e4e4e7', backgroundColor: '#fafafa' },
              '& .MuiDataGrid-virtualScroller': { backgroundColor: 'transparent' },
            }}
          />
        </div>
      </div>
    </div>
  );
}