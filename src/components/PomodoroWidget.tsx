import React, { useState, useEffect, useRef } from "react";
import { useQuestStore } from "../store/useQuestStore";
import { retroAudio } from "../utils/audio";
import { Play, Pause, RotateCcw, Timer, Link2, Sparkles, TestTube } from "lucide-react";

export const PomodoroWidget: React.FC = () => {
  const { tasks, selectedDate, incrementPoms } = useQuestStore();

  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [linkedTaskId, setLinkedTaskId] = useState<string>("");
  const [testMode, setTestMode] = useState(false);

  const intervalRef = useRef<any>(null);

  // Focus: 25 min default (or 10s if testMode)
  // Break: 5 min default (or 5s if testMode)
  const getDuration = (timerMode: "focus" | "break") => {
    if (testMode) {
      return timerMode === "focus" ? 10 : 5;
    }
    return timerMode === "focus" ? 25 * 60 : 5 * 60;
  };

  // Reset timer when mode or testMode changes
  useEffect(() => {
    setSecondsLeft(getDuration(mode));
    if (isRunning) {
      setIsRunning(false);
    }
  }, [mode, testMode]);

  // Main countdown logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, linkedTaskId]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    retroAudio.playTimerEnd();

    if (mode === "focus") {
      // If a task is linked, increment its pom count
      if (linkedTaskId) {
        incrementPoms(linkedTaskId);
      }
      // Toggle to break
      setMode("break");
    } else {
      // Toggle back to focus
      setMode("focus");
    }
  };

  const handleToggleStart = () => {
    // Resume context if suspended
    retroAudio.playTone(0, "sine", 0.001, 0); 
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(getDuration(mode));
  };

  // Filter tasks that are due today and not completed (or completed is fine to link to)
  const todayTasks = tasks.filter((t) => t.dueDate === selectedDate);

  // Formatter for MM:SS
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const percentage = (secondsLeft / getDuration(mode)) * 100;

  return (
    <div className="theme-transition bg-theme-card border border-theme-border rounded-xl p-5 shadow-md w-full h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-base text-theme-primary flex items-center space-x-2">
            <Timer className="w-5 h-5" />
            <span>Focus Hourglass</span>
          </h3>

          {/* Test Mode Toggler */}
          <button
            onClick={() => setTestMode(!testMode)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
              testMode
                ? "bg-purple-500/20 border-purple-400 text-purple-400"
                : "bg-theme-bg border-theme-border/60 text-theme-muted hover:border-theme-primary/40"
            }`}
            title="Toggle fast 10-second timer to test triggers"
          >
            <TestTube className="w-3 h-3" />
            <span>Test Mode</span>
          </button>
        </div>

        {/* TIMER MODE CHIPS */}
        <div className="grid grid-cols-2 gap-2 bg-theme-bg p-1 rounded-lg border border-theme-border/60 mb-5">
          <button
            onClick={() => setMode("focus")}
            className={`py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === "focus"
                ? "bg-theme-primary text-theme-bg shadow-sm"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Focus Sprint
          </button>
          <button
            onClick={() => setMode("break")}
            className={`py-1.5 rounded-md text-xs font-bold transition-all ${
              mode === "break"
                ? "bg-theme-primary text-theme-bg shadow-sm"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            Tavern Rest
          </button>
        </div>

        {/* DISPLAY TIMER */}
        <div className="text-center py-6 relative">
          <div className="text-4xl font-extrabold font-mono tracking-wider text-theme-text mb-2">
            {formatTime(secondsLeft)}
          </div>
          <p className="text-[10px] text-theme-muted font-bold tracking-widest uppercase">
            {mode === "focus" ? "⚔️ FOCUS IN PROGRESS ⚔️" : "🍺 DRINK & RESTORE XP 🍺"}
          </p>

          {/* Circular progress bar line indicator */}
          <div className="w-full bg-theme-bg h-1.5 rounded-full overflow-hidden mt-4 border border-theme-border/20">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                mode === "focus" ? "bg-theme-primary" : "bg-emerald-500"
              }`}
              style={{ width: `${100 - percentage}%` }}
            />
          </div>
        </div>

        {/* TASK LINK SELECTOR */}
        <div className="mt-2 text-left">
          <label className="text-[10px] font-black text-theme-muted uppercase tracking-wider mb-1 flex items-center space-x-1">
            <Link2 className="w-3.5 h-3.5" />
            <span>Link to Quest</span>
          </label>
          <select
            value={linkedTaskId}
            onChange={(e) => setLinkedTaskId(e.target.value)}
            className="w-full bg-theme-bg text-theme-text border border-theme-border rounded px-2.5 py-2 text-xs outline-none focus:border-theme-primary cursor-pointer truncate"
          >
            <option value="">-- No Quest Linked --</option>
            {todayTasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.points} pt)
              </option>
            ))}
          </select>
          {linkedTaskId && (
            <p className="text-[9px] text-purple-400 mt-1 flex items-center space-x-1 font-bold">
              <Sparkles className="w-3 h-3" />
              <span>Completing focuses will record "poms" on this quest!</span>
            </p>
          )}
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex items-center space-x-2 mt-5">
        <button
          onClick={handleToggleStart}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-md font-bold text-xs shadow-md transition-all active:scale-95 ${
            isRunning
              ? "bg-amber-500 text-white hover:bg-amber-600"
              : "bg-theme-primary text-theme-bg hover:opacity-90"
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Focus</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Focus</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="bg-theme-bg border border-theme-border text-theme-text p-2.5 rounded-md hover:border-theme-primary active:scale-95 transition-all shadow-sm"
          title="Reset timer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
