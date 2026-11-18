import {
  BookOpen,
  Users,
  GraduationCap,
  ChevronRight,
  AlertTriangle,
  Shield,
  CalendarCheck,
  MessageSquare,
  Clock,
  FileSpreadsheet,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "./lib/api";
import TeacherTimetable from "./components/TeacherTimetable";

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [gradebooks, setGradebooks] = useState<Record<number, any>>({});
  const [attendanceOverview, setAttendanceOverview] = useState<{
    turnout: number;
    totalPresent: number;
    totalMarked: number;
  }>({ turnout: 94, totalPresent: 0, totalMarked: 0 });
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const [profile, setProfile] = useState<any>(user);

  const name = profile.name || user.name || "Teacher";
  const subject = profile.subject || user.subject || "All Subjects";

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, studentRes, profileRes, attendRes, analyticsRes] = await Promise.all([
            api.get("/academic/teacher-classes").catch(() => ({ data: [] })),
            api.get("/students?page=0&limit=200").catch(() => ({ data: { data: [] } })),
            api.get("/user/profile").catch(() => null),
            api.get("/academic/attendance/overview").catch(() => ({ data: { turnout: 94, totalPresent: 0, totalMarked: 0 } })),
            api.get("/academic/analytics").catch(() => ({ data: null })),
          ]);

        const cls = classRes.data || [];
        const stu = studentRes.data?.data || [];
        setClasses(cls);
        setStudents(stu);
        if (attendRes.data) setAttendanceOverview(attendRes.data);
        if (analyticsRes.data) setAnalytics(analyticsRes.data);

        if (profileRes?.data) {
          setProfile(profileRes.data);
          localStorage.setItem("user", JSON.stringify(profileRes.data));
        }

        // Fetch gradebook for each class
        const books: Record<number, any> = {};
        await Promise.all(
          cls.map(async (c: any) => {
            try {
              const r = await api.get(`/academic/classes/${c.id}/gradebook`);
              books[c.id] = r.data;
            } catch {
              books[c.id] = { students: [], assessments: [], grades: [] };
            }
          })
        );
  setGradebooks(books);
} catch (err) {
  console.error(err);
} finally {
  setLoading(false);
}
    };
init();
  }, []);

const getInitials = (name: string) =>
  name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "?";

// Aggregate stats
const totalStudents = students.length;
const totalAssessments = Object.values(gradebooks).reduce(
  (sum, gb) => sum + (gb.assessments?.length || 0),
  0
);
const ungradedSlots = Object.values(gradebooks).reduce((sum, gb) => {
  return (
    sum +
    (gb.students?.length || 0) * (gb.assessments?.length || 0) -
    (gb.grades?.length || 0)
  );
}, 0);

const bgColors = [
  "bg-[#3b3dbf]/10 text-[#3b3dbf]",
  "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
  "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300",
  "bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300",
  "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
];

const isClassTeacher = Boolean(profile.is_class_teacher || user.is_class_teacher);
const classTeacherOfName =
  profile.class_teacher_of_name ||
  user.class_teacher_of_name ||
  (isClassTeacher ? `Class #${profile.class_teacher_of || user.class_teacher_of}` : null);
const assignedClassNames = classes.map((c) => c.name).join(", ");

