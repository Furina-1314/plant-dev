import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from "react";

// ============ Types ============
export interface PlantStage {
  name: string;
  minAffection: number;
  image: string;
  description: string;
}

export interface MemoEntry {
  id: string;
  content: string;
  tag: string;
  priority: "low" | "medium" | "high";
  done: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteEntry {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitEntry {
  id: string;
  name: string;
  completed: boolean;
  streak: number;
  lastCompleted: string | null;
}

export interface FocusSession {
  id: string;
  startTime: string;
  duration: number;
  completed: boolean;
}

export interface DialogMessage {
  id: string;
  text: string;
  minAffection: number;
  type: "encouragement" | "rest" | "milestone" | "greeting";
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  minutes: number;
  sessions: number;
}

export interface MusicTrack {
  id: string;
  name: string;
  url: string; // blob URL or data URL
  createdAt: string;
  sourceKey?: string;
}

export interface GameState {
  // Affection / Plant growth
  affection: number;
  totalFocusMinutes: number;
  sessionsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;

  // Pomodoro
  pomodoroMinutes: number;
  breakMinutes: number;
  pomodoroCycles: number;
  currentCycle: number;
  isTimerRunning: boolean;
  timerMode: "focus" | "break";
  timeRemaining: number;
  lastCycleCompletionMark: number;
  cycleAccumulatedFocusSeconds: number;
  cycleAccumulatedPomodoros: number;

  // Sound — scene-based
  activeScene: string | null;
  customMix: Record<string, number>; // soundId -> volume (0-1)
  masterVolume: number;

  // Custom Music
  musicTracks: MusicTrack[];
  currentMusicId: string | null;
  isMusicPlaying: boolean;
  musicVolume: number;
  musicRepeatMode: "none" | "all" | "one"; // 顺序播放, 列表循环, 单曲循环
  customBackground: string | null;

  // Todos
  memos: MemoEntry[];
  memoTags: string[];

  // Notes
  notes: NoteEntry[];

  // Calendar Diary
  diaryEntries: Record<string, string>;

  // Habits
  habits: HabitEntry[];

  // Focus history
  sessions: FocusSession[];

  // Heatmap cache
  heatmapData: HeatmapDay[];

  // Dialog
  lastDialogShown: string | null;

  // UI
  activePanel: string | null;
}

// ============ Plant Stages ============
export const PLANT_STAGES: PlantStage[] = [
  {
    name: "种子",
    minAffection: 0,
    image: "seed",
    description: "一颗充满希望的种子，等待你的专注来浇灌它。",
  },
  {
    name: "幼苗",
    minAffection: 30,
    image: "sprout",
    description: "小小的嫩芽破土而出，你的专注正在生效！",
  },
  {
    name: "小草",
    minAffection: 100,
    image: "grass",
    description: "绿色的叶片在阳光下舒展，继续加油！",
  },
  {
    name: "灌木",
    minAffection: 250,
    image: "bush",
    description: "枝叶茂盛的小灌木，你的陪伴让它茁壮成长。",
  },
  {
    name: "小树",
    minAffection: 500,
    image: "small_tree",
    description: "一棵挺拔的小树，它因你的坚持而充满生机。",
  },
  {
    name: "花树",
    minAffection: 1000,
    image: "flower_tree",
    description: "樱花盛开的大树，你们之间的羁绊已经很深了！",
  },
];

// ============ Dialog Messages ============
export const DIALOG_MESSAGES: DialogMessage[] = [
  { id: "g1", text: "欢迎回来！今天也一起加油吧～", minAffection: 0, type: "greeting" },
  { id: "g2", text: "又见面了呢，准备好开始专注了吗？", minAffection: 30, type: "greeting" },
  { id: "g3", text: "你来了！我一直在等你呢～", minAffection: 100, type: "greeting" },
  { id: "g4", text: "最喜欢和你一起度过的专注时光了！", minAffection: 250, type: "greeting" },
  { id: "e1", text: "你做得很好，继续保持！", minAffection: 0, type: "encouragement" },
  { id: "e2", text: "专注的你最棒了！我在这里陪着你。", minAffection: 30, type: "encouragement" },
  { id: "e3", text: "看到你这么努力，我也充满了力量！", minAffection: 100, type: "encouragement" },
  { id: "e4", text: "有你在身边，连阳光都变得更温暖了呢。", minAffection: 250, type: "encouragement" },
  { id: "e5", text: "你的每一分钟专注，都让这个温室更加美丽。", minAffection: 500, type: "encouragement" },
  { id: "r1", text: "辛苦了！休息一下，喝杯水吧。", minAffection: 0, type: "rest" },
  { id: "r2", text: "休息时间到了～伸个懒腰，看看窗外的云吧。", minAffection: 30, type: "rest" },
  { id: "r3", text: "你刚才好专注啊！现在放松一下眼睛吧。", minAffection: 100, type: "rest" },
  { id: "r4", text: "休息也是很重要的呢，我帮你泡了一杯花茶～", minAffection: 250, type: "rest" },
  { id: "r5", text: "看，因为你的努力，花又开了一朵呢！", minAffection: 500, type: "rest" },
  { id: "m1", text: "你的第一次专注！这颗种子因你而发芽了！", minAffection: 0, type: "milestone" },
  { id: "m2", text: "好感度提升了！小苗在向你招手呢～", minAffection: 30, type: "milestone" },
  { id: "m3", text: "连续专注真厉害！植物长大了好多！", minAffection: 100, type: "milestone" },
  { id: "m4", text: "我们的羁绊越来越深了，谢谢你一直陪着我。", minAffection: 250, type: "milestone" },
  { id: "m5", text: "满树樱花为你绽放！你是最棒的专注伙伴！", minAffection: 1000, type: "milestone" },
];

// ============ Daily Quotes ============
export const DAILY_QUOTES = [
  { text: "学如逆水行舟，不进则退。", author: "《增广贤文》" },
  { text: "千里之行，始于足下。", author: "老子" },
  { text: "博学之，审问之，慎思之，明辨之，笃行之。", author: "《中庸》" },
  { text: "不积跬步，无以至千里。", author: "荀子" },
  { text: "业精于勤，荒于嬉。", author: "韩愈" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
  { text: "知之者不如好之者，好之者不如乐之者。", author: "孔子" },
  { text: "读书破万卷，下笔如有神。", author: "杜甫" },
  { text: "天才是百分之一的灵感加百分之九十九的汗水。", author: "爱迪生" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "路漫漫其修远兮，吾将上下而求索。", author: "屈原" },
  { text: "宝剑锋从磨砺出，梅花香自苦寒来。", author: "《警世贤文》" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "书山有路勤为径，学海无涯苦作舟。", author: "韩愈" },
];

export function getDailyQuote() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}

// ============ Sound Scenes ============
export interface SoundScene {
  id: string;
  name: string;
  icon: string;
  description: string;
  sounds: { id: string; volume: number }[];
}

export const SOUND_SCENES: SoundScene[] = [
  {
    id: "late_night_study",
    name: "深夜自习室",
    icon: "🌙",
    description: "安静的夜晚，只有笔尖沙沙声和远处的虫鸣",
    sounds: [
      { id: "night", volume: 0.6 },
      { id: "library", volume: 0.3 },
    ],
  },
  {
    id: "rainy_cafe",
    name: "雨天咖啡馆",
    icon: "☕",
    description: "窗外淅淅沥沥的雨声，咖啡馆里温暖的氛围",
    sounds: [
      { id: "rain", volume: 0.5 },
      { id: "cafe", volume: 0.4 },
    ],
  },
  {
    id: "morning_garden",
    name: "清晨花园",
    icon: "🌸",
    description: "鸟语花香的清晨，微风轻拂树叶",
    sounds: [
      { id: "birds", volume: 0.5 },
      { id: "wind", volume: 0.3 },
    ],
  },
  {
    id: "campfire",
    name: "篝火夜话",
    icon: "🔥",
    description: "噼啪作响的篝火，夜晚的虫鸣此起彼伏",
    sounds: [
      { id: "fire", volume: 0.6 },
      { id: "night", volume: 0.3 },
    ],
  },
  {
    id: "ocean_breeze",
    name: "海边小屋",
    icon: "🌊",
    description: "海浪拍打沙滩的声音，海风轻轻吹过",
    sounds: [
      { id: "ocean", volume: 0.6 },
      { id: "wind", volume: 0.2 },
    ],
  },
  {
    id: "thunderstorm",
    name: "暴风雨夜",
    icon: "⛈️",
    description: "雷声隆隆，大雨倾盆，适合深度沉浸",
    sounds: [
      { id: "thunder", volume: 0.5 },
      { id: "rain", volume: 0.5 },
    ],
  },
];

export const INDIVIDUAL_SOUNDS = [
  { id: "rain", name: "雨声", icon: "🌧️" },
  { id: "thunder", name: "雷雨", icon: "⛈️" },
  { id: "ocean", name: "海浪", icon: "🌊" },
  { id: "wind", name: "微风", icon: "🍃" },
  { id: "birds", name: "鸟鸣", icon: "🐦" },
  { id: "fire", name: "篝火", icon: "🔥" },
  { id: "white", name: "白噪音", icon: "📻" },
  { id: "brown", name: "棕噪音", icon: "🎵" },
  { id: "pink", name: "粉噪音", icon: "🎶" },
  { id: "cafe", name: "咖啡馆", icon: "☕" },
  { id: "library", name: "图书馆", icon: "📚" },
  { id: "night", name: "夜虫鸣", icon: "🌙" },
];

// ============ Actions ============
type GameAction =
  | { type: "START_TIMER" }
  | { type: "PAUSE_TIMER" }
  | { type: "RESET_TIMER" }
  | { type: "TICK" }
  | { type: "COMPLETE_SESSION"; payload?: { completedFocusSeconds?: number } }
  | { type: "SET_POMODORO_MINUTES"; payload: number }
  | { type: "SET_BREAK_MINUTES"; payload: number }
  | { type: "SET_POMODORO_CYCLES"; payload: number }
  | { type: "SET_SCENE"; payload: string | null }
  | { type: "SET_CUSTOM_MIX"; payload: Record<string, number> }
  | { type: "SET_MASTER_VOLUME"; payload: number }
  | { type: "ADD_MEMO"; payload: { content: string; tag: string; priority: MemoEntry["priority"] } }
  | { type: "UPDATE_MEMO"; payload: { id: string; content?: string; tag?: string; priority?: MemoEntry["priority"]; done?: boolean } }
  | { type: "DELETE_MEMO"; payload: string }
  | { type: "ADD_MEMO_TAG"; payload: string }
  | { type: "DELETE_MEMO_TAG"; payload: string }
  | { type: "ADD_NOTE"; payload: { content: string } }
  | { type: "UPDATE_NOTE"; payload: { id: string; content: string } }
  | { type: "DELETE_NOTE"; payload: string }
  | { type: "SET_DIARY_ENTRY"; payload: { date: string; content: string } }
  | { type: "ADD_HABIT"; payload: { name: string } }
  | { type: "TOGGLE_HABIT"; payload: string }
  | { type: "DELETE_HABIT"; payload: string }
  | { type: "SET_ACTIVE_PANEL"; payload: string | null }
  | { type: "LOAD_STATE"; payload: Partial<GameState> }
  // Music actions
  | { type: "ADD_MUSIC_TRACK"; payload: MusicTrack }
  | { type: "UPDATE_MUSIC_TRACK"; payload: { id: string; name: string } }
  | { type: "DELETE_MUSIC_TRACK"; payload: string }
  | { type: "REORDER_MUSIC_TRACKS"; payload: MusicTrack[] }
  | { type: "PLAY_MUSIC"; payload: string | null }
  | { type: "PAUSE_MUSIC" }
  | { type: "SET_MUSIC_VOLUME"; payload: number }
  | { type: "SET_MUSIC_REPEAT_MODE"; payload: "none" | "all" | "one" }
  | { type: "SET_CUSTOM_BACKGROUND"; payload: string | null };

// ============ Initial State ============
const initialState: GameState = {
  affection: 0,
  totalFocusMinutes: 0,
  sessionsCompleted: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  pomodoroMinutes: 25,
  breakMinutes: 5,
  pomodoroCycles: 4,
  currentCycle: 1,
  isTimerRunning: false,
  timerMode: "focus",
  timeRemaining: 25 * 60,
  lastCycleCompletionMark: 0,
  cycleAccumulatedFocusSeconds: 0,
  cycleAccumulatedPomodoros: 0,
  activeScene: null,
  customMix: {},
  masterVolume: 0.5,
  musicTracks: [],
  currentMusicId: null,
  isMusicPlaying: false,
  musicVolume: 0.5,
  musicRepeatMode: "all",
  customBackground: null,
  memos: [],
  memoTags: ["学习", "灵感", "待查", "论文"],
  notes: [],
  diaryEntries: {},
  habits: [],
  sessions: [],
  heatmapData: [],
  lastDialogShown: null,
  activePanel: null,
};

// ============ Helper ============
function getDateStr(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

// ============ Reducer ============
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_TIMER":
      return { ...state, isTimerRunning: true };

    case "PAUSE_TIMER":
      return { ...state, isTimerRunning: false };

    case "RESET_TIMER":
      return {
        ...state,
        isTimerRunning: false,
        currentCycle: 1,
        cycleAccumulatedFocusSeconds: 0,
        cycleAccumulatedPomodoros: 0,
        timeRemaining: state.timerMode === "focus"
          ? state.pomodoroMinutes * 60
          : state.breakMinutes * 60,
      };

    case "TICK":
      if (state.timeRemaining <= 0) return state;
      return { ...state, timeRemaining: state.timeRemaining - 1 };

    case "COMPLETE_SESSION": {
      const today = new Date().toDateString();
      const isConsecutive = state.lastSessionDate === new Date(Date.now() - 86400000).toDateString()
        || state.lastSessionDate === today;

      if (state.timerMode === "focus") {
        const completedFocusSeconds = Math.max(0, Math.min(
          state.pomodoroMinutes * 60,
          action.payload?.completedFocusSeconds ?? state.pomodoroMinutes * 60,
        ));

        const accumulatedSeconds = state.cycleAccumulatedFocusSeconds + completedFocusSeconds;
        const accumulatedPomodoros = state.cycleAccumulatedPomodoros + 1;
        const cycleFinished = state.currentCycle >= state.pomodoroCycles;

        if (!cycleFinished) {
          return {
            ...state,
            isTimerRunning: true,
            timerMode: "break",
            currentCycle: state.currentCycle,
            timeRemaining: state.breakMinutes * 60,
            cycleAccumulatedFocusSeconds: accumulatedSeconds,
            cycleAccumulatedPomodoros: accumulatedPomodoros,
          };
        }

        const settledMinutes = Math.floor(accumulatedSeconds / 60);
        const affectionGain = settledMinutes > 0 ? Math.max(1, Math.floor(settledMinutes * 0.8)) : 0;
        const newStreak = isConsecutive || state.lastSessionDate === today
          ? (state.lastSessionDate === today ? state.currentStreak : state.currentStreak + 1)
          : 1;

        const todayStr = getDateStr();
        const existingDay = state.heatmapData.find((d) => d.date === todayStr);
        const updatedHeatmap = existingDay
          ? state.heatmapData.map((d) =>
              d.date === todayStr
                ? { ...d, minutes: d.minutes + settledMinutes, sessions: d.sessions + accumulatedPomodoros }
                : d
            )
          : [...state.heatmapData, { date: todayStr, minutes: settledMinutes, sessions: accumulatedPomodoros }];

        return {
          ...state,
          affection: Math.max(0, (Number.isFinite(state.affection) ? state.affection : 0) + affectionGain),
          totalFocusMinutes: state.totalFocusMinutes + settledMinutes,
          sessionsCompleted: state.sessionsCompleted + accumulatedPomodoros,
          currentStreak: newStreak,
          longestStreak: Math.max(state.longestStreak, newStreak),
          lastSessionDate: today,
          isTimerRunning: false,
          timerMode: "focus",
          currentCycle: 1,
          timeRemaining: state.pomodoroMinutes * 60,
          lastCycleCompletionMark: Date.now(),
          cycleAccumulatedFocusSeconds: 0,
          cycleAccumulatedPomodoros: 0,
          heatmapData: updatedHeatmap,
          sessions: [
            ...state.sessions,
            {
              id: Date.now().toString(),
              startTime: new Date().toISOString(),
              duration: settledMinutes,
              completed: true,
            },
          ],
        };
      }

      // 休息完成 -> 自动进入下一轮专注并启动
      return {
        ...state,
        isTimerRunning: true,
        timerMode: "focus",
        currentCycle: Math.min(state.currentCycle + 1, state.pomodoroCycles),
        timeRemaining: state.pomodoroMinutes * 60,
      };
    }


    case "SET_POMODORO_MINUTES":
      return {
        ...state,
        pomodoroMinutes: action.payload,
        timeRemaining: state.timerMode === "focus" && !state.isTimerRunning
          ? action.payload * 60
          : state.timeRemaining,
      };

    case "SET_BREAK_MINUTES":
      return {
        ...state,
        breakMinutes: action.payload,
        timeRemaining: state.timerMode === "break" && !state.isTimerRunning
          ? action.payload * 60
          : state.timeRemaining,
      };

    case "SET_POMODORO_CYCLES":
      return {
        ...state,
        pomodoroCycles: action.payload,
        currentCycle: Math.min(state.currentCycle, action.payload),
      };

    case "SET_SCENE": {
      if (!action.payload) {
        return { ...state, activeScene: null, customMix: {} };
      }
      const scene = SOUND_SCENES.find((s) => s.id === action.payload);
      if (scene) {
        const mix: Record<string, number> = {};
        scene.sounds.forEach((s) => { mix[s.id] = s.volume; });
        return { ...state, activeScene: action.payload, customMix: mix };
      }
      return { ...state, activeScene: action.payload };
    }

    case "SET_CUSTOM_MIX":
      return { ...state, customMix: action.payload };

    case "SET_MASTER_VOLUME":
      return { ...state, masterVolume: action.payload };

    case "ADD_MEMO": {
      const now = new Date().toISOString();
      return {
        ...state,
        memos: [
          {
            id: Date.now().toString(),
            content: action.payload.content,
            tag: action.payload.tag,
            priority: action.payload.priority,
            done: false,
            createdAt: now,
            updatedAt: now,
          },
          ...state.memos,
        ],
      };
    }

    case "UPDATE_MEMO":
      return {
        ...state,
        memos: state.memos.map((m) =>
          m.id === action.payload.id
            ? {
                ...m,
                ...(action.payload.content !== undefined && { content: action.payload.content }),
                ...(action.payload.tag !== undefined && { tag: action.payload.tag }),
                ...(action.payload.priority !== undefined && { priority: action.payload.priority }),
                ...(action.payload.done !== undefined && { done: action.payload.done }),
                updatedAt: new Date().toISOString(),
              }
            : m
        ),
      };

    case "DELETE_MEMO":
      return { ...state, memos: state.memos.filter((m) => m.id !== action.payload) };

    case "ADD_MEMO_TAG":
      if (state.memoTags.includes(action.payload)) return state;
      return { ...state, memoTags: [...state.memoTags, action.payload] };

    case "DELETE_MEMO_TAG":
      return { ...state, memoTags: state.memoTags.filter((tag) => tag !== action.payload) };

    case "ADD_NOTE": {
      const now = new Date().toISOString();
      return {
        ...state,
        notes: [
          { id: Date.now().toString(), content: action.payload.content, createdAt: now, updatedAt: now },
          ...state.notes,
        ],
      };
    }

    case "UPDATE_NOTE":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.payload.id
            ? { ...note, content: action.payload.content, updatedAt: new Date().toISOString() }
            : note
        ),
      };

