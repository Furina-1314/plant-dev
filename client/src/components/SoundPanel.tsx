import { useGame, SOUND_SCENES, INDIVIDUAL_SOUNDS, type MusicTrack } from "@/contexts/GameContext";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { 
  Volume2, VolumeX, Sliders, Sparkles, Music, 
  Upload, Trash2, Edit2, Check, X, GripVertical, Play, Pause,
  ListMusic, Repeat, Repeat1, ChevronLeft, ChevronRight
} from "lucide-react";
import { useState, useRef, useCallback } from "react";

type Mode = "scenes" | "mixer" | "music";

const SCENE_ICONS: Record<string, string> = {
  late_night_study: "🌙",
  rainy_cafe: "☕",
  morning_garden: "🌸",
  campfire: "🔥",
  ocean_breeze: "🌊",
  thunderstorm: "⛈️",
};

const SOUND_ICONS: Record<string, string> = {
  rain: "🌧️", thunder: "⛈️", ocean: "🌊", wind: "🍃", birds: "🐦",
  fire: "🔥", white: "📻", brown: "🎵", pink: "🎶", cafe: "☕",
  library: "📚", night: "🌙",
};

// 自定义滑块
function CustomSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const percentage = Math.round(value * 100);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback((clientX: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const newValue = Math.max(0, Math.min(1, x / rect.width));
    onChange(newValue);
  }, [onChange]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleInteraction(e.clientX);
    
    const handleMouseMove = (moveEvent: MouseEvent) => handleInteraction(moveEvent.clientX);
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div ref={trackRef} className="flex-1 h-4 flex items-center cursor-pointer" onMouseDown={handleMouseDown}>
      <div className="relative w-full h-[4px] bg-gray-200 rounded-full overflow-visible">
        <div className="absolute left-0 top-0 h-full bg-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
        <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-purple-500 rounded-full shadow-sm" style={{ left: `calc(${percentage}% - 5px)` }} />
      </div>
    </div>
  );
}

// 音乐轨道项 - 支持拖拽
function MusicTrackItem({ 
  track, 
  index, 
  isPlaying, 
  isCurrent,
  onPlay, 
  onDelete, 
  onRename,
  onDragStart,
  onDragOver,
  onDrop
}: { 
  track: MusicTrack; 
  index: number;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(track.name);

  const handleSave = () => {
    if (editName.trim()) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div 
      className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-gray-50 group transition-colors"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
    >
      {/* 拖拽手柄 */}
      <div 
        className="shrink-0 text-gray-300 cursor-move hover:text-gray-500"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} />
      </div>
      
      {/* 播放按钮 */}
      <button 
        onClick={onPlay}
        className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
          isCurrent && isPlaying 
            ? "bg-purple-500 text-white" 
            : "bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600"
        }`}
      >
        {isCurrent && isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
      </button>

      {/* 名称 */}
      {isEditing ? (
        <div className="flex-1 flex items-center gap-1">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1 text-xs px-2 py-1 rounded border border-purple-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
          />
          <button onClick={handleSave} className="p-1 text-green-500 hover:bg-green-50 rounded">
            <Check size={12} />
          </button>
          <button onClick={() => { setIsEditing(false); setEditName(track.name); }} className="p-1 text-red-500 hover:bg-red-50 rounded">
            <X size={12} />
          </button>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex items-center justify-between">
          <span className={`text-xs truncate ${isCurrent ? "font-medium text-purple-700" : "text-gray-700"}`}>
            {track.name}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded">
              <Edit2 size={12} />
            </button>
            <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 循环模式按钮
function RepeatModeButton({ mode, onChange }: { mode: "none" | "all" | "one"; onChange: (m: "none" | "all" | "one") => void }) {
  const modes: { key: "none" | "all" | "one"; icon: typeof Repeat; label: string }[] = [
    { key: "none", icon: Repeat, label: "顺序" },
    { key: "all", icon: Repeat, label: "循环" },
    { key: "one", icon: Repeat1, label: "单曲" },
  ];
  
  const current = modes.find((m) => m.key === mode)!;
  const nextMode = modes[(modes.findIndex((m) => m.key === mode) + 1) % modes.length].key;
  
  return (
    <button 
      onClick={() => onChange(nextMode)}
      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
        mode === "none" 
          ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
          : "bg-purple-100 text-purple-600 hover:bg-purple-200"
      }`}
      title={`${current.label}播放 (点击切换)`}
    >
      <current.icon size={14} />
      <span>{current.label}</span>
    </button>
  );
}

