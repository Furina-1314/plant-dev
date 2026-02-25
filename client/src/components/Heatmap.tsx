import { useGame } from "@/contexts/GameContext";
import { useMemo } from "react";
import { motion } from "motion/react";
import { Flame } from "lucide-react";

function getDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getIntensity(minutes: number): number {
  if (minutes === 0) return 0;
  if (minutes < 25) return 1;
  if (minutes < 60) return 2;
  if (minutes < 120) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  "bg-border/20",          // 0: no data
  "bg-primary/20",         // 1: < 25 min
  "bg-primary/40",         // 2: 25-60 min
  "bg-primary/65",         // 3: 60-120 min
  "bg-primary/90",         // 4: > 120 min
];

const MONTHS = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
const WEEKDAYS = ["", "一", "", "三", "", "五", ""];

export default function Heatmap() {
  const { state } = useGame();

  const { grid, monthLabels, totalDays, activeDays } = useMemo(() => {
    const today = new Date();
    const weeks = 12;
    const totalCells = weeks * 7;

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - totalCells + 1);
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startDate.setDate(startDate.getDate() + mondayOffset);

    const heatmapLookup: Record<string, number> = {};
    state.heatmapData.forEach((d) => {
      heatmapLookup[d.date] = d.minutes;
    });

    const grid: { date: string; minutes: number; intensity: number; isToday: boolean; isFuture: boolean }[][] = [];
    const monthLabels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    let activeDays = 0;

    for (let w = 0; w < weeks; w++) {
      const week: typeof grid[0] = [];
      for (let d = 0; d < 7; d++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(cellDate.getDate() + w * 7 + d);
        const dateStr = getDateStr(cellDate);
        const minutes = heatmapLookup[dateStr] || 0;
        const isToday = dateStr === getDateStr(today);
        const isFuture = cellDate > today;

        if (minutes > 0) activeDays++;

        if (d === 0 && cellDate.getMonth() !== lastMonth) {
          lastMonth = cellDate.getMonth();
          monthLabels.push({ label: MONTHS[lastMonth], col: w });
        }

        week.push({
          date: dateStr,
          minutes,
          intensity: isFuture ? -1 : getIntensity(minutes),
          isToday,
          isFuture,
        });
      }
      grid.push(week);
    }

    return { grid, monthLabels, totalDays: totalCells, activeDays };
  }, [state.heatmapData]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame size={14} className="text-orange-400" />
        <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          学习热力图
        </h3>
        <span className="text-[9px] text-muted-foreground ml-auto">
          近12周 · {activeDays} 天活跃
        </span>
      </div>
<div className="flex ml-6 mb-1">
        {monthLabels.map((m, i) => (
          <span
            key={i}
            className="text-[8px] text-muted-foreground"
            style={{
              position: "relative",
              left: `${m.col * (10 + 2)}px`,
              marginRight: i < monthLabels.length - 1
                ? `${(monthLabels[i + 1].col - m.col) * (10 + 2) - 20}px`
                : 0,
            }}
          >
            {m.label}
          </span>
        ))}
      </div>
<div className="flex gap-0">
<div className="flex flex-col gap-[2px] mr-1 shrink-0">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="w-4 h-[10px] flex items-center justify-end">
              <span className="text-[7px] text-muted-foreground">{day}</span>
            </div>
          ))}
        </div>
<div className="flex gap-[2px] overflow-hidden">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[2px]">
              {week.map((cell, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`w-[10px] h-[10px] rounded-[2px] transition-colors cursor-pointer
                    hover:ring-1 hover:ring-primary/50 hover:scale-125
                    ${cell.isFuture ? "bg-transparent" : INTENSITY_COLORS[cell.intensity]}
                    ${cell.isToday ? "ring-1 ring-primary/50" : ""}
                  `}
                  title={cell.isFuture ? "未来日期" : `${cell.date}: ${cell.minutes > 0 ? cell.minutes + '分钟专注' : '无记录'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
<div className="flex items-center justify-end gap-1 mt-2">
        <span className="text-[7px] text-muted-foreground">少</span>
        {INTENSITY_COLORS.map((c, i) => (
          <div key={i} className={`w-[8px] h-[8px] rounded-[1px] ${c}`} />
        ))}
        <span className="text-[7px] text-muted-foreground">多</span>
      </div>
    </motion.div>
  );
}
