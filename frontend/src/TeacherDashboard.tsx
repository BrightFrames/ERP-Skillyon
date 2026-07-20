import {
  BookOpen,
  Users,
  GraduationCap,
  ChevronRight,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "./lib/api";

export default function TeacherDashboard() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [gradebooks, setGradebooks] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : {};
  const [profile, setProfile] = useState<any>(user);

  const name = profile.name || user.name || "Teacher";
  const subject = profile.subject || user.subject || "Your Subject";

  const greetingTime = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    const init = async () => {
      try {
        const [classRes, studentRes, profileRes] = await Promise.all([
          api.get("/academic/teacher-classes"),
          api.get("/students?page=0&limit=200"),
          api.get("/user/profile").catch(() => null),
        ]);

        const cls = classRes.data || [];
        const stu = studentRes.data.data || [];
        setClasses(cls);
        setStudents(stu);

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
          }),
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
    0,
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
    "bg-emerald-100 text-emerald-700",
    "bg-violet-100 text-violet-700",
    "bg-orange-100 text-orange-600",
    "bg-rose-100 text-rose-700",
  ];

  const isClassTeacher = Boolean(profile.is_class_teacher || user.is_class_teacher);
  const classTeacherOfName = profile.class_teacher_of_name || user.class_teacher_of_name || (isClassTeacher ? `Class #${profile.class_teacher_of || user.class_teacher_of}` : null);
  const assignedClassNames = classes.map(c => c.name).join(", ");

  return (
    <div className="flex flex-col gap-6 text-foreground pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-1">
            {greetingTime()}, {name} 👋
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Teacher Dashboard
            </h1>
            {isClassTeacher && (
              <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-[#3b3dbf] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-full text-xs font-bold shadow-sm">
                Class Teacher {classTeacherOfName ? `(${classTeacherOfName})` : ''}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm mt-1">
            Primary Subject: <span className="text-primary font-bold">{subject}</span>
          </p>
        </div>
        <Link
          to="/classes"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
        >
          <GraduationCap size={16} />
          Open Gradebook
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Class Teacher Of",
            value: isClassTeacher ? (classTeacherOfName || "Assigned") : "N/A",
            icon: Shield,
            color: "bg-indigo-50 text-[#3b3dbf]",
            sub: isClassTeacher ? "Homeroom Class" : "Subject Teacher Only",
            isTextValue: true,
          },
          {
            label: "Assigned Classes",
            value: classes.length,
            icon: BookOpen,
            color: "bg-violet-50 text-violet-600",
            sub: assignedClassNames || "Subject classes",
          },
          {
            label: "Total Students",
            value: totalStudents,
            icon: Users,
            color: "bg-teal-50 text-teal-600",
            sub: "assigned classes only",
          },
          {
            label: "Assessments",
            value: totalAssessments,
            icon: GraduationCap,
            color: "bg-rose-50 text-rose-600",
            sub: `${ungradedSlots} ungraded slots`,
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-card p-5 rounded-2xl border border-border shadow-sm flex flex-col justify-between h-32"
          >
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-bold text-muted-foreground mb-1">
                  {item.label}
                </p>
                <p className={`font-bold text-foreground truncate ${item.isTextValue ? 'text-xl md:text-2xl mt-1' : 'text-3xl'}`}>
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

      {/* My Classes Grid */}
      <div className="w-full bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base text-foreground">My Classes</h3>
          <Link
            to="/classes"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            View Gradebooks <ChevronRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-sm">
            No classes assigned to you yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                  className="group flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${bgColors[i % bgColors.length]}`}
                  >
                    {getInitials(cls.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-foreground text-sm truncate">
                      {cls.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                      {stuCount} students · {assmCount} assessments
                    </div>
                    {ungraded > 0 && (
                      <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-orange-50 text-orange-500 rounded-full text-[10px] font-bold">
                        <AlertTriangle size={10} />
                        {ungraded} ungraded
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
    </div>
  );
}
