import { useState } from "react";
import { useGame, PLANT_STAGES } from "@/contexts/GameContext";
import { Heart, Timer, Flame, ChevronLeft, ChevronRight, Eye } from "lucide-react";

const STAGE_ICONS: Record<string, string> = {
  seed: "🌰", sprout: "🌱", grass: "🌿", bush: "🪴", small_tree: "🌳", flower_tree: "🌸",
};

const STAGE_NAMES: Record<string, string> = {
  seed: "种子", sprout: "嫩芽", grass: "幼苗", bush: "灌木", small_tree: "小树", flower_tree: "花树",
};

// 新的好感度等级系统
const AFFECTION_LEVELS = [
  { min: 0, name: "初识", color: "text-gray-500", icon: "🌱", desc: "一颗等待发芽的种子" },
  { min: 50, name: "萌芽", color: "text-emerald-500", icon: "🌿", desc: "嫩芽破土而出" },
  { min: 150, name: "成长", color: "text-teal-500", icon: "🌲", desc: "正在茁壮成长" },
  { min: 300, name: "茂盛", color: "text-blue-500", icon: "🌳", desc: "枝繁叶茂" },
  { min: 600, name: "绽放", color: "text-purple-500", icon: "🌸", desc: "即将开花" },
  { min: 1000, name: "盛放", color: "text-pink-500", icon: "🌺", desc: "满树繁花" },
  { min: 1500, name: "永恒", color: "text-amber-500", icon: "⭐", desc: "你们的羁绊已根深蒂固" },
];

export default function PlantInfo() {
  const { state } = useGame();
  const [showPreview, setShowPreview] = useState(false);
  const [previewStage, setPreviewStage] = useState(0);

  const currentIndex = PLANT_STAGES.indexOf(PLANT_STAGES.find(s => state.affection >= s.minAffection) || PLANT_STAGES[0]);
  const currentStage = PLANT_STAGES[currentIndex];
  const nextStage = PLANT_STAGES[currentIndex + 1];
  
  // 计算当前等级
  const currentLevel = AFFECTION_LEVELS.slice().reverse().find(l => state.affection >= l.min) || AFFECTION_LEVELS[0];
  
  // 计算下一等级所需好感度
  const nextLevel = AFFECTION_LEVELS.find(l => l.min > state.affection);
  const progressToNextLevel = nextLevel 
    ? ((state.affection - currentLevel.min) / (nextLevel.min - currentLevel.min)) * 100
    : 100;

  // 计算当前阶段进度
  const stageProgress = nextStage
    ? ((state.affection - currentStage.minAffection) / (nextStage.minAffection - currentStage.minAffection)) * 100
    : 100;

  // 预览导航
  const changePreview = (delta: number) => {
    const newStage = previewStage + delta;
    if (newStage >= 0 && newStage < PLANT_STAGES.length) {
      setPreviewStage(newStage);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
      {/* 头部 */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
          <span className="text-2xl">{STAGE_ICONS[currentStage.image]}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-gray-800">{currentStage.name}</h3>
            <span className="text-sm">{currentLevel.icon}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span>阶段 {currentIndex + 1}/{PLANT_STAGES.length}</span>
            <span>·</span>
            <span className={`${currentLevel.color} font-medium`}>{currentLevel.name}</span>
          </div>
        </div>
        {/* 预览按钮 */}
        <button onClick={() => setShowPreview(true)} className="p-2 rounded-xl bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors" title="预览成长">
          <Eye size={16} />
        </button>
      </div>

      {/* 等级进度条 */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-500">{currentLevel.name}</span>
          <span className="font-bold text-emerald-600">{state.affection} 好感度</span>
          {nextLevel && <span className="text-gray-400">{nextLevel.name}</span>}
        </div>
        <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 transition-all duration-500" style={{ width: `${Math.min(progressToNextLevel, 100)}%` }} />
        </div>
        {nextLevel && (
          <div className="text-[10px] text-gray-400 mt-1 text-right">
            距离 {nextLevel.name} 还需 {nextLevel.min - state.affection} 好感度
          </div>
        )}
      </div>

      {/* 描述 */}
      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
        {currentStage.description}
      </p>

      {/* 统计 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center p-2 rounded-xl bg-pink-50">
          <Heart size={14} className="mx-auto mb-0.5 text-pink-500 fill-pink-500" />
          <div className="text-base font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>{state.affection}</div>
          <div className="text-[9px] text-gray-500">好感度</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-blue-50">
          <Timer size={14} className="mx-auto mb-0.5 text-blue-500" />
          <div className="text-base font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>{state.totalFocusMinutes}</div>
          <div className="text-[9px] text-gray-500">专注分钟</div>
        </div>
        <div className="text-center p-2 rounded-xl bg-orange-50">
          <Flame size={14} className="mx-auto mb-0.5 text-orange-500" />
          <div className="text-base font-bold text-gray-800" style={{ fontFamily: "var(--font-mono)" }}>{state.currentStreak}</div>
          <div className="text-[9px] text-gray-500">连续天数</div>
        </div>
      </div>

      {/* 植物预览弹窗 */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-8 pb-4 px-4 overflow-y-auto" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-3xl p-4 max-w-sm w-full max-h-[calc(100vh-3rem)] overflow-y-auto shadow-2xl mt-2" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">植物成长预览</h3>
              <button onClick={() => setShowPreview(false)} className="p-2 rounded-full hover:bg-gray-100">
                <span className="text-gray-500">✕</span>
              </button>
            </div>
            
            {/* 预览显示 */}
            <div className="bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl p-4 mb-4 text-center">
              <div className="text-6xl mb-2">{STAGE_ICONS[PLANT_STAGES[previewStage].image]}</div>
              <div className="text-lg font-bold text-gray-800">{STAGE_NAMES[PLANT_STAGES[previewStage].image]}</div>
              <div className="text-xs text-gray-600 mt-1">{PLANT_STAGES[previewStage].description}</div>
              <div className="text-[11px] text-gray-500 mt-2">需要 {PLANT_STAGES[previewStage].minAffection} 好感度</div>
            </div>

            {/* 导航 */}
            <div className="flex items-center justify-between">
              <button onClick={() => changePreview(-1)} disabled={previewStage === 0} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-1">
                {PLANT_STAGES.map((_, i) => (
                  <button key={i} onClick={() => setPreviewStage(i)} className={`w-2 h-2 rounded-full transition-colors ${i === previewStage ? "bg-emerald-500" : "bg-gray-300"}`} />
                ))}
              </div>
              <button onClick={() => changePreview(1)} disabled={previewStage === PLANT_STAGES.length - 1} className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 当前进度提示 */}
            <div className="mt-4 text-center">
              {previewStage === currentIndex ? (
                <span className="text-sm text-emerald-600 font-medium">✨ 当前阶段</span>
              ) : previewStage < currentIndex ? (
                <span className="text-sm text-gray-500">已解锁</span>
              ) : (
                <span className="text-sm text-amber-600">还需 {PLANT_STAGES[previewStage].minAffection - state.affection} 好感度解锁</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
