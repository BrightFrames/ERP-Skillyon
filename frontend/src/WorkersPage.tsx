import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Search, Plus, X } from 'lucide-react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Staff Name', flex: 1, minWidth: 200 },
  { field: 'email', headerName: 'Email Address', flex: 1, minWidth: 250 },
  { field: 'role', headerName: 'Role & Function', width: 180, 
    renderCell: (params) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
        ${params.value === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
          'bg-zinc-100 text-zinc-700'}`}>
        {params.value}
      </span>
    )
  },
  { field: 'join_date', headerName: 'Join Date', width: 150 },
];

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', email: '', role: 'STAFF' });
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let mockData = [
        { id: 1, name: 'System Admin', email: 'admin@school.erp', role: 'ADMIN', join_date: '2024-01-15' },
        { id: 4, name: 'Janice Doe', email: 'janice.d@school.edu', role: 'STAFF', join_date: '2024-09-01' },
        { id: 5, name: 'Greg House', email: 'greg.guard@school.edu', role: 'SECURITY', join_date: '2024-10-01' },
      ];
      setWorkers(mockData);
      setTotalRowCount(mockData.length);
      setLoading(false);
    }, 600);
  }, [paginationModel]);

  const handleAddWorker = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = workers.length ? Math.max(...workers.map(w => w.id)) + 1 : 10;
    const addedWorker = {
      id: newId,
      ...newWorker,
      join_date: new Date().toISOString().split('T')[0]
    };
    
    setWorkers([addedWorker, ...workers]);
    setTotalRowCount(prev => prev + 1);
    setIsModalOpen(false);
    setNewWorker({ name: '', email: '', role: 'STAFF' });
  };

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-5 border-b border-zinc-200">
              <h2 className="text-xl font-bold">Add Worker / Staff</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddWorker} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name</label>
                <input 
                  type="text" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Email Address</label>
                <input 
                  type="email" required 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Role / Domain</label>
                <select 
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={newWorker.role} onChange={e => setNewWorker({...newWorker, role: e.target.value})} required
                >
                    <option value="STAFF">General Staff</option>
                    <option value="ADMIN">Administrator</option>
                    <option value="SECURITY">Security / Janitorial</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg hover:bg-zinc-50">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Workers & Administration Staff</h1>
          <p className="text-zinc-500 mt-2">Manage non-academic staff, admins, and support workers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm whitespace-nowrap">
          <Plus size={18} />
          Add Worker Option
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
             <input type="text" placeholder="Search staff members..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        <div className="flex-1 min-h-[500px] w-full p-0">
          <DataGrid
            rows={workers}
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