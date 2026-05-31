import React, { useState } from "react";
import { useQuestStore } from "../store/useQuestStore";
import { Flame, Coins, Shield, Palette, User, ShoppingBag, ShieldCheck, Sun, Moon } from "lucide-react";

interface AvatarItem {
  name: string;
  emoji: string;
  cost: number;
  description: string;
}

const AVATARS: AvatarItem[] = [
  { name: "Knight", emoji: "🛡️", cost: 0, description: "Default frontline warrior." },
  { name: "Mage", emoji: "🔮", cost: 150, description: "Weaver of focus spells. Unlocks at 3-day streak." },
  { name: "Rogue", emoji: "🗡️", cost: 250, description: "Master of quick tasks. Unlocks at 7-day streak." },
  { name: "Paladin", emoji: "🌟", cost: 400, description: "Defender of daily routines." },
  { name: "Dragon Slayer", emoji: "🐲", cost: 600, description: "Conqueror of gargantuan epics. Unlocks at 14-day streak." },
];

export const Navbar: React.FC = () => {
  const {
    tasks,
    selectedDate,
    gold,
    shieldsCount,
    currentStreak,
    longestStreak,
    activeAvatar,
    unlockedAvatars,
    activeTheme,
    unlockedThemes,
    buyShield,
    buyAvatar,
    selectAvatar,
    setTheme,
    isDarkMode,
    toggleDarkMode,
  } = useQuestStore();

  const [shopOpen, setShopOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll height to trigger translucent header styles
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute completed points for the selected date to fill the header experience bar
  const todayTasks = tasks.filter((t) => t.dueDate === selectedDate);
  let completedPoints = 0;
  todayTasks.forEach((t) => {
    if (t.subTasks && t.subTasks.length > 0) {
      completedPoints += t.subTasks.filter((st) => st.completed).length;
    } else if (t.completed) {
      completedPoints += t.points;
    }
  });

  const getThemeFont = () => {
    switch (activeTheme) {
      case "rpg":
        return "font-serif tracking-wider font-bold";
      case "cyberpunk":
        return "font-mono uppercase tracking-widest font-extrabold";
      case "pastel":
        return "font-sans tracking-tight font-semibold italic";
      case "minimal":
        return "font-sans uppercase tracking-normal font-medium";
      case "void":
        return "font-serif tracking-widest uppercase font-black text-purple-400";
      default:
        return "font-sans";
    }
  };

  const getAvatarEmoji = (name: string) => {
    return AVATARS.find((a) => a.name === name)?.emoji || "🧙";
  };

  return (
    <header className={`theme-transition sticky top-0 z-40 px-4 py-3 border-b text-theme-text transition-all duration-300 ${
      isScrolled
        ? "bg-theme-card/80 backdrop-blur-md border-theme-border/60 shadow-lg"
        : "bg-theme-card border-theme-border shadow-md"
    }`}>
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
        
        {/* LOGO */}
        <div className="flex items-center space-x-2">
          <div className="bg-theme-primary text-theme-bg p-2 rounded-lg font-bold shadow-themeGlow">
            LQ
          </div>
          <span className={`text-2xl ${getThemeFont()} transition-all duration-300`}>
            LifeQuest
          </span>
        </div>

        {/* STATUS BAR */}
        <div className="flex items-center space-x-6 flex-wrap">
          
          {/* STREAK */}
          <div
            onClick={() => window.dispatchEvent(new Event("open-rewards-modal"))}
            className="flex items-center space-x-1.5 cursor-pointer relative group"
            title="Current Daily Streak"
          >
            <Flame className={`w-6 h-6 text-orange-500 fill-orange-500 ${currentStreak > 0 ? "animate-pulse" : "opacity-40"}`} />
            <span className="font-bold text-lg">{currentStreak}</span>
            <span className="text-xs text-theme-muted">(Max: {longestStreak})</span>
            {shieldsCount > 0 && (
              <span title={`Shield active! protects you from 1 missed day. (${shieldsCount} owned)`}>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </span>
            )}
            
            {/* Tooltip */}
            <div className="absolute top-8 left-0 hidden group-hover:block bg-theme-bg border border-theme-border text-xs p-2 rounded shadow-lg z-50 w-48">
              Conquer 10 points daily to keep your flame alive. Shields freeze the streak in case you miss a day!
            </div>
          </div>

          {/* GOLD */}
          <div className="flex items-center space-x-1.5 cursor-default" title="Gold balance">
            <Coins className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="font-bold text-theme-gold">{gold}g</span>
          </div>

          {/* SHOP BUTTON */}
          <button
            onClick={() => {
              setShopOpen(!shopOpen);
              setAvatarOpen(false);
            }}
            className="flex items-center space-x-1 bg-theme-primary text-theme-bg px-3 py-1.5 rounded-md font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store</span>
          </button>

          {/* AVATAR SELECTOR */}
          <button
            onClick={() => {
              setAvatarOpen(!avatarOpen);
              setShopOpen(false);
            }}
            className="flex items-center space-x-1.5 bg-theme-bg border border-theme-border px-3 py-1.5 rounded-md text-sm hover:border-theme-primary transition-colors"
          >
            <span className="text-lg leading-none">{getAvatarEmoji(activeAvatar)}</span>
            <span className="font-medium">{activeAvatar}</span>
          </button>

          {/* THEME SWITCHER */}
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-theme-muted" />
            <select
              value={activeTheme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-theme-bg text-theme-text border border-theme-border rounded px-2 py-1 text-sm outline-none focus:border-theme-primary cursor-pointer"
            >
              <option value="rpg">Cozy Tavern RPG</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="pastel">Pastel Dream</option>
              <option value="minimal">Minimalist B&W</option>
              {unlockedThemes.includes("void") && <option value="void">🌌 Void Lord (Secret)</option>}
            </select>
          </div>

          {/* DARK MODE TOGGLE */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-center p-2 bg-theme-bg border border-theme-border rounded-md hover:border-theme-primary text-theme-text transition-colors cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400 fill-yellow-400" /> : <Moon className="w-4 h-4 text-theme-primary" />}
          </button>

        </div>
      </div>

      {/* SHOP POPUP DROPDOWN */}
      {shopOpen && (
        <div className="absolute top-16 right-4 sm:right-32 w-80 bg-theme-card/85 backdrop-blur-md border border-theme-border rounded-lg shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-theme-border">
            <h3 className="font-bold flex items-center space-x-1.5 text-theme-primary">
              <ShoppingBag className="w-4 h-4" />
              <span>Adventurer's Bazaar</span>
            </h3>
            <span className="text-xs text-theme-muted">Your Gold: {gold}g</span>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {/* Streak Shield Item */}
            <div className="flex justify-between items-center bg-theme-bg p-2.5 rounded border border-theme-border/60">
              <div className="flex items-start space-x-2">
                <Shield className="w-8 h-8 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs">Streak Shield</h4>
                  <p className="text-[10px] text-theme-muted leading-tight">Freezes your streak if you miss a day. Auto-activates.</p>
                </div>
              </div>
              <button
                onClick={buyShield}
                disabled={gold < 100}
                className="bg-theme-primary text-theme-bg font-bold text-xs px-2.5 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Buy (100g)
              </button>
            </div>

            {/* Avatars For Sale */}
            <div className="text-[11px] font-bold text-theme-muted tracking-wider uppercase pt-1">
              Cosmetic Classes
            </div>

            {AVATARS.map((avatar) => {
              const isUnlocked = unlockedAvatars.includes(avatar.name);
              const canAfford = gold >= avatar.cost;

              if (avatar.cost === 0) return null; // Default is unlocked

              return (
                <div key={avatar.name} className="flex justify-between items-center bg-theme-bg p-2 rounded border border-theme-border/60 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{avatar.emoji}</span>
                    <div>
                      <h4 className="font-bold">{avatar.name}</h4>
                      <p className="text-[10px] text-theme-muted">{avatar.description}</p>
                    </div>
                  </div>
                  {isUnlocked ? (
                    <span className="text-emerald-500 font-semibold text-[10px] px-2">Unlocked</span>
                  ) : (
                    <button
                      onClick={() => buyAvatar(avatar.name, avatar.cost)}
                      disabled={!canAfford}
                      className="bg-theme-primary text-theme-bg font-bold text-[10px] px-2 py-1.5 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {avatar.cost}g
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AVATAR SELECTOR POPUP DROPDOWN */}
      {avatarOpen && (
        <div className="absolute top-16 right-4 sm:right-20 w-64 bg-theme-card/85 backdrop-blur-md border border-theme-border rounded-lg shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-theme-border">
            <h3 className="font-bold flex items-center space-x-1.5 text-theme-primary">
              <User className="w-4 h-4" />
              <span>Choose Your Hero Class</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto pr-1">
            {AVATARS.map((avatar) => {
              const isUnlocked = unlockedAvatars.includes(avatar.name);
              const isActive = activeAvatar === avatar.name;

              return (
                <button
                  key={avatar.name}
                  disabled={!isUnlocked}
                  onClick={() => selectAvatar(avatar.name)}
                  className={`flex items-center space-x-2.5 p-2 rounded text-left transition-all ${
                    isActive
                      ? "bg-theme-primary/20 border-theme-primary border"
                      : isUnlocked
                      ? "bg-theme-bg hover:border-theme-primary border border-transparent"
                      : "bg-theme-bg/40 opacity-40 cursor-not-allowed border border-transparent"
                  }`}
                >
                  <span className="text-2xl leading-none">{avatar.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{avatar.name}</span>
                      {isActive && <span className="text-[10px] text-theme-primary font-bold">ACTIVE</span>}
                    </div>
                    <p className="text-[9px] text-theme-muted truncate leading-normal">{avatar.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
      {/* Sticky bottom XP progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-theme-bg/20 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ease-out ${
            completedPoints >= 10 ? "bg-yellow-500 shadow-[0_0_8px_#ffd700]" : "bg-theme-primary"
          }`}
          style={{ width: `${Math.min(100, (completedPoints / 10) * 100)}%` }}
        />
      </div>
    </header>
  );
};
