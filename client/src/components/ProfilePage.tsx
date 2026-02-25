import { useGame } from "@/contexts/GameContext";
import { X, Download, Upload, Trophy, Calendar, Clock, Target, Flame, Award, TrendingUp } from "lucide-react";

interface ProfilePageProps {
  onClose: () => void;
}

export default function ProfilePage({ onClose }: ProfilePageProps) {
  const { state } = useGame();

  // 导出数据
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

  // 导入数据
  const importData = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            // 这里应该验证数据格式并导入
            alert("数据导入功能需要在 GameContext 中实现");
          } catch (err) {
            alert("文件格式错误");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // 计算统计数据
  const totalHours = Math.floor(state.totalFocusMinutes / 60);
  const avgSessionMinutes = state.sessionsCompleted > 0 
    ? Math.round(state.totalFocusMinutes / state.sessionsCompleted) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* 头部 */}
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

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 核心数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-2xl p-4 text-center">
              <Clock size={20} className="mx-auto mb-2 text-emerald-500" />
              <div className="text-2xl font-bold text-gray-800">{totalHours}</div>
              <div className="text-xs text-gray-500">总专注小时</div>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 text-center">
              <Target size={20} className="mx-auto mb-2 text-amber-500" />
              <div className="text-2xl font-bold text-gray-800">{state.sessionsCompleted}</div>
              <div className="text-xs text-gray-500">完成番茄数</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 text-center">
              <Flame size={20} className="mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold text-gray-800">{state.longestStreak}</div>
              <div className="text-xs text-gray-500">最长连续天数</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 text-center">
              <Award size={20} className="mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-gray-800">{avgSessionMinutes}</div>
              <div className="text-xs text-gray-500">平均专注分钟</div>
            </div>
          </div>

          {/* 等级信息 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-5 mb-6 border border-amber-100">
            <div className="flex items-center gap-4">
              <span className="text-4xl">
                {state.totalFocusMinutes < 100 ? "🌱" : 
                 state.totalFocusMinutes < 500 ? "🌿" : 
                 state.totalFocusMinutes < 1000 ? "🌲" : 
                 state.totalFocusMinutes < 2000 ? "⭐" : "👑"}
              </span>
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-800">
                  {state.totalFocusMinutes < 100 ? "专注新手" : 
                   state.totalFocusMinutes < 500 ? "专注学徒" : 
                   state.totalFocusMinutes < 1000 ? "专注达人" : 
                   state.totalFocusMinutes < 2000 ? "专注大师" : "专注传奇"}
                </div>
                <div className="text-sm text-gray-500">
                  累计获得 {state.affection} 好感度
                </div>
              </div>
            </div>
          </div>

          {/* 习惯统计 */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              习惯养成
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-800">{state.habits.length}</div>
                <div className="text-xs text-gray-500">养成习惯数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {state.habits.filter(h => h.streak > 0).length}
                </div>
                <div className="text-xs text-gray-500">进行中习惯</div>
              </div>
            </div>
          </div>

          {/* 笔记统计 */}
          <div className="bg-gray-50 rounded-2xl p-5 mb-6">
            <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-amber-500" />
              灵感记录
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-800">{state.memos.length}</div>
                <div className="text-xs text-gray-500">总笔记数</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {state.memos.filter(m => m.done).length}
                </div>
                <div className="text-xs text-gray-500">已完成笔记</div>
              </div>
            </div>
          </div>

          {/* 数据管理 */}
          <div className="border-t border-gray-100 pt-6">
            <h3 className="text-base font-bold text-gray-800 mb-3">数据管理</h3>
            <div className="flex gap-3">
              <button onClick={exportData} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-100 text-emerald-700 font-medium hover:bg-emerald-200 transition-colors">
                <Download size={18} />
                导出数据
              </button>
              <button onClick={importData} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
                <Upload size={18} />
                导入数据
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              导出的数据包含所有专注记录、习惯和笔记
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
