import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { UserPlus, Search } from 'lucide-react';

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
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Pass pagination parameters to your API
      const response = await fetch(`http://localhost:5000/api/students?page=${paginationModel.page}&limit=${paginationModel.pageSize}`, {
        headers: {
          // Token will need to be injected correctly by your auth provider
          'Authorization': 'Bearer sample-token-here'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
        setTotalRowCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch students', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [paginationModel]);

  return (
    <div className="flex flex-col gap-8 h-full min-h-[calc(100vh-12rem)] text-zinc-900 dark:text-zinc-50">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
          <p className="text-zinc-500 mt-2">Manage all student records, classes, and details in the ERP system.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm">
          <UserPlus size={18} />
          Add Student
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
             <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
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
