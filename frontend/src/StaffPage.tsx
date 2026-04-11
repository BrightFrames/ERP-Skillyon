import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Briefcase, Search, Plus } from 'lucide-react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Staff Name', flex: 1, minWidth: 200 },
  { field: 'email', headerName: 'Email Address', flex: 1, minWidth: 250 },
  { field: 'role', headerName: 'Role', width: 150, 
    renderCell: (params) => (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
        ${params.value === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
          params.value === 'TEACHER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
          'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'}`}>
        {params.value}
      </span>
    )
  },
  { field: 'join_date', headerName: 'Join Date', width: 150 },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  // Mock initial fetch for staff data based on our schema
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStaff([
        { id: 1, name: 'System Admin', email: 'admin@school.erp', role: 'ADMIN', join_date: '2024-01-15' },
        { id: 2, name: 'Sarah Jenkins', email: 'sarah.j@school.edu', role: 'TEACHER', join_date: '2024-08-15' },
        { id: 3, name: 'Michael Chen', email: 'michael.c@school.edu', role: 'TEACHER', join_date: '2024-08-15' },
        { id: 4, name: 'Janice Doe', email: 'janice.d@school.edu', role: 'STAFF', join_date: '2024-09-01' },
      ]);
      setTotalRowCount(4);
      setLoading(false);
    }, 600);
  }, [paginationModel]);

  return (
    <div className="flex flex-col gap-8 h-full min-h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Staff & Teachers</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage employee records and role-based permissions.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm">
          <Plus size={18} />
          Add Staff Member
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
             <input type="text" placeholder="Search by name, email or role..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        <div className="flex-1 min-h-[500px] w-full p-0">
          <DataGrid
            rows={staff}
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
