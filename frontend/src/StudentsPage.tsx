import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { UserPlus, Search, X } from 'lucide-react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Student Name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  { field: 'class_name', headerName: 'Class', width: 130 },
  { field: 'enrollment_date', headerName: 'Enrollment Date', width: 150 },
  { field: 'parent_email', headerName: 'Parent Email', width: 250 },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', class_name: '', parent_email: '' });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Mock data so the table isn't completely empty for demo purposes if backend isn't up
      setStudents([
        { id: 1, name: 'Alice Smith', email: 'alice@student.edu', class_name: 'Grade 10 - A', enrollment_date: '2024-09-01', parent_email: 'parent.alice@mail.com' },
        { id: 2, name: 'Bob Jones', email: 'bob@student.edu', class_name: 'Grade 10 - B', enrollment_date: '2024-09-02', parent_email: 'parent.bob@mail.com' }
      ]);
      setTotalRowCount(2);
      
      const response = await fetch(`http://localhost:5000/api/students?page=${paginationModel.page}&limit=${paginationModel.pageSize}`, {
        headers: {
          'Authorization': 'Bearer sample-token-here'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
        setTotalRowCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch students, using mock data fallback', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [paginationModel]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = students.length ? Math.max(...students.map(s => s.id)) + 1 : 1;
    const addedStudent = {
      id: newId,
      ...newStudent,
      enrollment_date: new Date().toISOString().split('T')[0]
    };
    
    setStudents([addedStudent, ...students]);
    setTotalRowCount(prev => prev + 1);
    setIsModalOpen(false);
    setNewStudent({ name: '', email: '', class_name: '', parent_email: '' });
  };

  return (
    <div className="flex flex-col gap-8 text-zinc-900 relative">
      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200">
              <h2 className="text-xl font-bold">Add New Student</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Student Email</label>
                <input 
                  type="email" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Class / Section</label>
                <input 
                  type="text" required placeholder="e.g. Grade 10 - A"
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newStudent.class_name} onChange={e => setNewStudent({...newStudent, class_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Parent Email</label>
                <input 
                  type="email" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newStudent.parent_email} onChange={e => setNewStudent({...newStudent, parent_email: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
          <p className="text-zinc-500 mt-2">Manage all student records, classes, and details in the ERP system.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm whitespace-nowrap">
          <UserPlus size={18} />
          Add Student
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
             <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        <div className="flex-1 min-h-[500px] w-full p-0">
          <DataGrid
            rows={students}
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
            }}
          />
        </div>
      </div>
    </div>
  );
}