    case "DELETE_NOTE":
      return { ...state, notes: state.notes.filter((note) => note.id !== action.payload) };

    case "SET_DIARY_ENTRY":
      return {
        ...state,
        diaryEntries: {
          ...state.diaryEntries,
          [action.payload.date]: action.payload.content,
        },
      };

    case "ADD_HABIT":
      return {
        ...state,
        habits: [
          ...state.habits,
          { id: Date.now().toString(), name: action.payload.name, completed: false, streak: 0, lastCompleted: null },
        ],
      };

    case "TOGGLE_HABIT": {
      const today = new Date().toDateString();
      return {
        ...state,
        habits: state.habits.map((h) => {
          if (h.id !== action.payload) return h;
          if (h.completed) return { ...h, completed: false };
          const isConsecutive = h.lastCompleted === new Date(Date.now() - 86400000).toDateString();
          return {
            ...h,
            completed: true,
            streak: isConsecutive ? h.streak + 1 : 1,
            lastCompleted: today,
          };
        }),
      };
    }

    case "DELETE_HABIT":
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };

    case "SET_ACTIVE_PANEL":
      return { ...state, activePanel: state.activePanel === action.payload ? null : action.payload };

    // Music actions
    case "ADD_MUSIC_TRACK":
      return { ...state, musicTracks: [...state.musicTracks, action.payload] };

    case "UPDATE_MUSIC_TRACK":
      return {
        ...state,
        musicTracks: state.musicTracks.map((t) =>
          t.id === action.payload.id ? { ...t, name: action.payload.name } : t
        ),
      };

    case "DELETE_MUSIC_TRACK": {
      const isCurrent = state.currentMusicId === action.payload;
      return {
        ...state,
        musicTracks: state.musicTracks.filter((t) => t.id !== action.payload),
        currentMusicId: isCurrent ? null : state.currentMusicId,
        isMusicPlaying: isCurrent ? false : state.isMusicPlaying,
      };
    }

    case "REORDER_MUSIC_TRACKS":
      return { ...state, musicTracks: action.payload };

    case "PLAY_MUSIC":
      return {
        ...state,
        currentMusicId: action.payload,
        isMusicPlaying: action.payload !== null,
      };

    case "PAUSE_MUSIC":
      return { ...state, isMusicPlaying: false };

    case "SET_MUSIC_VOLUME":
      return { ...state, musicVolume: action.payload };

    case "SET_MUSIC_REPEAT_MODE":
      return { ...state, musicRepeatMode: action.payload };

    case "SET_CUSTOM_BACKGROUND":
      return { ...state, customBackground: action.payload };

    case "LOAD_STATE":
      return {
        ...state,
        ...action.payload,
        affection: action.payload.affection !== undefined
          ? Math.max(0, Number(action.payload.affection) || 0)
          : state.affection,
      };

    default:
      return state;
  }
}

