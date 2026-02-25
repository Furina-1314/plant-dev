import { useEffect, useRef, useCallback, useState } from "react";
import { useGame } from "@/contexts/GameContext";

let sharedAudio: HTMLAudioElement | null = null;
let primaryMusicControllerAttached = false;

function getAudio() {
  if (!sharedAudio) {
    sharedAudio = new Audio();
    sharedAudio.preload = "metadata";
  }
  return sharedAudio;
}

export function useMusicPlayer() {
  const { state, dispatch } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const isPrimaryControllerRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const readAudioProgress = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
    const nextTime = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    setDuration(nextDuration);
    setCurrentTime(nextTime);
  }, []);

  useEffect(() => {
    audioRef.current = getAudio();
  }, []);

  useEffect(() => {
    if (!primaryMusicControllerAttached) {
      primaryMusicControllerAttached = true;
      isPrimaryControllerRef.current = true;
    }

    return () => {
      if (isPrimaryControllerRef.current) {
        primaryMusicControllerAttached = false;
      }
    };
  }, []);

  useEffect(() => {
    if (!isPrimaryControllerRef.current) return;
    if (!audioRef.current) return;
    audioRef.current.volume = state.musicVolume;
  }, [state.musicVolume]);

  useEffect(() => {
    if (!audioRef.current) return;

    // 初始化当前显示，避免面板首次打开时进度条不同步
    readAudioProgress();

    const handleTimeUpdate = () => readAudioProgress();
    const handleLoadedMetadata = () => readAudioProgress();
    const handleDurationChange = () => readAudioProgress();

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("durationchange", handleDurationChange);

    return () => {
      audioRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      audioRef.current?.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current?.removeEventListener("durationchange", handleDurationChange);
    };
  }, [readAudioProgress]);

  useEffect(() => {
    if (!state.isMusicPlaying) return;

    let frame = 0;
    const tick = () => {
      readAudioProgress();
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [state.isMusicPlaying, readAudioProgress]);

  useEffect(() => {
    if (!isPrimaryControllerRef.current) return;
    if (!audioRef.current) return;

    const handleEnded = () => {
      const { musicTracks, currentMusicId, musicRepeatMode } = state;

      if (!currentMusicId || musicTracks.length === 0) {
        dispatch({ type: "PAUSE_MUSIC" });
        return;
      }

      const currentIndex = musicTracks.findIndex((t) => t.id === currentMusicId);
      if (currentIndex < 0) {
        dispatch({ type: "PAUSE_MUSIC" });
        return;
      }

      if (musicRepeatMode === "one") {
        audioRef.current!.currentTime = 0;
        audioRef.current!.play().catch(() => dispatch({ type: "PAUSE_MUSIC" }));
      } else if (musicRepeatMode === "all") {
        const nextIndex = (currentIndex + 1) % musicTracks.length;
        dispatch({ type: "PLAY_MUSIC", payload: musicTracks[nextIndex].id });
      } else {
        const nextIndex = currentIndex + 1;
        if (nextIndex < musicTracks.length) {
          dispatch({ type: "PLAY_MUSIC", payload: musicTracks[nextIndex].id });
        } else {
          dispatch({ type: "PAUSE_MUSIC" });
        }
      }
    };

    const handleError = () => {
      dispatch({ type: "PAUSE_MUSIC" });
      readAudioProgress();
    };

    audioRef.current.addEventListener("ended", handleEnded);
    audioRef.current.addEventListener("error", handleError);

    return () => {
      audioRef.current?.removeEventListener("ended", handleEnded);
      audioRef.current?.removeEventListener("error", handleError);
    };
  }, [state.musicTracks, state.currentMusicId, state.musicRepeatMode, dispatch, readAudioProgress]);

  useEffect(() => {
    if (!isPrimaryControllerRef.current) return;
    if (!audioRef.current) return;

    const currentTrack = state.musicTracks.find((t) => t.id === state.currentMusicId);

    if (state.isMusicPlaying && !currentTrack && state.musicTracks.length > 0) {
      dispatch({ type: "PLAY_MUSIC", payload: state.musicTracks[0].id });
      return;
    }

    if (state.isMusicPlaying && currentTrack) {
      if (loadedTrackIdRef.current !== currentTrack.id) {
        loadedTrackIdRef.current = currentTrack.id;
        setCurrentTime(0);
        setDuration(0);
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
    if (musicTracks.length === 0) return;
    if (!currentMusicId) {
      dispatch({ type: "PLAY_MUSIC", payload: musicTracks[0].id });
      return;
    }

    const currentIndex = musicTracks.findIndex((t) => t.id === currentMusicId);
    const nextIndex = (Math.max(0, currentIndex) + 1) % musicTracks.length;
    dispatch({ type: "PLAY_MUSIC", payload: musicTracks[nextIndex].id });
  }, [state.musicTracks, state.currentMusicId, dispatch]);

  const playPrevious = useCallback(() => {
    const { musicTracks, currentMusicId } = state;
    if (musicTracks.length === 0) return;
    if (!currentMusicId) {
      dispatch({ type: "PLAY_MUSIC", payload: musicTracks[0].id });
      return;
    }

    const currentIndex = musicTracks.findIndex((t) => t.id === currentMusicId);
    const prevIndex = currentIndex <= 0 ? musicTracks.length - 1 : currentIndex - 1;
    dispatch({ type: "PLAY_MUSIC", payload: musicTracks[prevIndex].id });
  }, [state.musicTracks, state.currentMusicId, dispatch]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    readAudioProgress();
  }, [readAudioProgress]);

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
    currentTime,
    duration,
    seekTo,
  };
}
