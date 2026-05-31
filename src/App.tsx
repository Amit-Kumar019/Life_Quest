import { useEffect, useState } from "react";
import { useQuestStore } from "./store/useQuestStore";
import { Navbar } from "./components/Navbar";
import { WeeklyView } from "./components/WeeklyView";
import { DailyView } from "./components/DailyView";
import { PomodoroWidget } from "./components/PomodoroWidget";
import { GuildmasterSidebar } from "./components/GuildmasterSidebar";
import { RewardsModal } from "./components/RewardsModal";
import confetti from "canvas-confetti";
import { Trophy, HelpCircle, RefreshCw } from "lucide-react";

function App() {
  const { activeTheme, isDarkMode, checkStreakBreak, clearAllData } = useQuestStore();
  const [rewardsOpen, setRewardsOpen] = useState(false);

  // Check for streak break or shields on mounting
  useEffect(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    checkStreakBreak(todayStr);
  }, [checkStreakBreak]);

  // Listen to win condition confetti trigger
  useEffect(() => {
    const handleConfetti = () => {
      // Fire multiple bursts of confetti
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // Confetti colors matching themes
        const colors = ["#dfa837", "#ff007f", "#00f0ff", "#b388ff", "#10b981"];
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors,
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors,
        });
      }, 250);
    };

    window.addEventListener("trigger-confetti", handleConfetti);
    return () => {
      window.removeEventListener("trigger-confetti", handleConfetti);
    };
  }, []);

  // Set up listeners for the click of the streak flame to open rewards modal
  useEffect(() => {
    const handleOpenRewards = () => {
      setRewardsOpen(true);
    };
    
    // We can trigger this by dispatching a custom event
    window.addEventListener("open-rewards-modal", handleOpenRewards);
    return () => {
      window.removeEventListener("open-rewards-modal", handleOpenRewards);
    };
  }, []);

  // Sync theme and mode classes to document.body so color variables cascade from the very root
  useEffect(() => {
    const body = document.body;
    const themes = ["theme-rpg", "theme-cyberpunk", "theme-pastel", "theme-minimal", "theme-void"];
    themes.forEach((t) => body.classList.remove(t));
    body.classList.remove("dark-mode", "light-mode");
    body.classList.add(`theme-${activeTheme}`);
    body.classList.add(isDarkMode ? "dark-mode" : "light-mode");
  }, [activeTheme, isDarkMode]);

  return (
    <div className="theme-transition min-h-screen flex flex-col bg-theme-bg text-theme-text pb-12">
      
      {/* NAVBAR STATUS AREA */}
      <Navbar />

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: Calendar and Tasks */}
        <div className="flex-1 flex flex-col gap-6">
          <WeeklyView />
          <DailyView />
        </div>

        {/* RIGHT COLUMN: Pomodoro, Rewards manual trigger, Reset */}
        <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
          
          {/* POMODORO TIMER */}
          <PomodoroWidget />

          {/* REWARDS BUTTON */}
          <button
            onClick={() => setRewardsOpen(true)}
            className="theme-transition bg-theme-card border border-theme-border rounded-xl p-4 flex items-center justify-between hover:border-theme-primary cursor-pointer text-left shadow-sm group"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-500/10 text-yellow-500 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                <Trophy className="w-5 h-5 fill-yellow-500/20" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Hall of Trophies</h4>
                <p className="text-[10px] text-theme-muted leading-tight">View unlocked hero classes and milestones</p>
              </div>
            </div>
          </button>

          {/* QUICK INSTRUCTIONS */}
          <div className="theme-transition bg-theme-card border border-theme-border rounded-xl p-4 text-left text-xs shadow-sm">
            <h4 className="font-bold text-theme-primary flex items-center space-x-1.5 mb-2">
              <HelpCircle className="w-4 h-4" />
              <span>Adventurer's Guide</span>
            </h4>
            <ul className="space-y-1.5 list-disc pl-4 text-theme-muted text-[11px] leading-relaxed">
              <li>Create quests on the Quest Board. Easy tasks grant 1 pt, Medium/Hard grant 2 pts.</li>
              <li>Earn 10 points daily to conquer the day and extend your streak!</li>
              <li>Gold is awarded for finished quests (+10g per point).</li>
              <li>Spend gold at the Store to purchase Streak Shields (100g) to protect your flame.</li>
              <li>Break down large 2-point tasks using the inline AI Break Down helper.</li>
            </ul>
          </div>

          {/* RESET DATA */}
          <div className="mt-auto pt-4 flex justify-center">
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to reset your character? This will clear all gold, streaks, and tasks!")) {
                  clearAllData();
                }
              }}
              className="flex items-center space-x-1 text-theme-muted hover:text-red-400 text-[10px] font-bold transition-colors"
              title="Reset all local progress"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Character Progress</span>
            </button>
          </div>

        </div>
      </main>

      {/* PERSISTENT AI COMPANION SIDEBAR */}
      <GuildmasterSidebar />

      {/* REWARDS & MILESTONES HALL MODAL */}
      <RewardsModal isOpen={rewardsOpen} onClose={() => setRewardsOpen(false)} />
      
    </div>
  );
}

export default App;