// ============ Context ============
interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  currentPlantStage: PlantStage;
  nextPlantStage: PlantStage | null;
  progressToNext: number;
  getDialogForType: (type: DialogMessage["type"]) => DialogMessage;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem("focus-companion-state");
      if (saved) {
        const parsed = JSON.parse(saved);
        const safeAffection = Number.isFinite(parsed.affection) ? Math.max(0, Number(parsed.affection)) : 0;
        dispatch({
          type: "LOAD_STATE",
          payload: {
            ...parsed,
            affection: safeAffection,
            isTimerRunning: false,
            timeRemaining: parsed.timerMode === "focus"
              ? (parsed.pomodoroMinutes || 25) * 60
              : (parsed.breakMinutes || 5) * 60,
          },
        });
      }
    } catch (e) {
      console.warn("Failed to load saved state:", e);
    }
  }, []);

  // Save state (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        const { isTimerRunning, timeRemaining, activePanel, ...saveable } = state;
        void isTimerRunning;
        void timeRemaining;
        void activePanel;
        localStorage.setItem("focus-companion-state", JSON.stringify(saveable));
      } catch (e) {
        console.warn("Failed to save state:", e);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [state]);

  // Reset habits daily - 使用 ref 防止重复执行
  const hasResetTodayRef = useRef(false);
  
  useEffect(() => {
    if (hasResetTodayRef.current) return;
    
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem("focus-companion-last-habit-check");
    
    if (lastCheck !== today) {
      localStorage.setItem("focus-companion-last-habit-check", today);
      hasResetTodayRef.current = true;
      
      // 重置所有非今日完成的 habit
      state.habits.forEach((h) => {
        if (h.completed && h.lastCompleted !== today) {
          dispatch({ type: "TOGGLE_HABIT", payload: h.id });
        }
      });
    } else {
      hasResetTodayRef.current = true;
    }
  }, []); // 只在组件挂载时执行一次

  const safeAffection = Number.isFinite(state.affection) ? Number(state.affection) : 0;
  const currentPlantStage = [...PLANT_STAGES].reverse().find((s) => safeAffection >= s.minAffection) || PLANT_STAGES[0];
  const currentIndex = PLANT_STAGES.indexOf(currentPlantStage);
  const nextPlantStage = currentIndex < PLANT_STAGES.length - 1 ? PLANT_STAGES[currentIndex + 1] : null;
  const progressToNext = nextPlantStage
    ? ((safeAffection - currentPlantStage.minAffection) / (nextPlantStage.minAffection - currentPlantStage.minAffection)) * 100
    : 100;

  const getDialogForType = useCallback(
    (type: DialogMessage["type"]) => {
      const eligible = DIALOG_MESSAGES.filter(
        (m) => m.type === type && m.minAffection <= state.affection
      );
      return eligible[Math.floor(Math.random() * eligible.length)] || DIALOG_MESSAGES[0];
    },
    [state.affection]
  );

  return (
    <GameContext.Provider
      value={{ state, dispatch, currentPlantStage, nextPlantStage, progressToNext, getDialogForType }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
