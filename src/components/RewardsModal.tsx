import React, { useState, useEffect } from "react";
import { useQuestStore } from "../store/useQuestStore";
import { Trophy, Lock, X, Sparkles } from "lucide-react";

interface Milestone {
  streakRequired: number;
  title: string;
  rewards: string;
  details: string;
  icon: string;
}

const MILESTONES: Milestone[] = [
  {
    streakRequired: 1,
    title: "Initiate Explorer",
    rewards: "Earned +50g starting bonus",
    details: "Conquer your first 10-point daily milestone.",
    icon: "🧭",
  },
  {
    streakRequired: 3,
    title: "Mage of Focus",
    rewards: "🔮 Mage Avatar class unlocked",
    details: "Maintain a 3-day streak. Master the focus spells.",
    icon: "🔮",
  },
  {
    streakRequired: 7,
    title: "Shadow Rogue",
    rewards: "🗡️ Rogue Avatar + 🌌 Void Lord Theme unlocked",
    details: "Maintain a 7-day streak. Unlock cosmic void customization.",
    icon: "🗡️",
  },
  {
    streakRequired: 14,
    title: "Dragon Slayer",
    rewards: "🐲 Dragon Slayer Avatar class + 500g bonus",
    details: "Maintain a 14-day streak. Conquer legendary monsters.",
    icon: "🐲",
  },
  {
    streakRequired: 30,
    title: "Hero of the Realm",
    rewards: "🌟 Eternal Crown Avatar + 1000g bonus",
    details: "Maintain a 30-day streak. Become a legend of the guild.",
    icon: "👑",
  },
];

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({ isOpen, onClose }) => {
  const { currentStreak } = useQuestStore();
  const [showCelebration, setShowCelebration] = useState(false);
  const [latestUnlockedMilestone, setLatestUnlockedMilestone] = useState<Milestone | null>(null);

  // Check if a milestone was newly reached and needs a popup.
  // We use localStorage to track which milestones have been celebrated so they only pop up once.
  useEffect(() => {
    if (currentStreak === 0) return;

    const celebratedKey = "lifequest-celebrated-milestones";
    const celebrated: number[] = JSON.parse(localStorage.getItem(celebratedKey) || "[]");

    // Find the highest milestone achieved that hasn't been celebrated yet
    const milestoneToCelebrate = MILESTONES.find(
      (m) => currentStreak >= m.streakRequired && !celebrated.includes(m.streakRequired)
    );

    if (milestoneToCelebrate) {
      setLatestUnlockedMilestone(milestoneToCelebrate);
      setShowCelebration(true);

      // Save to celebrated list
      celebrated.push(milestoneToCelebrate.streakRequired);
      localStorage.setItem(celebratedKey, JSON.stringify(celebrated));
    }
  }, [currentStreak]);

  if (!isOpen && !showCelebration) return null;

  // Render the automatic celebration pop-up
  if (showCelebration && latestUnlockedMilestone) {
    return (
      <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
        <div className="theme-transition bg-theme-card/85 backdrop-blur-md border-2 border-yellow-500 rounded-2xl max-w-md w-full p-6 text-center shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-in zoom-in-95 duration-300 relative overflow-hidden">
          
          {/* Sparkly background decoration */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-theme-primary/10 rounded-full blur-xl" />

          <button
            onClick={() => setShowCelebration(false)}
            className="absolute top-4 right-4 text-theme-muted hover:text-theme-text transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-6xl mb-4 animate-bounce mt-2">
            {latestUnlockedMilestone.icon}
          </div>

          <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full border border-yellow-500/40">
            Milestone Achieved!
          </span>

          <h2 className="text-2xl font-black text-theme-text mt-3 mb-2 font-serif">
            {latestUnlockedMilestone.title}
          </h2>

          <p className="text-xs text-theme-muted mb-4 px-4">
            "Your streak flame burns at {currentStreak} days! The bards shall write songs of your dedication, hero."
          </p>

          <div className="bg-theme-bg border border-theme-border/60 rounded-xl p-4 mb-6">
            <div className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-1 flex items-center justify-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>Unlocks Claimed</span>
            </div>
            <div className="text-sm font-bold text-theme-primary">
              {latestUnlockedMilestone.rewards}
            </div>
          </div>

          <button
            onClick={() => setShowCelebration(false)}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-black text-sm py-3 rounded-lg transition-colors shadow-md active:scale-[0.98]"
          >
            Claim Rewards & Return
          </button>
        </div>
      </div>
    );
  }

  // Render the manual "Hall of Trophies" modal
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="theme-transition bg-theme-card/85 backdrop-blur-md border border-theme-border rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-theme-border mb-4">
          <h2 className="text-xl font-bold text-theme-primary flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span>Hall of Trophies</span>
          </h2>
          <button
            onClick={onClose}
            className="text-theme-muted hover:text-theme-text transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-theme-muted mb-4 text-left">
          Earn points by completing daily tasks. When your daily score reaches 10 points, your streak flame is preserved. Unlocking milestones grants unique cosmetic upgrades and avatars.
        </div>

        {/* Milestone List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
          {MILESTONES.map((m) => {
            const isUnlocked = currentStreak >= m.streakRequired;
            return (
              <div
                key={m.streakRequired}
                className={`flex items-start justify-between p-3 rounded-xl border ${
                  isUnlocked
                    ? "bg-theme-bg/60 border-yellow-500/40 text-theme-text"
                    : "bg-theme-bg/20 border-theme-border/40 opacity-60 text-theme-muted"
                }`}
              >
                <div className="flex items-center space-x-3 text-left">
                  <div className="text-3xl shrink-0">{isUnlocked ? m.icon : "🔒"}</div>
                  <div>
                    <h4 className="font-bold text-sm flex items-center space-x-2">
                      <span>{m.title}</span>
                      <span className="text-[9px] bg-theme-border/50 px-1.5 py-0.5 rounded text-theme-muted font-bold">
                        {m.streakRequired} Day Streak
                      </span>
                    </h4>
                    <p className="text-[10px] leading-tight text-theme-muted my-0.5">{m.details}</p>
                    <p className="text-[10px] font-bold text-theme-primary">{m.rewards}</p>
                  </div>
                </div>

                <div className="shrink-0 pt-1">
                  {isUnlocked ? (
                    <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      Earned
                    </span>
                  ) : (
                    <span className="bg-theme-border/40 text-theme-muted text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-theme-border flex justify-between items-center">
          <span className="text-xs text-theme-muted font-semibold">
            Your Current Streak: <span className="text-theme-primary font-bold">{currentStreak} Days</span>
          </span>
          <button
            onClick={onClose}
            className="bg-theme-primary text-theme-bg font-bold text-xs px-4 py-2 rounded-md hover:opacity-90 transition-all shadow"
          >
            Close Hall
          </button>
        </div>

      </div>
    </div>
  );
};
