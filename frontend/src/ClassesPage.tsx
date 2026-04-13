import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Search, Plus } from 'lucide-react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'name', headerName: 'Class Name', flex: 1, minWidth: 200 },
  { field: 'teacher_name', headerName: 'Homeroom Teacher', flex: 1, minWidth: 250 },
  { field: 'student_count', headerName: 'Enrolled Students', width: 150 },
  { field: 'created_at', headerName: 'Created On', width: 200 },
];

export default function ClassesPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setClasses([
        { id: 1, name: 'Grade 10 - A', teacher_name: 'Sarah Jenkins', student_count: 28, created_at: '2024-08-01' },
        { id: 2, name: 'Grade 10 - B', teacher_name: 'Michael Chen', student_count: 32, created_at: '2024-08-01' },
      ]);
      setTotalRowCount(2);
      setLoading(false);
    }, 400);
  }, [paginationModel]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Classes & Sections</h1>
          <p className="text-zinc-500 mt-2">Manage grades, classrooms, and homeroom teachers.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm font-medium text-sm whitespace-nowrap">
          <Plus size={18} />
          New Class
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-200 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
             <input type="text" placeholder="Search classes..." className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        <div className="flex-1 min-h-[500px] w-full p-0">
          <DataGrid
            rows={classes}
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