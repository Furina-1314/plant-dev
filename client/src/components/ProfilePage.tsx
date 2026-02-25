import { useGame } from "@/contexts/GameContext";
import { useRef } from "react";
import { X, Download, Upload, Trophy, Calendar, Clock, Target, Flame, Award, TrendingUp, ImagePlus, RotateCcw } from "lucide-react";

interface ProfilePageProps {
  onClose: () => void;
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
  const { state, dispatch } = useGame();
  const bgInputRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      stats: {
        totalFocusMinutes: state.totalFocusMinutes,
        sessionsCompleted: state.sessionsCompleted,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        affection: state.affection,
      },
      sessions: state.sessions,
      habits: state.habits,
      memos: state.memos,
      heatmapData: state.heatmapData,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `focus-companion-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);

          if (parsed?.stats && parsed?.sessions) {
            dispatch({
              type: "LOAD_STATE",
              payload: {
                affection: Number(parsed.stats.affection || 0),
                totalFocusMinutes: Number(parsed.stats.totalFocusMinutes || 0),
                sessionsCompleted: Number(parsed.stats.sessionsCompleted || 0),
                currentStreak: Number(parsed.stats.currentStreak || 0),
                longestStreak: Number(parsed.stats.longestStreak || 0),
                sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
                habits: Array.isArray(parsed.habits) ? parsed.habits : [],
                memos: Array.isArray(parsed.memos) ? parsed.memos : [],
                heatmapData: Array.isArray(parsed.heatmapData) ? parsed.heatmapData : [],
              },
            });
            alert("数据导入成功");
            return;
          }

          if (parsed && typeof parsed === "object") {
            dispatch({ type: "LOAD_STATE", payload: parsed });
            alert("数据导入成功");
            return;
          }

          alert("文件格式错误");
        } catch {
          alert("文件格式错误");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleBackgroundUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const targetRatio = window.innerWidth / window.innerHeight;
        const imgRatio = img.width / img.height;

        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;

        if (imgRatio > targetRatio) {
          sw = img.height * targetRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetRatio;
          sy = (img.height - sh) / 2;
        }

        const canvas = document.createElement("canvas");
        const outW = Math.min(1920, Math.max(1280, window.innerWidth));
        const outH = Math.round(outW / targetRatio);
        canvas.width = outW;
        canvas.height = outH;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        dispatch({ type: "SET_CUSTOM_BACKGROUND", payload: dataUrl });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const totalHours = Math.floor(Math.round(state.totalFocusMinutes) / 60);
  const avgSessionMinutes = state.sessionsCompleted > 0
    ? Math.round(state.totalFocusMinutes / state.sessionsCompleted)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Trophy size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">个人中心</h2>
              <p className="text-sm text-gray-500">你的专注之旅</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6 p-4 rounded-2xl border border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">页面背景</h3>
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleBackgroundUpload(file);
                }}
              />
              <div className="flex items-center gap-2">
                <button onClick={() => bgInputRef.current?.click()} className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs flex items-center gap-1">
                  <ImagePlus size={14} /> 上传背景
                </button>
                <button onClick={() => dispatch({ type: "SET_CUSTOM_BACKGROUND", payload: null })} className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-700 text-xs flex items-center gap-1">
                  <RotateCcw size={14} /> 恢复默认
                </button>
              </div>
            </div>
            <p className="text-[11px] text-gray-500">上传图片会按窗口比例自动裁切并覆盖背景。</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-2xl p-4 text-center"><Clock size={20} className="mx-auto mb-2 text-emerald-500" /><div className="text-2xl font-bold text-gray-800">{totalHours}</div><div className="text-xs text-gray-500">总专注小时</div></div>
            <div className="bg-amber-50 rounded-2xl p-4 text-center"><Target size={20} className="mx-auto mb-2 text-amber-500" /><div className="text-2xl font-bold text-gray-800">{state.sessionsCompleted}</div><div className="text-xs text-gray-500">完成番茄数</div></div>
            <div className="bg-orange-50 rounded-2xl p-4 text-center"><Flame size={20} className="mx-auto mb-2 text-orange-500" /><div className="text-2xl font-bold text-gray-800">{state.longestStreak}</div><div className="text-xs text-gray-500">最长连续天数</div></div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center"><Award size={20} className="mx-auto mb-2 text-purple-500" /><div className="text-2xl font-bold text-gray-800">{avgSessionMinutes}</div><div className="text-xs text-gray-500">平均专注分钟</div></div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{state.totalFocusMinutes < 100 ? "🌱" : state.totalFocusMinutes < 500 ? "🌿" : state.totalFocusMinutes < 1000 ? "🌲" : state.totalFocusMinutes < 2000 ? "⭐" : "👑"}</span>
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-800">{state.totalFocusMinutes < 100 ? "专注新手" : state.totalFocusMinutes < 500 ? "专注学徒" : state.totalFocusMinutes < 1000 ? "专注达人" : state.totalFocusMinutes < 2000 ? "专注大师" : "专注传奇"}</div>
                <div className="text-sm text-gray-500">累计获得 {state.affection} 好感度</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><TrendingUp size={16} /> 习惯完成情况</h3>
            <div className="space-y-3">
              {state.habits.length === 0 ? <p className="text-sm text-gray-400">还没有添加习惯</p> : state.habits.map((habit) => (
                <div key={habit.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700">{habit.name}</span>
                  <div className="text-xs text-gray-500">连续 {habit.streak} 天</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2"><Calendar size={16} /> 数据管理</h3>
            <div className="flex gap-3">
              <button onClick={exportData} className="flex-1 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2"><Download size={16} />导出数据</button>
              <button onClick={importData} className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-2"><Upload size={16} />导入数据</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
