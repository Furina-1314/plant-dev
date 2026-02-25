import { useState, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import { ChevronLeft, ChevronRight, Clock, Target, X, BookText } from "lucide-react";

interface CalendarViewProps {
  onClose: () => void;
}

export default function CalendarView({ onClose }: CalendarViewProps) {
  const { state, dispatch } = useGame();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const calendarDays = useMemo(() => {
    const days = [] as Array<null | { day: number; date: string; minutes: number; sessions: number }>;
    for (let i = 0; i < startDayOfWeek; i++) days.push(null);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const heatmapData = state.heatmapData.find((d) => d.date === dateStr);
      days.push({ day, date: dateStr, minutes: heatmapData?.minutes || 0, sessions: heatmapData?.sessions || 0 });
    }
    return days;
  }, [year, month, daysInMonth, startDayOfWeek, state.heatmapData]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100";
    if (minutes < 30) return "bg-emerald-200";
    if (minutes < 60) return "bg-emerald-300";
    if (minutes < 120) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  const monthStats = useMemo(() => {
    const days = calendarDays.filter((d) => d !== null) as { minutes: number; sessions: number }[];
    return {
      totalMinutes: days.reduce((sum, d) => sum + d.minutes, 0),
      totalSessions: days.reduce((sum, d) => sum + d.sessions, 0),
      activeDays: days.filter((d) => d.minutes > 0).length,
    };
  }, [calendarDays]);

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-800">专注日历</h2>
            <p className="text-sm text-gray-500">{currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"><ChevronLeft size={20} /></button>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"><ChevronRight size={20} /></button>
            <button onClick={onClose} className="ml-2 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"><X size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 shrink-0">
          <div className="text-center"><div className="flex items-center justify-center gap-1 text-emerald-600 mb-1"><Clock size={14} /><span className="text-lg font-bold">{monthStats.totalMinutes}</span></div><div className="text-[10px] text-gray-500">本月专注分钟</div></div>
          <div className="text-center"><div className="flex items-center justify-center gap-1 text-amber-600 mb-1"><Target size={14} /><span className="text-lg font-bold">{monthStats.totalSessions}</span></div><div className="text-[10px] text-gray-500">完成番茄数</div></div>
          <div className="text-center"><div className="flex items-center justify-center gap-1 text-blue-600 mb-1"><span className="text-lg font-bold">{monthStats.activeDays}</span></div><div className="text-[10px] text-gray-500">活跃天数</div></div>
        </div>

        <div className="grid md:grid-cols-[1.3fr_1fr] gap-0 min-h-0 flex-1">
          <div className="p-5 border-r border-gray-100 overflow-y-auto">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((dayData, index) => (
                <div key={index} className="aspect-square">
                  {dayData ? (
                    <button
                      onClick={() => setSelectedDate(dayData.date)}
                      className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-sm transition-all hover:scale-105 ${getIntensity(dayData.minutes)} ${dayData.minutes > 0 ? "text-white font-medium" : "text-gray-700"} ${dayData.date === todayStr ? "ring-2 ring-indigo-400" : ""} ${selectedDate === dayData.date ? "ring-2 ring-emerald-500" : ""}`}
                      title={dayData.minutes > 0 ? `${dayData.date}: ${dayData.minutes}分钟, ${dayData.sessions}个番茄` : dayData.date}
                    >
                      <span>{dayData.day}</span>
                      {dayData.sessions > 0 && <span className="text-[9px] opacity-80">{dayData.sessions}🍅</span>}
                    </button>
                  ) : <div className="w-full h-full" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 shrink-0">
              <BookText size={16} className="text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-800">日历日记</h3>
            </div>
            <p className="text-xs text-gray-500 mb-2 shrink-0">{selectedDate}</p>
            <textarea
              value={state.diaryEntries[selectedDate] || ""}
              onChange={(e) => dispatch({ type: "SET_DIARY_ENTRY", payload: { date: selectedDate, content: e.target.value } })}
              placeholder="点击左侧日期后，在这里记录当日内容..."
              className="flex-1 min-h-[220px] w-full bg-gray-50 rounded-xl p-3 text-sm resize-none border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
