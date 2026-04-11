const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { User, Mail, Shield, BookOpen } from 'lucide-react';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'date', headerName: 'Date', width: 150 },
  { field: 'activity', headerName: 'Activity', width: 300 },
  { field: 'status', headerName: 'Status', width: 130,
    renderCell: (params) => (
      <span className={\`px-2 py-1 rounded-full text-xs font-semibold
        \${params.value === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}\`}>
        {params.value}
      </span>
    )
  },
];

export default function AccountPage() {
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      setTimeout(() => {
        setProfile({
          name: "Sarah Jenkins",
          email: "sarah.j@school.edu",
          role: "System Admin"
        });
        setProfileLoading(false);
      }, 600);
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      setTimeout(() => {
        const fakeDatabase = [
          { id: 1, date: '2026-04-10', activity: 'Generated Fee Slips for Grade 12', status: 'Completed' },
          { id: 2, date: '2026-04-09', activity: 'Reviewed Admission Requests', status: 'Pending' },
          { id: 3, date: '2026-04-08', activity: 'Created New Event Schedule', status: 'Pending' },
          { id: 4, date: '2026-04-07', activity: 'Updated Database Records', status: 'Completed' },
          { id: 5, date: '2026-04-06', activity: 'Attended Staff Meeting', status: 'Completed' }
        ];
        const start = paginationModel.page * paginationModel.pageSize;
        const end = start + paginationModel.pageSize;
        setActivities(fakeDatabase.slice(start, end));
        setTotalRows(fakeDatabase.length);
        setActivitiesLoading(false);
      }, 500);
    };
    fetchActivities();
  }, [paginationModel.page, paginationModel.pageSize]);

  if (profileLoading) {
    return <div className="flex h-full min-h-[400px] items-center justify-center"><p className="text-zinc-500 font-medium">Loading secure profile...</p></div>;
  }

  return (
    <div className="flex flex-col gap-8 h-full min-h-[400px] text-zinc-900 dark:text-zinc-50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Welcome back, {profile?.name || 'System Admin'}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Students</p>
             <p className="text-2xl font-bold">1,248</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Shield size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Staff Members</p>
             <p className="text-2xl font-bold">84</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <BookOpen size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Active Classes</p>
             <p className="text-2xl font-bold">42</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Mail size={24} />
          </div>
          <div>
             <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Unread Messages</p>
             <p className="text-2xl font-bold">12</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
           <h3 className="font-bold text-lg">Recent User Activities</h3>
        </div>
        <div className="flex-1 min-h-[400px] w-full p-0">
          <DataGrid
            rows={activities}
            columns={columns}
            loading={activitiesLoading}
            pageSizeOptions={[5, 10]}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            paginationMode="server"
            rowCount={totalRows}
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
\`;

fs.writeFileSync('src/AccountPage.tsx', content);
console.log("Written successfully");
