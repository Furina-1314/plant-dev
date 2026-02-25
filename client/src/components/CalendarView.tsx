import { useState, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import { ChevronLeft, ChevronRight, Clock, Target, X } from "lucide-react";

interface CalendarViewProps {
  onClose: () => void;
}

export default function CalendarView({ onClose }: CalendarViewProps) {
  const { state } = useGame();
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取当前月份的数据
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 获取月份第一天和最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

  // 生成日历数据
  const calendarDays = useMemo(() => {
    const days = [];
    
    // 填充月初空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 填充日期
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const heatmapData = state.heatmapData.find(d => d.date === dateStr);
      
      days.push({
        day,
        date: dateStr,
        minutes: heatmapData?.minutes || 0,
        sessions: heatmapData?.sessions || 0,
      });
    }
    
    return days;
  }, [year, month, daysInMonth, startDayOfWeek, state.heatmapData]);

  // 导航
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // 获取颜色强度
  const getIntensity = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100";
    if (minutes < 30) return "bg-emerald-200";
    if (minutes < 60) return "bg-emerald-300";
    if (minutes < 120) return "bg-emerald-400";
    return "bg-emerald-500";
  };

  // 计算本月统计
  const monthStats = useMemo(() => {
    const days = calendarDays.filter(d => d !== null) as { minutes: number; sessions: number }[];
    const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
    const totalSessions = days.reduce((sum, d) => sum + d.sessions, 0);
    const activeDays = days.filter(d => d.minutes > 0).length;
    return { totalMinutes, totalSessions, activeDays };
  }, [calendarDays]);

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">专注日历</h2>
            <p className="text-sm text-gray-500">
              {currentDate.toLocaleDateString("zh-CN", { year: "numeric", month: "long" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <ChevronRight size={20} />
            </button>
            <button onClick={onClose} className="ml-2 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-4 p-5 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
              <Clock size={14} />
              <span className="text-lg font-bold">{monthStats.totalMinutes}</span>
            </div>
            <div className="text-[10px] text-gray-500">本月专注分钟</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
              <Target size={14} />
              <span className="text-lg font-bold">{monthStats.totalSessions}</span>
            </div>
            <div className="text-[10px] text-gray-500">完成番茄数</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <span className="text-lg font-bold">{monthStats.activeDays}</span>
            </div>
            <div className="text-[10px] text-gray-500">活跃天数</div>
          </div>
        </div>

        {/* 日历网格 */}
        <div className="p-5">
          {/* 星期标题 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* 日期网格 */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((dayData, index) => (
              <div key={index} className="aspect-square">
                {dayData ? (
                  <div
                    className={`w-full h-full rounded-xl flex flex-col items-center justify-center text-sm transition-all hover:scale-105 cursor-pointer ${getIntensity(dayData.minutes)} ${dayData.minutes > 0 ? "text-white font-medium" : "text-gray-700"}`}
                    title={dayData.minutes > 0 ? `${dayData.date}: ${dayData.minutes}分钟, ${dayData.sessions}个番茄` : dayData.date}
                  >
                    <span>{dayData.day}</span>
                    {dayData.sessions > 0 && (
                      <span className="text-[8px] opacity-80">{dayData.sessions}🍅</span>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 图例 */}
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>专注强度</span>
            <div className="flex items-center gap-2">
              <span>少</span>
              <div className="flex gap-1">
                <div className="w-4 h-4 rounded bg-gray-100" />
                <div className="w-4 h-4 rounded bg-emerald-200" />
                <div className="w-4 h-4 rounded bg-emerald-300" />
                <div className="w-4 h-4 rounded bg-emerald-400" />
                <div className="w-4 h-4 rounded bg-emerald-500" />
              </div>
              <span>多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
