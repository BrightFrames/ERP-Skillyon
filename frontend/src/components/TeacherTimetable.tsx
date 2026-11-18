import { useState, useEffect } from "react";
import { Clock, MapPin, BookOpen, Calendar, CheckCircle2 } from "lucide-react";
import api from "../lib/api";

interface PeriodSlot {
  id: string;
  day: string;
  period: number;
  time: string;
  subject: string;
  class_name: string;
  room: string;
  is_break?: boolean;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function TeacherTimetable({ compact = false }: { compact?: boolean }) {
  const [schedule, setSchedule] = useState<PeriodSlot[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Today's day name (e.g. "Monday")
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayName = (currentDayIndex >= 1 && currentDayIndex <= 5) ? DAYS[currentDayIndex - 1] : "Monday";
  const [selectedDay, setSelectedDay] = useState<string>(todayName);

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.get("/academic/timetable");
        if (res.data && Array.isArray(res.data.timetable)) {
          setSchedule(res.data.timetable);
        }
      } catch (err) {
        console.error("Failed to fetch timetable", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const daySchedule = schedule.filter(
    (slot) => slot.day.toLowerCase() === selectedDay.toLowerCase()
  ).sort((a, b) => a.period - b.period);

  if (compact) {
    return (
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#3b3dbf] dark:text-indigo-400">
              <Clock size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Today's Schedule</h3>
              <p className="text-[11px] text-muted-foreground font-semibold">{todayName} Routine</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
            {daySchedule.length} Periods
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8 flex-1">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : daySchedule.length === 0 ? (
          <div className="text-center text-muted-foreground py-8 text-xs font-semibold flex-1 flex flex-col items-center justify-center">
            <Calendar size={28} className="text-muted-foreground/40 mb-2" />
            No scheduled periods for today.
          </div>
        ) : (
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[280px] pr-1">
            {daySchedule.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-xl border border-border/80 hover:border-primary/40 bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-black flex items-center justify-center text-[10px] shrink-0">
                    P{slot.period}
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">{slot.subject}</p>
                    <p className="text-[10px] text-muted-foreground font-semibold truncate">
                      {slot.class_name} · Room {slot.room}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-muted-foreground font-mono bg-background px-2 py-1 rounded-md border border-border">
                    {slot.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
            <Calendar className="text-primary" size={20} />
            Weekly Class Timetable & Routine
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your teaching periods, assigned classrooms, and scheduled subject timings
          </p>
        </div>

        {/* Day selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = todayName === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {day}
                {isToday && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500 animate-pulse"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : daySchedule.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Calendar size={36} className="text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm font-bold text-foreground">No Classes Scheduled</p>
          <p className="text-xs text-muted-foreground mt-1">There are no teaching periods booked for {selectedDay}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {daySchedule.map((slot) => (
            <div
              key={slot.id}
              className="p-4 rounded-xl border border-border hover:border-primary/50 bg-card hover:bg-muted/30 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-black text-xs">
                  Period {slot.period}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground font-mono bg-muted/60 px-2 py-0.5 rounded-md">
                  <Clock size={11} /> {slot.time}
                </span>
              </div>

              <div className="mb-4">
                <h4 className="font-extrabold text-foreground text-sm flex items-center gap-2 group-hover:text-primary transition-colors">
                  <BookOpen size={16} className="text-primary/70 shrink-0" />
                  {slot.subject}
                </h4>
                <p className="text-xs font-bold text-muted-foreground mt-1 pl-6">
                  {slot.class_name}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/60 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground font-semibold text-[11px]">
                  <MapPin size={13} className="text-rose-500" />
                  Room {slot.room}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 size={12} /> Scheduled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

