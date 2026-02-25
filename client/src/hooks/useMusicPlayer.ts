import { useEffect, useRef, useCallback } from "react";
import { useGame } from "@/contexts/GameContext";

export function useMusicPlayer() {
  const { state, dispatch } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
        audioRef.current = null;
      }
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = state.musicVolume;
    }
  }, [state.musicVolume]);

  // Handle track ended - play next based on repeat mode
  useEffect(() => {
    if (!audioRef.current) return;

    const handleEnded = () => {
      const { musicTracks, currentMusicId, musicRepeatMode } = state;
      
      if (!currentMusicId || musicTracks.length === 0) {
        dispatch({ type: "PAUSE_MUSIC" });
        return;
      }

      const currentIndex = musicTracks.findIndex((t) => t.id === currentMusicId);
      
      if (musicRepeatMode === "one") {
        // 单曲循环：重新播放当前
        audioRef.current!.currentTime = 0;
        audioRef.current!.play().catch(() => dispatch({ type: "PAUSE_MUSIC" }));
      } else if (musicRepeatMode === "all") {
        // 列表循环：播放下一首，到末尾回到第一首
        const nextIndex = (currentIndex + 1) % musicTracks.length;
        dispatch({ type: "PLAY_MUSIC", payload: musicTracks[nextIndex].id });
      } else {
        // 顺序播放：播放下一首，到末尾停止
        const nextIndex = currentIndex + 1;
        if (nextIndex < musicTracks.length) {
          dispatch({ type: "PLAY_MUSIC", payload: musicTracks[nextIndex].id });
        } else {
          dispatch({ type: "PAUSE_MUSIC" });
        }
      }
    };

    audioRef.current.addEventListener("ended", handleEnded);
    return () => {
      audioRef.current?.removeEventListener("ended", handleEnded);
    };
  }, [state.musicTracks, state.currentMusicId, state.musicRepeatMode, dispatch]);

  // Handle play/pause and track changes
  useEffect(() => {
    if (!audioRef.current) return;

    const currentTrack = state.musicTracks.find((t) => t.id === state.currentMusicId);

    if (state.isMusicPlaying && currentTrack) {
      if (audioRef.current.src !== currentTrack.url) {
        audioRef.current.src = currentTrack.url;
        audioRef.current.load();
      }
      audioRef.current.play().catch(() => {
        dispatch({ type: "PAUSE_MUSIC" });
      });
    } else {
      audioRef.current.pause();
    }
  }, [state.isMusicPlaying, state.currentMusicId, state.musicTracks, dispatch]);

  const playTrack = useCallback((trackId: string | null) => {
    dispatch({ type: "PLAY_MUSIC", payload: trackId });
  }, [dispatch]);

  const pauseTrack = useCallback(() => {
    dispatch({ type: "PAUSE_MUSIC" });
  }, [dispatch]);

  const togglePlay = useCallback((trackId: string) => {
    if (state.currentMusicId === trackId && state.isMusicPlaying) {
      pauseTrack();
    } else {
      playTrack(trackId);
    }
  }, [state.currentMusicId, state.isMusicPlaying, playTrack, pauseTrack]);

  const playNext = useCallback(() => {
    const { musicTracks, currentMusicId } = state;
    if (!currentMusicId || musicTracks.length === 0) return;
    
    const currentIndex = musicTracks.findIndex((t) => t.id === currentMusicId);
    const nextIndex = (currentIndex + 1) % musicTracks.length;
    dispatch({ type: "PLAY_MUSIC", payload: musicTracks[nextIndex].id });
  }, [state.musicTracks, state.currentMusicId, dispatch]);

  const playPrevious = useCallback(() => {
    const { musicTracks, currentMusicId } = state;
    if (!currentMusicId || musicTracks.length === 0) return;
    
    const currentIndex = musicTracks.findIndex((t) => t.id === currentMusicId);
    const prevIndex = currentIndex === 0 ? musicTracks.length - 1 : currentIndex - 1;
    dispatch({ type: "PLAY_MUSIC", payload: musicTracks[prevIndex].id });
  }, [state.musicTracks, state.currentMusicId, dispatch]);

  return {
    playTrack,
    pauseTrack,
    togglePlay,
    playNext,
    playPrevious,
    currentTrack: state.musicTracks.find((t) => t.id === state.currentMusicId),
    isPlaying: state.isMusicPlaying,
    volume: state.musicVolume,
    setVolume: (v: number) => dispatch({ type: "SET_MUSIC_VOLUME", payload: v }),
    repeatMode: state.musicRepeatMode,
    setRepeatMode: (mode: "none" | "all" | "one") => dispatch({ type: "SET_MUSIC_REPEAT_MODE", payload: mode }),
  };
}
