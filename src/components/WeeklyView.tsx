import React from "react";
import { useQuestStore } from "../store/useQuestStore";
import { ChevronLeft, ChevronRight, Crown, ShieldAlert } from "lucide-react";

export const WeeklyView: React.FC = () => {
  const {
    tasks,
    conqueredDates,
    protectedDates,
    selectedDate,
    setSelectedDate,
  } = useQuestStore();

  // Get date object from string YYYY-MM-DD
  const getSelectedDateObj = () => {
    return new Date(selectedDate + "T00:00:00");
  };

  // Generate current week dates (Sunday to Saturday) based on selected date
  const getWeekDays = () => {
    const current = getSelectedDateObj();
    const day = current.getDay(); // 0 is Sunday, 6 is Saturday
    const sunday = new Date(current);
    sunday.setDate(current.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const temp = new Date(sunday);
      temp.setDate(sunday.getDate() + i);
      days.push(temp);
    }
    return days;
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const getPointsForDate = (dateStr: string) => {
    const dateTasks = tasks.filter((t) => t.dueDate === dateStr);
    let totalPoints = 0;
    
    dateTasks.forEach((t) => {
      if (t.subTasks && t.subTasks.length > 0) {
        totalPoints += t.subTasks.filter((st) => st.completed).length;
      } else if (t.completed) {
        totalPoints += t.points;
      }
    });
    
    return totalPoints;
  };

  // Navigating between weeks
  const shiftWeek = (offset: number) => {
    const current = getSelectedDateObj();
    current.setDate(current.getDate() + offset * 7);
    setSelectedDate(formatDateString(current));
  };

  const weekDays = getWeekDays();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="theme-transition bg-theme-card border border-theme-border rounded-xl p-4 shadow-md w-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-theme-primary flex items-center space-x-1.5">
            <span>Weekly Quest log</span>
          </h2>
          <p className="text-xs text-theme-muted">Track your daily 10-point conquest streak</p>
        </div>
        
        <div className="flex items-center space-x-2 bg-theme-bg p-1 rounded-md border border-theme-border/60">
          <button
            onClick={() => shiftWeek(-1)}
            className="p-1 hover:bg-theme-card text-theme-text rounded transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold px-2 text-theme-text">
            Week of {weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
          <button
            onClick={() => shiftWeek(1)}
            className="p-1 hover:bg-theme-card text-theme-text rounded transition-colors"
            title="Next Week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, idx) => {
          const dateStr = formatDateString(date);
          const points = getPointsForDate(dateStr);
          const isConquered = points >= 10 || conqueredDates.includes(dateStr);
          const isProtected = protectedDates.includes(dateStr);
          const isSelected = selectedDate === dateStr;
          const isToday = formatDateString(new Date()) === dateStr;

          // Card colors based on state
          let cardStyle = "bg-theme-bg border-theme-border/40 text-theme-text hover:border-theme-primary/60";
          if (isSelected) {
            cardStyle = "bg-theme-bg border-theme-primary border-2 text-theme-text shadow-themeGlow";
          } else if (isConquered) {
            cardStyle = "bg-yellow-500/10 border-yellow-500 text-theme-text hover:bg-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.25)]";
          } else if (isProtected) {
            cardStyle = "bg-blue-500/10 border-blue-400/80 text-theme-text hover:bg-blue-500/20";
          }

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`theme-transition flex flex-col items-center justify-between p-2.5 rounded-lg border text-center relative cursor-pointer min-h-[90px] ${cardStyle}`}
            >
              {/* Day name & Date */}
              <div className="w-full">
                <span className="block text-[10px] text-theme-muted uppercase font-bold tracking-wider">
                  {dayNames[idx]}
                </span>
                <span className={`block font-bold text-sm ${isToday ? "text-theme-primary" : ""}`}>
                  {date.getDate()}
                </span>
              </div>

              {/* Status Icons */}
              <div className="my-1.5 flex items-center justify-center">
                {isConquered ? (
                  <span title="Day Conquered!">
                    <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-bounce" />
                  </span>
                ) : isProtected ? (
                  <span title="Missed day frozen by shield!">
                    <ShieldAlert className="w-5 h-5 text-blue-400" />
                  </span>
                ) : points > 0 ? (
                  <div className="text-[10px] font-bold bg-theme-border/50 px-1.5 py-0.5 rounded text-theme-muted">
                    {points} pts
                  </div>
                ) : (
                  <span className="block w-1.5 h-1.5 rounded-full bg-theme-muted/40"></span>
                )}
              </div>

              {/* Progress bar at bottom */}
              <div className="w-full bg-theme-border/30 h-1 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isConquered ? "bg-yellow-500" : isProtected ? "bg-blue-400" : "bg-theme-primary"}`}
                  style={{ width: `${Math.min(100, (points / 10) * 100)}%` }}
                />
              </div>

              {/* Today Badge dot */}
              {isToday && !isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-theme-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
