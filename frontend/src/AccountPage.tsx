import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { User, Mail, Shield, BookOpen } from 'lucide-react';

// Column definition remains static for the DataGrid
const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 90 },
  { field: 'date', headerName: 'Date', width: 150 },
  { field: 'activity', headerName: 'Activity', width: 300 },
  { field: 'status', headerName: 'Status', width: 130 },
];

export default function AccountPage() {
  // Authentication & Profile State
  const [profile, setProfile] = useState<{ name: string; email: string; role: string; className: string; subject: string; joinDate: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // MUI DataGrid Server-Side Pagination State
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 5,
  });

  // Simulated Effect: Fetch User Profile Securely
  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        // Example securely authenticated call (requires Bearer token in headers or httpOnly cookies)
        // const token = localStorage.getItem('token');
        // const res = await fetch('/api/user/profile', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const data = await res.json();
        
        // Mock Response data
        const mockData = {
          name: "Sarah Jenkins",
          email: "sarah.j@school.edu",
          role: "Teacher",
          className: "Grade 10 - Section B",
          subject: "Mathematics & History",
          joinDate: "Aug 15, 2024"
        };
        // Simulating network delay
        setTimeout(() => {
          setProfile(mockData);
          setProfileLoading(false);
        }, 600);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Simulated Effect: Fetch Server-Side Paginated Data for DataGrid
  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        // MOCK: Replace with actual backend API fetching paginated data from PostgreSQL
        // const { page, pageSize } = paginationModel;
        // const res = await fetch(`/api/user/activities?page=${page}&limit=${pageSize}`, { ... });
        // const { data, totalCount } = await res.json();
        
        // Simulating Database response based on page
        setTimeout(() => {
          const fakeDatabase = [
            { id: 1, date: '2026-04-10', activity: 'Updated History Lesson Plan', status: 'Completed' },
            { id: 2, date: '2026-04-09', activity: 'Graded Midterm Exams', status: 'Pending' },
            { id: 3, date: '2026-04-08', activity: 'Parent-Teacher Conference', status: 'Scheduled' },
            { id: 4, date: '2026-04-07', activity: 'Uploaded Math Worksheet', status: 'Completed' },
            { id: 5, date: '2026-04-06', activity: 'Attended Staff Meeting', status: 'Completed' },
            { id: 6, date: '2026-04-05', activity: 'Submitted Term 1 Grades', status: 'Completed' },
            { id: 7, date: '2026-04-04', activity: 'Updated Attendance Record', status: 'Completed' },
          ];

          // Server-side slice mock
          const start = paginationModel.page * paginationModel.pageSize;
          const end = start + paginationModel.pageSize;
          const paginatedData = fakeDatabase.slice(start, end);

          setActivities(paginatedData);
          setTotalRows(fakeDatabase.length);
          setActivitiesLoading(false);
        }, 500);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [paginationModel.page, paginationModel.pageSize]);

  if (profileLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="text-neutral-500 font-medium">Loading secure profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900">My Account</h1>
            <p className="text-neutral-500 mt-2">Manage your School ERP profile and view recent activities.</p>
          </div>
        </div>

        {/* Profile Stats / Cards (Shadcn UI style layout) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Full Name</p>
              <h3 className="text-lg font-bold text-neutral-900">{profile?.name}</h3>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">Email Address</p>
              <h3 className="text-lg font-bold text-neutral-900">{profile?.email}</h3>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-500">System Role</p>
              <h3 className="text-lg font-bold text-neutral-900">{profile?.role}</h3>
            </div>
          </div>
        </div>

        {/* Details and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 border bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-neutral-500" />
              Class Information
            </h2>
            <div className="pt-4 space-y-4">
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Primary Class</span>
                <span className="font-medium">{profile?.className}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Subject</span>
                <span className="font-medium">{profile?.subject}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-neutral-500">Join Date</span>
                <span className="font-medium">{profile?.joinDate}</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-neutral-900 text-white py-2 rounded-md font-medium hover:bg-neutral-800 transition-colors">
              Edit Profile
            </button>
          </div>

          {/* Right Column - DataGrid (MUI) */}
          <div className="lg:col-span-2 border bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Recent Activities</h2>
              <p className="text-sm text-neutral-500 mt-1">A log of your latest actions in the School ERP system.</p>
            </div>
            <div className="flex-1 p-6" style={{ height: 400 }}>
              <DataGrid
                rows={activities}
                columns={columns}
                rowCount={totalRows}
                loading={activitiesLoading}
                pageSizeOptions={[5, 10]}
                paginationModel={paginationModel}
                paginationMode="server"
                onPaginationModelChange={setPaginationModel}
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                  border: 0,
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: '#f9fafb',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
