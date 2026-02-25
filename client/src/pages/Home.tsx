import { useState, lazy, Suspense } from "react";
import TimerPanel from "@/components/TimerPanel";
import SoundPanel from "@/components/SoundPanel";
import PlantInfo from "@/components/PlantInfo";
import NotesPanel from "@/components/NotesPanel";
import HabitsPanel from "@/components/HabitsPanel";
import StatsPanel from "@/components/StatsPanel";
import ProfilePage from "@/components/ProfilePage";
import CalendarView from "@/components/CalendarView";
import DialogBubble from "@/components/DialogBubble";
import FloatingParticles from "@/components/FloatingParticles";
import {
  FileText,
  Target,
  BarChart3,
  Leaf,
  ChevronLeft,
  ChevronRight,
  Timer,
  Volume2,
  Sprout,
  X,
  User,
  Calendar,
} from "lucide-react";

const PlantScene = lazy(() => import("@/components/PlantScene"));

const CLOUDS_BG = "/assets/clouds-bg.png";
const HERO_BG = "/assets/hero-bg.png";

type RightTab = "notes" | "habits" | "stats";
type MobilePanel = "timer" | "sounds" | "plant" | "notes" | "habits" | "stats" | null;

export default function Home() {
  const [rightTab, setRightTab] = useState<RightTab>("notes");
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const rightTabs: { id: RightTab; label: string; icon: typeof FileText }[] = [
    { id: "notes", label: "笔记", icon: FileText },
    { id: "habits", label: "习惯", icon: Target },
    { id: "stats", label: "统计", icon: BarChart3 },
  ];

  const mobileTabs = [
    { id: "timer" as MobilePanel, label: "计时", icon: Timer },
    { id: "sounds" as MobilePanel, label: "音效", icon: Volume2 },
    { id: "plant" as MobilePanel, label: "植物", icon: Sprout },
    { id: "notes" as MobilePanel, label: "笔记", icon: FileText },
    { id: "habits" as MobilePanel, label: "习惯", icon: Target },
    { id: "stats" as MobilePanel, label: "统计", icon: BarChart3 },
  ];

  const renderRightContent = () => {
    switch (rightTab) {
      case "notes": return <NotesPanel />;
      case "habits": return <HabitsPanel />;
      case "stats": return <StatsPanel />;
      default: return <NotesPanel />;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-green-50">
      {/* 背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: `url(${CLOUDS_BG})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${HERO_BG})`, backgroundSize: "cover", backgroundPosition: "center bottom", maskImage: "linear-gradient(to top, black 0%, transparent 60%)" }} />
      </div>

      <FloatingParticles />

      {/* 顶部工具栏 */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <button onClick={() => setShowCalendar(true)} className="p-2.5 rounded-xl bg-white/80 shadow-lg hover:bg-white transition-colors text-gray-600" title="日历">
          <Calendar size={20} />
        </button>
        <button onClick={() => setShowProfile(true)} className="p-2.5 rounded-xl bg-white/80 shadow-lg hover:bg-white transition-colors text-gray-600" title="个人中心">
          <User size={20} />
        </button>
      </div>

      {/* 桌面端布局 */}
      <div className="relative z-10 h-full hidden lg:flex">
        {/* 左侧面板 - 移除 Logo，空间留给音效 */}
        <div className={`shrink-0 h-full flex flex-col transition-all duration-300 ${leftCollapsed ? "w-0 opacity-0" : "w-[300px] opacity-100"}`}>
          <div className="h-full p-4 flex flex-col gap-3 overflow-hidden">
            {/* 番茄钟 - 高度 360px，确保数字在圆圈内 */}
            <div className="shrink-0">
              <TimerPanel compact />
            </div>
            {/* 音效面板 - 占据剩余空间 */}
            <div className="flex-1 min-h-0">
              <SoundPanel />
            </div>
          </div>
        </div>

        {/* 左侧切换按钮 */}
        <button onClick={() => setLeftCollapsed(!leftCollapsed)} className="absolute left-0 top-1/2 -translate-y-1/2 z-50 w-6 h-14 bg-white/90 shadow-lg rounded-r-xl flex items-center justify-center hover:bg-white transition-all border-y border-r border-gray-200">
          {leftCollapsed ? <ChevronRight size={16} className="text-gray-600" /> : <ChevronLeft size={16} className="text-gray-600" />}
        </button>

        {/* 中间 */}
        <div className="flex-1 relative flex items-center justify-center p-6">
          <div className="w-full max-w-2xl h-full max-h-[700px] relative">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Leaf size={40} className="text-emerald-400 animate-pulse" /></div>}>
              <PlantScene />
            </Suspense>
            <DialogBubble />
          </div>
        </div>

        {/* 右侧切换按钮 */}
        <button onClick={() => setRightCollapsed(!rightCollapsed)} className="absolute right-0 top-1/2 -translate-y-1/2 z-50 w-6 h-14 bg-white/90 shadow-lg rounded-l-xl flex items-center justify-center hover:bg-white transition-all border-y border-l border-gray-200">
          {rightCollapsed ? <ChevronLeft size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
        </button>

        {/* 右侧面板 */}
        <div className={`shrink-0 h-full transition-all duration-300 ${rightCollapsed ? "w-0 opacity-0" : "w-[380px] opacity-100"}`}>
          <div className="h-full p-4 flex flex-col gap-4 overflow-hidden">
            <div className="shrink-0">
              <PlantInfo />
            </div>
            {/* 标签页添加图标 */}
            <div className="flex gap-1 bg-white/50 rounded-xl p-1 shrink-0">
              {rightTabs.map((tab) => (
                <button key={tab.id} onClick={() => setRightTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${rightTab === tab.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}`}>
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {renderRightContent()}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端布局 */}
      <div className="relative z-10 h-full flex flex-col lg:hidden">
        <div className="flex items-center gap-2 px-4 pt-3 pb-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="text-base font-bold">专注陪伴</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setShowCalendar(true)} className="p-2 rounded-lg bg-white/80 text-gray-600">
              <Calendar size={18} />
            </button>
            <button onClick={() => setShowProfile(true)} className="p-2 rounded-lg bg-white/80 text-gray-600">
              <User size={18} />
            </button>
          </div>
        </div>
        
        <div className="flex-1 relative min-h-0">
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center"><Leaf size={32} className="text-emerald-400 animate-pulse" /></div>}>
            <PlantScene />
          </Suspense>
          <DialogBubble />
        </div>

        {mobilePanel && (
          <div className="absolute inset-x-0 bottom-16 top-0 z-30 bg-white/95 backdrop-blur-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">
                {mobilePanel === "timer" && "番茄钟"}
                {mobilePanel === "sounds" && "环境音效"}
                {mobilePanel === "plant" && "植物信息"}
                {mobilePanel === "notes" && "灵感备忘"}
                {mobilePanel === "habits" && "每日习惯"}
                {mobilePanel === "stats" && "专注统计"}
              </h2>
              <button onClick={() => setMobilePanel(null)} className="p-2 rounded-full hover:bg-gray-100">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            {mobilePanel === "timer" && <TimerPanel />}
            {mobilePanel === "sounds" && <SoundPanel />}
            {mobilePanel === "plant" && <PlantInfo />}
            {mobilePanel === "notes" && <NotesPanel />}
            {mobilePanel === "habits" && <HabitsPanel />}
            {mobilePanel === "stats" && <StatsPanel />}
          </div>
        )}

        <div className="shrink-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 px-2 py-2 flex items-center justify-around">
          {mobileTabs.map((tab) => (
            <button key={tab.id} onClick={() => setMobilePanel(mobilePanel === tab.id ? null : tab.id)} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${mobilePanel === tab.id ? "text-emerald-600 bg-emerald-50" : "text-gray-500"}`}>
              <tab.icon size={20} />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 弹窗 */}
      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
      {showCalendar && <CalendarView onClose={() => setShowCalendar(false)} />}
    </div>
  );
}
