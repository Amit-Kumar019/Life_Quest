import { create } from "zustand";
import { persist } from "zustand/middleware";
import { retroAudio } from "../utils/audio";

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  points: number; // 1 (easy) or 2 (medium/hard)
  completed: boolean;
  dueDate: string; // YYYY-MM-DD
  subTasks: SubTask[];
  poms: number; // Track pomodoros spent
}

interface QuestState {
  tasks: Task[];
  conqueredDates: string[]; // Dates where daily points >= 10
  protectedDates: string[]; // Gaps saved by Streak Shield
  currentStreak: number;
  longestStreak: number;
  lastConqueredDate: string | null;
  gold: number;
  shieldsCount: number;
  unlockedAvatars: string[];
  activeAvatar: string;
  activeTheme: "rpg" | "cyberpunk" | "pastel" | "minimal" | "void";
  unlockedThemes: string[];
  selectedDate: string; // YYYY-MM-DD
  isDarkMode: boolean;

  // Actions
  addTask: (title: string, points: number, dueDate?: string) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateSubtasks: (taskId: string, subTasks: SubTask[]) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  incrementPoms: (taskId: string) => void;
  setSelectedDate: (date: string) => void;
  setTheme: (theme: QuestState["activeTheme"]) => void;
  buyShield: () => boolean;
  buyAvatar: (avatar: string, cost: number) => boolean;
  buyTheme: (theme: QuestState["activeTheme"], cost: number) => boolean;
  selectAvatar: (avatar: string) => void;
  checkStreakBreak: (todayStr: string) => void;
  testSetPointsForDate: (date: string, points: number) => void; // For manual testing / verification
  clearAllData: () => void;
  toggleDarkMode: () => void;
}

// Helper to calculate date difference in days
const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1 + "T00:00:00");
  const d2 = new Date(date2 + "T00:00:00");
  const diffTime = d1.getTime() - d2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

// Helper to get day offset string
const getOffsetDateString = (baseDateStr: string, offsetDays: number): string => {
  const d = new Date(baseDateStr + "T00:00:00");
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};

// Helper to calculate the current consecutive streak deterministically walking backward
const calculateStreak = (conquered: string[], protectedDays: string[]): number => {
  if (conquered.length === 0) return 0;
  const todayStr = new Date().toISOString().split("T")[0];
  const allActiveDates = new Set([...conquered, ...protectedDays]);

  let checkDate = todayStr;
  if (!allActiveDates.has(todayStr)) {
    const yesterdayStr = getOffsetDateString(todayStr, -1);
    if (allActiveDates.has(yesterdayStr)) {
      checkDate = yesterdayStr;
    } else {
      return 0; // Today and yesterday are not conquered, streak is broken
    }
  }

  let streak = 0;
  while (allActiveDates.has(checkDate)) {
    streak++;
    checkDate = getOffsetDateString(checkDate, -1);
  }
  return streak;
};

