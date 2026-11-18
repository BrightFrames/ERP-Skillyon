import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Save,
  Users,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import api from './lib/api';

interface StudentAttendanceRecord {
  student_id: number;
  student_name: string;
  father_name?: string;
  email?: string;
  avatar?: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

export default function AttendancePage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Teacher's Assigned Classes
  useEffect(() => {
    const fetchTeacherClasses = async () => {
      try {
        const res = await api.get('/academic/teacher-classes');
        const list = Array.isArray(res.data) ? res.data : [];
        setClasses(list);
        if (list.length > 0) {
          setSelectedClassId(list[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch classes:', err);
        setErrorMessage('Failed to load classes.');
        setLoading(false);
      }
    };
    fetchTeacherClasses();
  }, []);

  // 2. Fetch Attendance for Selected Class and Date
  const fetchAttendance = async () => {
    if (!selectedClassId) return;
    setLoading(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      const res = await api.get(`/academic/classes/${selectedClassId}/attendance`, {
        params: { date },
      });
      const students = res.data.students || [];
      const formatted: StudentAttendanceRecord[] = students.map((s: any) => ({
        student_id: s.student_id,
        student_name: s.student_name,
        father_name: s.father_name,
        email: s.email,
        avatar: s.avatar,
        status: s.status || 'Present',
        remarks: s.remarks || '',
      }));
      setRecords(formatted);
    } catch (err: any) {
      console.error('Failed to load attendance:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClassId) {
      fetchAttendance();
    }
  }, [selectedClassId, date]);

  // Update a single student's status
  const updateStatus = (studentId: number, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, status } : r))
    );
  };

  // Update remarks
  const updateRemarks = (studentId: number, remarks: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.student_id === studentId ? { ...r, remarks } : r))
    );
  };

  // Bulk status updates
  const markAll = (status: 'Present' | 'Absent') => {
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  // Save Attendance to Backend
  const handleSave = async () => {
    if (!selectedClassId || records.length === 0) return;
    setSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      await api.post(`/academic/classes/${selectedClassId}/attendance`, {
        date,
        records: records.map((r) => ({
          student_id: r.student_id,
          status: r.status,
          remarks: r.remarks,
        })),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save attendance:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Stats calculation
  const total = records.length;
  const presentCount = records.filter((r) => r.status === 'Present').length;
  const absentCount = records.filter((r) => r.status === 'Absent').length;
  const lateCount = records.filter((r) => r.status === 'Late').length;
  const excusedCount = records.filter((r) => r.status === 'Excused').length;
  const attendanceRate = total > 0 ? Math.round((presentCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 text-foreground pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground mb-1">
            <span>Teacher Portal</span>
            <span>&gt;</span>
            <span className="text-foreground">Attendance Register</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Daily Attendance Register
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mark, track, and synchronize class presence with student and parent portals
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving || loading || records.length === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 ${
              saveSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving…
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
                Attendance Saved!
              </>
            ) : (
              <>
                <Save size={16} />
                Save Register
              </>
            )}
          </button>
        </div>
      </div>

      {/* Class Selector & Date Bar */}
      <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Selector */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Select Class
            </label>
            <select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Attendance Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-background border border-border text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Quick Bulk Actions */}
        <div className="flex items-center gap-2 pt-2 md:pt-0">
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('Absent')}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <p className="text-[11px] font-semibold text-muted-foreground">Class Strength</p>
          <p className="text-xl font-black text-foreground mt-0.5">{total}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Present</p>
          <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{presentCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">Absent</p>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-0.5">{absentCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Late / Excused</p>
          <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
            {lateCount + excusedCount}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border shadow-xs col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">Turnout Rate</p>
          <p className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
            {attendanceRate}%
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle size={16} />
          {errorMessage}
        </div>
      )}

      {/* Student List Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-muted-foreground">Loading student register…</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-foreground">No students enrolled in this class</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Select a different class from above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Roll / Student</th>
                  <th className="px-6 py-3.5">Parent / Contact</th>
                  <th className="px-6 py-3.5 text-center">Attendance Status</th>
                  <th className="px-6 py-3.5">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((r, index) => (
                  <tr key={r.student_id} className="hover:bg-muted/30 transition-colors">
                    {/* Student Info */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-muted-foreground w-5 text-right">
                          {index + 1}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {r.student_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-foreground text-xs">{r.student_name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            ID: STD-{r.student_id.toString().padStart(4, '0')}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-3.5 text-muted-foreground">
                      <p className="font-medium text-foreground text-xs">{r.father_name || 'Guardian'}</p>
                      <p className="text-[10px] text-muted-foreground">{r.email || '—'}</p>
                    </td>

                    {/* Status Toggles */}
                    <td className="px-6 py-3.5 text-center">
                      <div className="inline-flex items-center p-1 rounded-xl bg-muted/60 border border-border gap-1">
                        {(['Present', 'Absent', 'Late', 'Excused'] as const).map((st) => {
                          const isSelected = r.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => updateStatus(r.student_id, st)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                isSelected
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : st === 'Late'
                                    ? 'bg-amber-600 text-white shadow-xs'
                                    : 'bg-purple-600 text-white shadow-xs'
                                  : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>

                    {/* Remarks Input */}
                    <td className="px-6 py-3.5">
                      <input
                        type="text"
                        value={r.remarks || ''}
                        onChange={(e) => updateRemarks(r.student_id, e.target.value)}
                        placeholder="Add note (optional)…"
                        className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {records.length > 0 && (
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {presentCount} of {total} students present on {new Date(date).toLocaleDateString()}
            </span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg shadow-xs hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

