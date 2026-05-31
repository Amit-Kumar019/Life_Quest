import React, { useState } from "react";
import { useQuestStore } from "../store/useQuestStore";
import type { Task, SubTask } from "../store/useQuestStore";
import { getTaskBreakdown } from "../utils/mockAi";
import {
  Sparkles,
  Plus,
  Trash2,
  Calendar,
  Sword,
  Loader2,
  HelpCircle,
  Trophy,
} from "lucide-react";

export const DailyView: React.FC = () => {
  const {
    tasks,
    selectedDate,
    conqueredDates,
    addTask,
    toggleTask,
    deleteTask,
    updateSubtasks,
    toggleSubtask,
  } = useQuestStore();

  // Task creation local state
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(1);
  const [dueDate, setDueDate] = useState(selectedDate);
  
  // Loading state for AI breakdown of tasks (key is taskId)
  const [loadingBreakdown, setLoadingBreakdown] = useState<Record<string, boolean>>({});

  // Filter tasks for the selected date
  const selectedTasks = tasks.filter((t) => t.dueDate === selectedDate);

  // Calculate current score
  let completedPoints = 0;
  selectedTasks.forEach((t) => {
    if (t.subTasks && t.subTasks.length > 0) {
      completedPoints += t.subTasks.filter((st) => st.completed).length;
    } else if (t.completed) {
      completedPoints += t.points;
    }
  });

  const isConquered = completedPoints >= 10 || conqueredDates.includes(selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title.trim(), points, dueDate);
    setTitle("");
    setPoints(1);
  };

  const handleAiBreakdown = async (task: Task) => {
    setLoadingBreakdown((prev) => ({ ...prev, [task.id]: true }));
    try {
      const steps = await getTaskBreakdown(task.title);
      const subTasks: SubTask[] = steps.map((step) => ({
        id: Math.random().toString(36).substring(2, 9),
        title: step,
        completed: false,
      }));
      updateSubtasks(task.id, subTasks);
    } catch (err) {
      console.error("Failed task breakdown:", err);
    } finally {
      setLoadingBreakdown((prev) => ({ ...prev, [task.id]: false }));
    }
  };

  const getFriendlyDateHeader = () => {
    const today = new Date().toISOString().split("T")[0];
    const target = new Date(selectedDate + "T00:00:00");
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "short", day: "numeric" };
    const dateStr = target.toLocaleDateString(undefined, options);

    if (selectedDate === today) {
      return `Today's Quests (${dateStr})`;
    }
    return `Quests for ${dateStr}`;
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* HEADER PROGRESS BAR CARD */}
      <div className="theme-transition bg-theme-card/80 backdrop-blur-md border border-theme-border rounded-xl p-5 shadow-md">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-theme-text m-0 p-0 text-left">
              {getFriendlyDateHeader()}
            </h1>
            <p className="text-xs text-theme-muted text-left">
              Fulfill quests to earn gold and level up your character
            </p>
          </div>
          
          {isConquered ? (
            <div className="flex items-center space-x-2 bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 px-3 py-1.5 rounded-full font-bold text-xs animate-bounce shadow-md">
              <Trophy className="w-4 h-4 fill-yellow-500" />
              <span>CONQUERED!</span>
            </div>
          ) : (
            <div className="bg-theme-bg text-theme-muted border border-theme-border/60 px-3 py-1.5 rounded-full font-bold text-xs">
              Goal: 10 pts ({completedPoints}/10)
            </div>
          )}
        </div>

        {/* Gamified progress bar */}
        <div className="relative w-full bg-theme-bg h-6 rounded-full overflow-hidden border border-theme-border/60 shadow-inner flex items-center justify-center">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ease-out ${
              isConquered ? "bg-yellow-500" : "bg-theme-primary"
            }`}
            style={{ width: `${Math.min(100, (completedPoints / 10) * 100)}%` }}
          />
          <span className="z-10 text-xs font-bold text-black">
            {completedPoints} / 10 Quest Points Completed
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* QUEST CREATOR FORM */}
        <div className="theme-transition bg-theme-card border border-theme-border rounded-xl p-5 shadow-md md:col-span-1 h-fit">
          <h3 className="font-bold text-base text-theme-primary mb-4 flex items-center space-x-2">
            <Sword className="w-5 h-5" />
            <span>Post New Quest</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-theme-muted mb-1 text-left">QUEST TITLE</label>
              <input
                type="text"
                placeholder="e.g., Study dragon scrolls, clean the chamber"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={80}
                className="w-full bg-theme-bg border border-theme-border rounded-md px-3 py-2 text-sm text-theme-text placeholder-theme-muted/60 focus:border-theme-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-muted mb-1 text-left">QUEST DIFFICULTY</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPoints(1)}
                  className={`py-2 rounded-md text-xs font-bold border transition-colors ${
                    points === 1
                      ? "bg-theme-primary/20 border-theme-primary text-theme-text"
                      : "bg-theme-bg border-theme-border/60 text-theme-muted hover:border-theme-primary/40"
                  }`}
                >
                  Easy/Quick (+1 pt)
                </button>
                <button
                  type="button"
                  onClick={() => setPoints(2)}
                  className={`py-2 rounded-md text-xs font-bold border transition-colors ${
                    points === 2
                      ? "bg-theme-primary/20 border-theme-primary text-theme-text"
                      : "bg-theme-bg border-theme-border/60 text-theme-muted hover:border-theme-primary/40"
                  }`}
                >
                  Medium/Hard (+2 pt)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-theme-muted mb-1 text-left">SCHEDULE DATE</label>
              <div className="flex items-center bg-theme-bg border border-theme-border rounded-md px-2 py-1.5">
                <Calendar className="w-4 h-4 text-theme-muted mr-2" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-transparent border-none text-sm text-theme-text outline-none focus:ring-0 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-theme-primary text-theme-bg py-2.5 rounded-md font-bold text-sm shadow-md hover:opacity-90 transition-all flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Accept Quest</span>
            </button>
          </form>
        </div>

        {/* QUESTS LIST */}
        <div className="theme-transition bg-theme-card border border-theme-border rounded-xl p-5 shadow-md md:col-span-2">
          <h3 className="font-bold text-base text-theme-primary mb-4 flex items-center space-x-2">
            <span>Quest Board</span>
          </h3>

          {selectedTasks.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-theme-border/60 rounded-xl bg-theme-bg/20">
              <HelpCircle className="w-12 h-12 text-theme-muted/50 mx-auto mb-3" />
              <p className="text-sm font-bold text-theme-text">No quests accepted for this day.</p>
              <p className="text-xs text-theme-muted mt-1">Use the scroll map above or add a new quest!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {selectedTasks.map((task) => {
                const hasSubtasks = task.subTasks && task.subTasks.length > 0;
                const isTaskLoading = loadingBreakdown[task.id];

                return (
                  <div
                    key={task.id}
                    className={`theme-transition p-4 rounded-xl border bg-theme-bg/40 ${
                      task.completed
                        ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                        : "border-theme-border/60 hover:border-theme-primary/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Left: Checkbox & Title */}
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {!hasSubtasks && (
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="mt-1 w-5 h-5 rounded border-theme-border text-theme-primary focus:ring-theme-primary cursor-pointer shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`font-semibold text-sm break-words text-left ${
                              task.completed ? "line-through text-theme-muted" : "text-theme-text"
                            }`}
                          >
                            {task.title}
                          </h4>
                          
                          {/* Point indicator */}
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-theme-border/60 text-theme-muted">
                              {hasSubtasks ? `${task.subTasks.length} Subtasks` : `${task.points} Quest Point${task.points > 1 ? "s" : ""}`}
                            </span>
                            {task.poms > 0 && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded flex items-center space-x-0.5">
                                ⏱️ {task.poms} Pom{task.poms > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: AI breakdown & Delete */}
                      <div className="flex items-center space-x-2 shrink-0">
                        {/* AI BREAKDOWN BUTTON (only for medium/hard tasks (2 pts) without subtasks already) */}
                        {task.points === 2 && !hasSubtasks && !task.completed && (
                          <button
                            onClick={() => handleAiBreakdown(task)}
                            disabled={isTaskLoading}
                            className="flex items-center space-x-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all disabled:opacity-50"
                            title="AI Guildmaster will break this large quest into smaller pieces"
                          >
                            {isTaskLoading ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Breaking...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>AI Break Down</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-theme-muted hover:text-red-400 p-1.5 rounded hover:bg-theme-bg transition-colors"
                          title="Delete Quest"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Sub-checklist rendering */}
                    {hasSubtasks && (
                      <div className="mt-4 pl-4 border-l-2 border-theme-border/60 space-y-2 text-left">
                        <div className="text-[10px] font-black uppercase text-theme-muted tracking-wider mb-1 flex items-center space-x-1">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>Guildmaster's Sub-Quests (+1 Pt Each)</span>
                        </div>
                        {task.subTasks.map((sub) => (
                          <label
                            key={sub.id}
                            className={`flex items-start space-x-2.5 text-xs font-medium cursor-pointer py-0.5 ${
                              sub.completed ? "line-through text-theme-muted" : "text-theme-text"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={sub.completed}
                              onChange={() => toggleSubtask(task.id, sub.id)}
                              className="w-4 h-4 rounded border-theme-border text-theme-primary focus:ring-theme-primary mt-0.5 shrink-0"
                            />
                            <span>{sub.title}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
