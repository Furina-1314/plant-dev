import { useGame, type MusicTrack } from "@/contexts/GameContext";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { useRef, useState } from "react";
import { Upload, Play, Pause, SkipBack, SkipForward, ChevronDown, ChevronUp, ListMusic, Repeat, Repeat1 } from "lucide-react";

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "00:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function MusicPanel() {
  const { state, dispatch } = useGame();
  const { currentTrack, isPlaying, togglePlay, playNext, playPrevious, repeatMode, setRepeatMode, currentTime, duration, seekTo } = useMusicPlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expanded, setExpanded] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const tracks: MusicTrack[] = [];
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("audio/")) return;
      tracks.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
        createdAt: new Date().toISOString(),
      });
    });

    tracks.forEach((track) => dispatch({ type: "ADD_MUSIC_TRACK", payload: track }));

    if (!state.currentMusicId && tracks.length > 0) {
      dispatch({ type: "PLAY_MUSIC", payload: tracks[0].id });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRepeatToggle = () => {
    if (repeatMode === "none") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("none");
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white">
            <ListMusic size={14} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-800">本地音乐</h3>
            <p className="text-[10px] text-gray-500 truncate">{currentTrack?.name ?? "未选择音乐"}</p>
          </div>
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100" title="导入本地音乐">
          <Upload size={14} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept="audio/*" multiple onChange={handleFileUpload} className="hidden" />

      <div className="mb-2">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={Math.min(currentTime, duration || 0)}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-[10px] text-gray-500 -mt-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <button onClick={playPrevious} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600" title="上一首">
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => {
              if (!currentTrack && state.musicTracks.length > 0) {
                dispatch({ type: "PLAY_MUSIC", payload: state.musicTracks[0].id });
                return;
              }
              if (currentTrack) togglePlay(currentTrack.id);
            }}
            className="w-8 h-8 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white flex items-center justify-center"
            title="播放/暂停"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>
          <button onClick={playNext} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600" title="下一首">
            <SkipForward size={16} />
          </button>
        </div>

        <button onClick={handleRepeatToggle} className="px-2 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-100 flex items-center gap-1" title="切换循环模式">
          {repeatMode === "one" ? <Repeat1 size={12} /> : <Repeat size={12} />}
          {repeatMode === "none" ? "顺序" : repeatMode === "all" ? "列表循环" : "单曲循环"}
        </button>
      </div>

      <button onClick={() => setExpanded((v) => !v)} className="w-full py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-600 flex items-center justify-center gap-1">
        播放列表 ({state.musicTracks.length})
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {expanded && (
        <div className="mt-2 max-h-36 overflow-y-auto space-y-1 pr-0.5">
          {state.musicTracks.length === 0 ? (
            <div className="text-center text-xs text-gray-400 py-3">请先导入本地音乐文件</div>
          ) : (
            state.musicTracks.map((track) => (
              <button
                key={track.id}
                onClick={() => dispatch({ type: "PLAY_MUSIC", payload: track.id })}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg truncate ${state.currentMusicId === track.id ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-50 text-gray-700"}`}
              >
                {track.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
