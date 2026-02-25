import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Wind, X, Play } from "lucide-react";

type Phase = "inhale" | "hold" | "exhale" | "idle";

const PHASES: { phase: Phase; duration: number; label: string }[] = [
  { phase: "inhale", duration: 4, label: "吸气" },
  { phase: "hold", duration: 7, label: "屏息" },
  { phase: "exhale", duration: 8, label: "呼气" },
];

const PHASE_COLORS: Record<Phase, string> = {
  inhale: "oklch(0.72 0.12 180)",
  hold: "oklch(0.68 0.10 260)",
  exhale: "oklch(0.75 0.10 140)",
  idle: "oklch(0.80 0.05 200)",
};

interface BreathingGuideProps {
  isBreakTime: boolean;
  onClose?: () => void;
}

export default function BreathingGuide({ isBreakTime, onClose }: BreathingGuideProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<Phase>("idle");
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    timerRef.current = null;
    phaseTimerRef.current = null;
  }, []);

  const startBreathing = useCallback(() => {
    setIsActive(true);
    setCycles(0);
    setPhaseIndex(0);
    setCurrentPhase(PHASES[0].phase);
    setCountdown(PHASES[0].duration);
  }, []);

  const stopBreathing = useCallback(() => {
    clearTimers();
    setIsActive(false);
    setCurrentPhase("idle");
    setPhaseIndex(0);
    setCountdown(0);
  }, [clearTimers]);

  useEffect(() => {
    if (!isActive) return;

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setPhaseIndex((pi) => {
            const nextIndex = (pi + 1) % PHASES.length;
            if (nextIndex === 0) {
              setCycles((c) => c + 1);
            }
            setCurrentPhase(PHASES[nextIndex].phase);
            return nextIndex;
          });
          return PHASES[(phaseIndex + 1) % PHASES.length].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimers;
  }, [isActive, phaseIndex, clearTimers]);

  if (!isBreakTime && !isActive) return null;

  const currentLabel = PHASES.find((p) => p.phase === currentPhase)?.label || "准备";
  const circleScale = currentPhase === "inhale" ? 1.4 : currentPhase === "exhale" ? 0.8 : 1.1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-strong rounded-2xl p-5 text-center"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wind size={14} className="text-primary" />
            <h3 className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
              呼吸冥想
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={12} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {!isActive ? (
          <div className="py-4">
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              4-7-8 呼吸法：吸气4秒 → 屏息7秒 → 呼气8秒
            </p>
            <p className="text-[10px] text-muted-foreground/60 mb-4">
              帮助你在休息时快速放松，恢复精力
            </p>
            <button
              onClick={startBreathing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
                         bg-primary/15 text-primary text-xs font-medium
                         hover:bg-primary/25 transition-all"
            >
              <Play size={12} />
              开始冥想
            </button>
          </div>
        ) : (
          <div className="py-2">
<div className="relative w-32 h-32 mx-auto mb-4 flex items-center justify-center">
<motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  scale: circleScale * 1.15,
                  opacity: [0.15, 0.25, 0.15],
                }}
                transition={{
                  scale: { duration: PHASES[phaseIndex].duration, ease: "easeInOut" },
                  opacity: { duration: 2, repeat: Infinity },
                }}
                style={{ background: `radial-gradient(circle, ${PHASE_COLORS[currentPhase]}40, transparent)` }}
              />
<motion.div
                className="w-24 h-24 rounded-full flex items-center justify-center"
                animate={{ scale: circleScale }}
                transition={{ duration: PHASES[phaseIndex].duration, ease: "easeInOut" }}
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${PHASE_COLORS[currentPhase]}60, ${PHASE_COLORS[currentPhase]}30)`,
                  boxShadow: `0 0 30px ${PHASE_COLORS[currentPhase]}30`,
                }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                    {countdown}
                  </div>
                  <div className="text-[10px] font-medium mt-0.5">{currentLabel}</div>
                </div>
              </motion.div>
            </div>
<div className="flex items-center justify-center gap-3 mb-3">
              {PHASES.map((p, i) => (
                <div
                  key={p.phase}
                  className={`flex items-center gap-1 text-[9px] transition-all
                    ${i === phaseIndex ? "text-foreground font-medium" : "text-muted-foreground/40"}
                  `}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-all
                      ${i === phaseIndex ? "bg-primary" : "bg-border/30"}
                    `}
                  />
                  {p.label} {p.duration}s
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="text-[9px] text-muted-foreground">
                已完成 {cycles} 个循环
              </span>
              <button
                onClick={stopBreathing}
                className="text-[10px] text-destructive/70 hover:text-destructive transition-colors"
              >
                结束
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