export const useQuestStore = create<QuestState>()(
  persist(
    (set, get) => ({
      tasks: [],
      conqueredDates: [],
      protectedDates: [],
      currentStreak: 0,
      longestStreak: 0,
      lastConqueredDate: null,
      gold: 0,
      shieldsCount: 0,
      unlockedAvatars: ["Knight"],
      activeAvatar: "Knight",
      activeTheme: "rpg",
      unlockedThemes: ["rpg", "cyberpunk", "pastel", "minimal"],
      selectedDate: new Date().toISOString().split("T")[0],
      isDarkMode: true,

      addTask: (title, points, dueDate) => {
        const targetDate = dueDate || get().selectedDate;
        const newTask: Task = {
          id: Math.random().toString(36).substring(2, 9),
          title,
          points,
          completed: false,
          dueDate: targetDate,
          subTasks: [],
          poms: 0,
        };

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      toggleTask: (taskId) => {
        let earnedGold = 0;
        let playVictory = false;

        set((state) => {
          const updatedTasks = state.tasks.map((t) => {
            if (t.id === taskId) {
              const newCompleted = !t.completed;
              // If it has subtasks, they are either all completed or unchanged.
              // We earn points based on task value.
              if (newCompleted) {
                // Earn gold
                earnedGold = t.points * 10;
              } else {
                earnedGold = -t.points * 10;
              }
              return { ...t, completed: newCompleted };
            }
            return t;
          });

          // Re-calculate points for the date of the toggled task
          const task = state.tasks.find((t) => t.id === taskId);
          const taskDate = task ? task.dueDate : state.selectedDate;

          const dateTasks = updatedTasks.filter((t) => t.dueDate === taskDate);
          let datePoints = 0;
          dateTasks.forEach((t) => {
            if (t.subTasks.length > 0) {
              // Points come from completed subtasks
              datePoints += t.subTasks.filter((st) => st.completed).length;
            } else if (t.completed) {
              datePoints += t.points;
            }
          });

          const alreadyConquered = state.conqueredDates.includes(taskDate);
          let newConqueredDates = [...state.conqueredDates];
          let newLastConqueredDate = state.lastConqueredDate;

          if (datePoints >= 10 && !alreadyConquered) {
            newConqueredDates.push(taskDate);
            newLastConqueredDate = taskDate;
            playVictory = true;
          } else if (datePoints < 10 && alreadyConquered) {
            // Remove conquered state
            newConqueredDates = newConqueredDates.filter((d) => d !== taskDate);
            const sorted = [...newConqueredDates].sort();
            newLastConqueredDate = sorted[sorted.length - 1] || null;
          }

          // Recalculate streak deterministically walking backward
          const newCurrentStreak = calculateStreak(newConqueredDates, state.protectedDates);
          const newLongestStreak = Math.max(state.longestStreak, newCurrentStreak);

          // Rewards check for milestone streaks
          const newUnlockedAvatars = [...state.unlockedAvatars];
          const newUnlockedThemes = [...state.unlockedThemes];
          
          if (newCurrentStreak >= 3 && !newUnlockedAvatars.includes("Mage")) {
            newUnlockedAvatars.push("Mage");
          }
          if (newCurrentStreak >= 7) {
            if (!newUnlockedAvatars.includes("Rogue")) newUnlockedAvatars.push("Rogue");
            if (!newUnlockedThemes.includes("void")) newUnlockedThemes.push("void");
          }
          if (newCurrentStreak >= 14 && !newUnlockedAvatars.includes("Dragon Slayer")) {
            newUnlockedAvatars.push("Dragon Slayer");
          }

          return {
            tasks: updatedTasks,
            conqueredDates: newConqueredDates,
            lastConqueredDate: newLastConqueredDate,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            unlockedAvatars: newUnlockedAvatars,
            unlockedThemes: newUnlockedThemes,
            gold: Math.max(0, state.gold + earnedGold),
          };
        });

        if (playVictory) {
          retroAudio.playLevelUp();
          // Trigger confetti externally by hooking onto window.dispatchEvent or direct import
          window.dispatchEvent(new Event("trigger-confetti"));
        } else if (earnedGold > 0) {
          retroAudio.playQuestComplete();
        }
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },

      updateSubtasks: (taskId, subTasks) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subTasks, points: subTasks.length } : t
          ),
        }));
      },

      toggleSubtask: (taskId, subtaskId) => {
        let earnedGold = 0;
        let playVictory = false;

        set((state) => {
          const updatedTasks = state.tasks.map((t) => {
            if (t.id === taskId) {
              const updatedSubs = t.subTasks.map((st) => {
                if (st.id === subtaskId) {
                  const newCompleted = !st.completed;
                  earnedGold = newCompleted ? 10 : -10;
                  return { ...st, completed: newCompleted };
                }
                return st;
              });
              // Check if all subtasks are complete to mark the main task complete
              const allComplete = updatedSubs.every((st) => st.completed);
              return {
                ...t,
                subTasks: updatedSubs,
                completed: allComplete,
              };
            }
            return t;
          });

          // Recalculate points for this task date
          const task = state.tasks.find((t) => t.id === taskId);
          const taskDate = task ? task.dueDate : state.selectedDate;

          const dateTasks = updatedTasks.filter((t) => t.dueDate === taskDate);
          let datePoints = 0;
          dateTasks.forEach((t) => {
            if (t.subTasks.length > 0) {
              datePoints += t.subTasks.filter((st) => st.completed).length;
            } else if (t.completed) {
              datePoints += t.points;
            }
          });

          const alreadyConquered = state.conqueredDates.includes(taskDate);
          let newConqueredDates = [...state.conqueredDates];
          let newLastConqueredDate = state.lastConqueredDate;

          if (datePoints >= 10 && !alreadyConquered) {
            newConqueredDates.push(taskDate);
            newLastConqueredDate = taskDate;
            playVictory = true;
          } else if (datePoints < 10 && alreadyConquered) {
            newConqueredDates = newConqueredDates.filter((d) => d !== taskDate);
            const sorted = [...newConqueredDates].sort();
            newLastConqueredDate = sorted[sorted.length - 1] || null;
          }

          // Recalculate streak deterministically walking backward
          const newCurrentStreak = calculateStreak(newConqueredDates, state.protectedDates);
          const newLongestStreak = Math.max(state.longestStreak, newCurrentStreak);

          const newUnlockedAvatars = [...state.unlockedAvatars];
          const newUnlockedThemes = [...state.unlockedThemes];
          if (newCurrentStreak >= 3 && !newUnlockedAvatars.includes("Mage")) {
            newUnlockedAvatars.push("Mage");
          }
          if (newCurrentStreak >= 7) {
            if (!newUnlockedAvatars.includes("Rogue")) newUnlockedAvatars.push("Rogue");
            if (!newUnlockedThemes.includes("void")) newUnlockedThemes.push("void");
          }
          if (newCurrentStreak >= 14 && !newUnlockedAvatars.includes("Dragon Slayer")) {
            newUnlockedAvatars.push("Dragon Slayer");
          }

          return {
            tasks: updatedTasks,
            conqueredDates: newConqueredDates,
            lastConqueredDate: newLastConqueredDate,
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            unlockedAvatars: newUnlockedAvatars,
            unlockedThemes: newUnlockedThemes,
            gold: Math.max(0, state.gold + earnedGold),
          };
        });

        if (playVictory) {
          retroAudio.playLevelUp();
          window.dispatchEvent(new Event("trigger-confetti"));
        } else if (earnedGold > 0) {
          retroAudio.playQuestComplete();
        }
      },

      incrementPoms: (taskId) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, poms: t.poms + 1 } : t
          ),
        }));
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      setTheme: (theme) => set({ activeTheme: theme }),

      buyShield: () => {
        const cost = 100;
        const currentGold = get().gold;
        if (currentGold >= cost) {
          set((state) => ({
            gold: state.gold - cost,
            shieldsCount: state.shieldsCount + 1,
          }));
          retroAudio.playShieldBuy();
          return true;
        }
        retroAudio.playError();
        return false;
      },

      buyAvatar: (avatar, cost) => {
        const currentGold = get().gold;
        const unlocked = get().unlockedAvatars;
        if (currentGold >= cost && !unlocked.includes(avatar)) {
          set((state) => ({
            gold: state.gold - cost,
            unlockedAvatars: [...state.unlockedAvatars, avatar],
          }));
          retroAudio.playShieldBuy();
          return true;
        }
        retroAudio.playError();
        return false;
      },

      buyTheme: (theme, cost) => {
        const currentGold = get().gold;
        const unlocked = get().unlockedThemes;
        if (currentGold >= cost && !unlocked.includes(theme)) {
          set((state) => ({
            gold: state.gold - cost,
            unlockedThemes: [...state.unlockedThemes, theme],
          }));
          retroAudio.playShieldBuy();
          return true;
        }
        retroAudio.playError();
        return false;
      },

      selectAvatar: (avatar) => {
        if (get().unlockedAvatars.includes(avatar)) {
          set({ activeAvatar: avatar });
        }
      },

      // Check if streak was broken since last login/activity
      checkStreakBreak: (todayStr) => {
        const { lastConqueredDate, currentStreak, shieldsCount, conqueredDates, protectedDates } = get();
        if (!lastConqueredDate || currentStreak === 0) return;

        const diff = getDaysDifference(todayStr, lastConqueredDate);
        // If the gap is > 1, it means there are days between lastConqueredDate and today that were missed.
        if (diff > 1) {
          let tempShields = shieldsCount;
          let tempStreak = currentStreak;
          const newProtectedDates = [...protectedDates];
          let streakBroken = false;

          // Check each missed day from day after lastConqueredDate up to yesterday
          for (let i = 1; i < diff; i++) {
            const missedDay = getOffsetDateString(lastConqueredDate, i);
            if (conqueredDates.includes(missedDay) || newProtectedDates.includes(missedDay)) {
              // Already conquered or already protected in a prior check
              continue;
            }

            if (tempShields > 0) {
              // Consume shield to protect streak
              tempShields -= 1;
              newProtectedDates.push(missedDay);
              // Streak is frozen (i.e. stays at tempStreak, does not increase or reset)
            } else {
              // No shields left, streak resets to 0
              tempStreak = 0;
              streakBroken = true;
              break;
            }
          }

          if (streakBroken || tempShields !== shieldsCount) {
            set({
              shieldsCount: tempShields,
              currentStreak: tempStreak,
              protectedDates: newProtectedDates,
            });
          }
        }
      },

      // Allow adding points directly for debugging/testing
      testSetPointsForDate: (date, points) => {
        set((state) => {
          const isConquered = points >= 10;
          let newConquered = [...state.conqueredDates];
          if (isConquered && !newConquered.includes(date)) {
            newConquered.push(date);
          } else if (!isConquered && newConquered.includes(date)) {
            newConquered = newConquered.filter((d) => d !== date);
          }
          return { conqueredDates: newConquered };
        });
      },

      clearAllData: () => {
        set({
          tasks: [],
          conqueredDates: [],
          protectedDates: [],
          currentStreak: 0,
          longestStreak: 0,
          lastConqueredDate: null,
          gold: 0,
          shieldsCount: 0,
          unlockedAvatars: ["Knight"],
          activeAvatar: "Knight",
          activeTheme: "rpg",
          unlockedThemes: ["rpg", "cyberpunk", "pastel", "minimal"],
          selectedDate: new Date().toISOString().split("T")[0],
          isDarkMode: true,
        });
      },

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: "lifequest-store",
    }
  )
);