export default function SoundPanel() {
  const { state, dispatch } = useGame();
  const { 
    togglePlay, 
    playNext, 
    playPrevious,
    currentTrack, 
    isPlaying, 
    volume, 
    setVolume,
    repeatMode,
    setRepeatMode
  } = useMusicPlayer();
  const [mode, setMode] = useState<Mode>("scenes");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousMixRef = useRef<Record<string, number>>({});
  const previousSceneRef = useRef<string | null>(null);

  useAudioEngine(state.customMix, state.masterVolume);

  const hasActiveSound = Object.values(state.customMix).some((v) => v > 0);
  const activeSoundCount = Object.values(state.customMix).filter((v) => v > 0).length;

  // 拖拽处理
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;

    const newTracks = [...state.musicTracks];
    const [removed] = newTracks.splice(dragIndex, 1);
    newTracks.splice(dropIndex, 0, removed);
    
    dispatch({ type: "REORDER_MUSIC_TRACKS", payload: newTracks });
    setDragIndex(null);
  };

  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("audio/")) return;
      
      const url = URL.createObjectURL(file);
      const newTrack: MusicTrack = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name.replace(/\.[^/.]+$/, ""),
        url,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_MUSIC_TRACK", payload: newTrack });
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMuteToggle = () => {
    if (hasActiveSound) {
      previousMixRef.current = { ...state.customMix };
      previousSceneRef.current = state.activeScene;
      dispatch({ type: "SET_SCENE", payload: null });
    } else {
      if (previousSceneRef.current && previousSceneRef.current !== "custom") {
        dispatch({ type: "SET_SCENE", payload: previousSceneRef.current });
      } else if (Object.keys(previousMixRef.current).length > 0) {
        dispatch({ type: "SET_CUSTOM_MIX", payload: previousMixRef.current });
        dispatch({ type: "SET_SCENE", payload: "custom" });
      }
    }
  };

  const handleSceneSelect = (sceneId: string) => {
    if (state.activeScene === sceneId) {
      dispatch({ type: "SET_SCENE", payload: null });
    } else {
      dispatch({ type: "SET_SCENE", payload: sceneId });
    }
  };

  const handleMixerToggle = (soundId: string) => {
    const newMix = { ...state.customMix };
    if (newMix[soundId] && newMix[soundId] > 0) {
      delete newMix[soundId];
    } else {
      newMix[soundId] = 0.5;
    }
    dispatch({ type: "SET_CUSTOM_MIX", payload: newMix });
    dispatch({ type: "SET_SCENE", payload: "custom" });
  };

  const handleMixerVolume = (soundId: string, volume: number) => {
    const newMix = { ...state.customMix };
    if (volume <= 0.01) {
      delete newMix[soundId];
    } else {
      newMix[soundId] = volume;
    }
    dispatch({ type: "SET_CUSTOM_MIX", payload: newMix });
  };

  const handlePlayMusic = (trackId: string) => {
    if (state.currentMusicId === trackId && state.isMusicPlaying) {
      dispatch({ type: "PAUSE_MUSIC" });
    } else {
      dispatch({ type: "PLAY_MUSIC", payload: trackId });
    }
  };

  const handleDeleteTrack = (trackId: string) => {
    if (confirm("确定要删除这首音乐吗？")) {
      dispatch({ type: "DELETE_MUSIC_TRACK", payload: trackId });
    }
  };

  const handleRenameTrack = (trackId: string, newName: string) => {
    dispatch({ type: "UPDATE_MUSIC_TRACK", payload: { id: trackId, name: newName } });
  };

  const getModeLabel = () => {
    if (state.isMusicPlaying && state.currentMusicId) return "🎵 音乐";
    if (state.activeScene) return "🎧 " + SOUND_SCENES.find(s => s.id === state.activeScene)?.name || "";
    if (activeSoundCount > 0) return `🎚️ 混音 (${activeSoundCount})`;
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Music size={14} className="text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800">环境音效</h3>
            {getModeLabel() && <p className="text-[10px] text-purple-600 truncate">{getModeLabel()}</p>}
          </div>
        </div>
        <button onClick={handleMuteToggle} className={`p-1.5 rounded-lg transition-colors ${hasActiveSound ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
          {hasActiveSound ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-1 mb-2 bg-gray-100 rounded-lg p-0.5 shrink-0">
        <button onClick={() => setMode("scenes")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "scenes" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          <Sparkles size={11} /> 场景
        </button>
        <button onClick={() => setMode("mixer")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "mixer" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          <Sliders size={11} /> 混音
        </button>
        <button onClick={() => setMode("music")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "music" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          <ListMusic size={11} /> 音乐
        </button>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto pr-0.5 min-h-0">
        {mode === "scenes" ? (
          <div className="space-y-1.5">
            {SOUND_SCENES.map((scene) => (
              <button
                key={scene.id}
                onClick={() => handleSceneSelect(scene.id)}
                className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${state.activeScene === scene.id ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}
              >
                <span className="text-lg">{SCENE_ICONS[scene.id]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{scene.name}</div>
                  <div className="text-[10px] opacity-70 leading-tight line-clamp-2">{scene.description}</div>
                </div>
                {state.activeScene === scene.id && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[0, 1, 2].map((i) => <div key={i} className="w-0.5 h-3 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : mode === "mixer" ? (
          <div className="space-y-0.5">
            {INDIVIDUAL_SOUNDS.map((sound) => {
              const isActive = (state.customMix[sound.id] || 0) > 0;
              const volume = state.customMix[sound.id] || 0;
              return (
                <div key={sound.id} className="flex items-center gap-1.5 py-0.5 px-1 rounded-lg hover:bg-gray-50">
                  <button onClick={() => handleMixerToggle(sound.id)} className={`shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all ${isActive ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"}`}>
                    <span className="text-xs">{SOUND_ICONS[sound.id]}</span>
                  </button>
                  <span className={`text-xs w-12 whitespace-nowrap ${isActive ? "font-medium text-gray-800" : "text-gray-500"}`}>{sound.name}</span>
                  <CustomSlider value={volume} onChange={(v) => handleMixerVolume(sound.id, v)} />
                  <span className="text-[10px] text-gray-400 w-7 text-right">{Math.round(volume * 100)}%</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {/* 上传按钮 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all"
            >
              <Upload size={16} />
              <span className="text-xs font-medium">添加本地音乐</span>
            </button>

            {/* 播放控制 */}
            {state.musicTracks.length > 0 && (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1">
                  <button 
                    onClick={playPrevious}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-purple-600"
                    title="上一首"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={playNext}
                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-purple-600"
                    title="下一首"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <RepeatModeButton mode={repeatMode} onChange={setRepeatMode} />
              </div>
            )}

            {/* 音乐列表 */}
            <div className="space-y-0.5">
              {state.musicTracks.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-xs">
                  还没有音乐，点击上方添加
                </div>
              ) : (
                state.musicTracks.map((track, index) => (
                  <MusicTrackItem
                    key={track.id}
                    track={track}
                    index={index}
                    isPlaying={state.isMusicPlaying}
                    isCurrent={state.currentMusicId === track.id}
                    onPlay={() => handlePlayMusic(track.id)}
                    onDelete={() => handleDeleteTrack(track.id)}
                    onRename={(name) => handleRenameTrack(track.id, name)}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部音量控制 */}
      <div className="shrink-0 pt-2 mt-2 border-t border-gray-200">
        {mode === "music" ? (
          <div className="flex items-center gap-2">
            <VolumeX size={12} className="text-gray-400 shrink-0" />
            <div className="flex-1 h-4 flex items-center">
              <CustomSlider value={volume} onChange={setVolume} />
            </div>
            <Volume2 size={12} className="text-gray-400 shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <VolumeX size={12} className="text-gray-400 shrink-0" />
            <div className="flex-1 h-4 flex items-center">
              <CustomSlider value={state.masterVolume} onChange={(v) => dispatch({ type: "SET_MASTER_VOLUME", payload: v })} />
            </div>
            <Volume2 size={12} className="text-gray-400 shrink-0" />
          </div>
        )}
      </div>
    </div>
  );
}