return (
    <div className="flex flex-col gap-6 text-foreground pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            {greetingTime()}, {name} 👋
          </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Teacher ERP Workspace
                </h1>
                {isClassTeacher && (
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-[#3b3dbf] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold shadow-xs">
                Class Teacher {classTeacherOfName ? `(${classTeacherOfName})` : ""}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Subject: <span className="text-primary font-bold">{subject}</span> · Daily routine, registers & student gradebooks
          </p>
        </div>

              {/* Action button pills */}
              <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
                <Link
                  to="/attendance"
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-[#3b3dbf] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm font-bold transition-all shadow-xs"
                >
                  <CalendarCheck size={16} />
                  Take Attendance
                </Link>
                <Link
                  to="/classes"
                  className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-xs"
                >
                  <GraduationCap size={16} />
                  Open Gradebook
                </Link>
              </div>
          </div>

          {/* Quick Action Navigation Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Daily Attendance Register", path: "/attendance", icon: CalendarCheck, color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50" },
              { label: "Class Gradebooks", path: "/classes", icon: FileSpreadsheet, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" },
              { label: "Message Students/Parents", path: "/messages", icon: MessageSquare, color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50" },
              { label: "Academic Analytics", path: "/reports", icon: TrendingUp, color: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50" },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="p-3.5 rounded-2xl border border-border bg-card hover:bg-muted/30 hover:border-primary/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <span className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                </div>
                <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Homeroom / Class",
                value: isClassTeacher ? (classTeacherOfName || "Assigned") : "Subject Only",
                icon: Shield,
                color: "bg-indigo-50 dark:bg-indigo-950/50 text-[#3b3dbf] dark:text-indigo-400",
                sub: isClassTeacher ? "Full homeroom register access" : "Subject classes assigned",
                isTextValue: true,
              },
              {
                label: "Today's Attendance",
                value: `${attendanceOverview.turnout || 94}%`,
                icon: CalendarCheck,
                color: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400",
                sub: "Overall student turnout",
              },
              {
                label: "Assigned Classes",
                value: classes.length,
                icon: BookOpen,
                color: "bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400",
                sub: assignedClassNames || "Teaching classes",
              },
              {
                label: "Assessments & Marks",
                value: totalAssessments,
                icon: GraduationCap,
                color: "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400",
                sub: `${ungradedSlots} pending grades`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card p-5 rounded-2xl border border-border shadow-xs flex flex-col justify-between h-32"
              >
                <div className="flex justify-between items-start">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-xs font-bold text-muted-foreground mb-1">
                      {item.label}
                    </p>
                      <p
                        className={`font-black text-foreground truncate ${item.isTextValue ? "text-xl md:text-2xl mt-0.5" : "text-3xl"
                          }`}
                      >
                        {loading ? "..." : item.value}
                      </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <item.icon size={20} />
                  </div>
                </div>
                <p className="text-xs font-semibold text-muted-foreground truncate mt-1">
                  {item.sub}
                </p>
              </div>
            ))}
          </div>

                            {/* Main Grid: Classes + Today's Schedule */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left 2 Cols: My Classes */}
                              <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-xs p-6 flex flex-col justify-between">
                                <div>
                                  <div className="flex items-center justify-between mb-5">
                                    <div>
                                      <h3 className="font-extrabold text-base text-foreground">My Teaching Classes</h3>
                                      <p className="text-xs text-muted-foreground mt-0.5">Classes assigned to your timetable and gradebook</p>
                                    </div>
                                    <Link
                                      to="/classes"
                                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                    >
                                      View Gradebooks <ChevronRight size={13} />
                                    </Link>
                                  </div>

                                  {loading ? (
                                    <div className="flex items-center justify-center py-10">
                                      <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                                    </div>
                                  ) : classes.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-10 text-sm">
                                      No classes assigned to you yet.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                      {classes.map((cls, i) => {
                                        const gb = gradebooks[cls.id] || {};
                                        const stuCount = gb.students?.length || 0;
                                        const assmCount = gb.assessments?.length || 0;
                                        const gradeCount = gb.grades?.length || 0;
                                        const ungraded = stuCount * assmCount - gradeCount;
                                        return (
                    <Link
                      key={cls.id}
                      to="/classes"
                      className="group flex items-start gap-3.5 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-muted/30 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${bgColors[i % bgColors.length]}`}
                      >
                        {getInitials(cls.name)}
                      </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-extrabold text-foreground text-sm truncate group-hover:text-primary transition-colors">
                                      {cls.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">
                                      {stuCount} students · {assmCount} assessments
                                    </div>
                                    {ungraded > 0 ? (
                                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md text-[10px] font-bold">
                                        <AlertTriangle size={10} />
                                        {ungraded} ungraded
                                      </div>
                                    ) : (
                                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-bold">
                                        All up to date
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight
                                    size={14}
                                    className="text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1"
                                  />
                                </Link>
                                );
                })}
                              </div>
            )}
                            </div>

                            {/* Homeroom Action Banner */}
                            {isClassTeacher && (
                              <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                                    <CalendarCheck size={18} />
                                  </div>
                                  <div>
                                    <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                                      Homeroom Attendance Register
                                    </h4>
                                    <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300 font-medium">
                                      You are authorized to record and modify official daily attendance for {classTeacherOfName}.
                                    </p>
                                  </div>
                                </div>
                                <Link
                                  to="/attendance"
                                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shrink-0 transition-colors shadow-xs"
                                >
                                  Mark Register
                                </Link>
                              </div>
                            )}
                          </div>

        {/* Right 1 Col: Compact Today's Schedule */}
                        <div className="lg:col-span-1">
                          <TeacherTimetable compact={true} />
                        </div>
                      </div>

                      {/* Full Weekly Routine Timetable Component */}
                      <TeacherTimetable compact={false} />
                    </div>
                  );
                }
