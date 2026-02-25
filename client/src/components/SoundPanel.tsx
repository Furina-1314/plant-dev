import { useGame, SOUND_SCENES, INDIVIDUAL_SOUNDS } from "@/contexts/GameContext";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { Volume2, VolumeX, Sliders, Sparkles, Music } from "lucide-react";
import { useState, useRef, useCallback } from "react";

type Mode = "scenes" | "mixer";

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

export default function SoundPanel() {
  const { state, dispatch } = useGame();
  const [mode, setMode] = useState<Mode>("scenes");
  const previousMixRef = useRef<Record<string, number>>({});
  const previousSceneRef = useRef<string | null>(null);

  useAudioEngine(state.customMix, state.masterVolume);

  const hasActiveSound = Object.values(state.customMix).some((v) => v > 0);
  const activeSoundCount = Object.values(state.customMix).filter((v) => v > 0).length;

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
    if (state.activeScene === sceneId) dispatch({ type: "SET_SCENE", payload: null });
    else dispatch({ type: "SET_SCENE", payload: sceneId });
  };

  const handleMixerToggle = (soundId: string) => {
    const newMix = { ...state.customMix };
    if (newMix[soundId] && newMix[soundId] > 0) delete newMix[soundId];
    else newMix[soundId] = 0.5;
    dispatch({ type: "SET_CUSTOM_MIX", payload: newMix });
    dispatch({ type: "SET_SCENE", payload: "custom" });
  };

  const handleMixerVolume = (soundId: string, volume: number) => {
    const newMix = { ...state.customMix };
    if (volume <= 0.01) delete newMix[soundId];
    else newMix[soundId] = volume;
    dispatch({ type: "SET_CUSTOM_MIX", payload: newMix });
  };

  const getModeLabel = () => {
    if (state.activeScene) return "🎧 " + (SOUND_SCENES.find((s) => s.id === state.activeScene)?.name || "");
    if (activeSoundCount > 0) return `🎚️ 混音 (${activeSoundCount})`;
    return null;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg h-full flex flex-col">
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

      <div className="flex gap-1 mb-2 bg-gray-100 rounded-lg p-0.5 shrink-0">
        <button onClick={() => setMode("scenes")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "scenes" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          <Sparkles size={11} /> 场景
        </button>
        <button onClick={() => setMode("mixer")} className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium transition-all ${mode === "mixer" ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"}`}>
          <Sliders size={11} /> 混音
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5 min-h-0">
        {mode === "scenes" ? (
          <div className="space-y-1.5">
            {SOUND_SCENES.map((scene) => (
              <button key={scene.id} onClick={() => handleSceneSelect(scene.id)} className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${state.activeScene === scene.id ? "bg-purple-100 text-purple-700 ring-1 ring-purple-300" : "bg-gray-50 hover:bg-gray-100 text-gray-700"}`}>
                <span className="text-lg">{SCENE_ICONS[scene.id]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{scene.name}</div>
                  <div className="text-[10px] opacity-70 leading-tight line-clamp-2">{scene.description}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
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
        )}
      </div>

      <div className="shrink-0 pt-2 mt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <VolumeX size={12} className="text-gray-400 shrink-0" />
          <div className="flex-1 h-4 flex items-center">
            <CustomSlider value={state.masterVolume} onChange={(v) => dispatch({ type: "SET_MASTER_VOLUME", payload: v })} />
          </div>
          <Volume2 size={12} className="text-gray-400 shrink-0" />
        </div>
      </div>
    </div>
  );
}
