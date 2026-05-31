// RPG Guildmaster AI simulation with streaming effect and contextual task breakdowns

const GUILDMASTER_RESPONSES = [
  {
    keywords: ["hello", "hi", "greetings", "hey"],
    response: "Ah, welcome to the Cozy Dragon Tavern, traveler! Pull up a chair by the hearth. What quest are we planning to conquer today?"
  },
  {
    keywords: ["motivation", "tired", "lazy", "stuck", "procrastinating"],
    response: "A weary heart, eh? Every legendary hero faces doubt. Remember: you don't climb the mountain in one leap. Focus on completing just one small, 1-point quest right now. The rest will follow, and the gold is waiting!"
  },
  {
    keywords: ["plan", "schedule", "routine", "organize"],
    response: "A wise commander always studies the map. Try to balance your daily quests: mix hard, 2-point challenges with easy 1-pointers so you don't exhaust your energy. And don't forget to purchase a Streak Shield in case of an unexpected ambush!"
  },
  {
    keywords: ["pomodoro", "timer", "focus"],
    response: "Ah! The ancient wizard timer. Focus intensely for one 'pom' (25 minutes), then rest your mind for 5 minutes. No checking scroll-mail or visiting other taverns during focus time!"
  },
  {
    keywords: ["shield", "streak", "save"],
    response: "The Streak Shield is a magical barrier! For 100 gold, you can protect your streak. If you have an active shield and fail to hit 10 points on a day, the shield breaks but keeps your streak flame alive. A worthy investment!"
  },
  {
    keywords: ["gold", "rewards", "shop"],
    response: "Gold coins are earned by completing tasks—10 gold per point! Spend them in the shop at the top of your screen to buy shields or unlock legendary avatars. Keep questing to build your fortune!"
  }
];

const DEFAULT_RESPONSES = [
  "By the gods, that is a noble quest! Remember to break it down if it feels too heavy. Focus is your greatest weapon.",
  "Interesting puzzle! Have you considered dedicating one full Pomodoro sprint to this? Let's take it step by step.",
  "Indeed, traveler! The Guild stands behind you. Complete this task and earn your gold. What's the first small step?",
  "A fine strategy! Keep your streak flame burning bright today. Hitting 10 points will make you the talk of the realm!"
];

// Helper to stream text to a callback
export const streamText = (
  text: string,
  onChunk: (current: string) => void,
  speedMs: number = 25
): Promise<string> => {
  return new Promise((resolve) => {
    let index = 0;
    let current = "";
    const interval = setInterval(() => {
      current += text[index];
      onChunk(current);
      index++;
      if (index >= text.length) {
        clearInterval(interval);
        resolve(text);
      }
    }, speedMs);
  });
};

// Main chat responder
export const getGuildmasterResponse = async (
  message: string,
  onChunk: (current: string) => void
): Promise<string> => {
  const cleanMessage = message.toLowerCase().trim();
  let matchedResponse = "";

  for (const item of GUILDMASTER_RESPONSES) {
    if (item.keywords.some((kw) => cleanMessage.includes(kw))) {
      matchedResponse = item.response;
      break;
    }
  }

  if (!matchedResponse) {
    matchedResponse = DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
  }

  return streamText(matchedResponse, onChunk, 20);
};

// Generates sub-tasks for the AI Break Down feature
export const getTaskBreakdown = async (title: string): Promise<string[]> => {
  const cleanTitle = title.toLowerCase();

  // Simulate a slight network delay for realism
  await new Promise((resolve) => setTimeout(resolve, 800));

  if (cleanTitle.includes("clean") || cleanTitle.includes("room") || cleanTitle.includes("house")) {
    return [
      "Gather cleaning supplies and empty trash bins",
      "Declutter and organize surfaces",
      "Dust and wipe down tables/counters",
      "Sweep, vacuum, or mop the floors"
    ];
  }

  if (cleanTitle.includes("study") || cleanTitle.includes("read") || cleanTitle.includes("exam") || cleanTitle.includes("math") || cleanTitle.includes("learn")) {
    return [
      "Review textbook sections or summary notes",
      "Draft list of core definitions or formulas",
      "Complete 3 practice problems or quiz questions",
      "Summarize findings in a cheat sheet"
    ];
  }

  if (cleanTitle.includes("code") || cleanTitle.includes("build") || cleanTitle.includes("program") || cleanTitle.includes("app") || cleanTitle.includes("project")) {
    return [
      "Define requirements and draw outline architecture",
      "Create component files and verify router configuration",
      "Implement main feature functionality & logic",
      "Run unit tests, fix lints, and format codebase"
    ];
  }

  if (cleanTitle.includes("write") || cleanTitle.includes("report") || cleanTitle.includes("essay") || cleanTitle.includes("blog")) {
    return [
      "Conduct research & outline primary thesis/sections",
      "Draft introduction and paragraph outlines",
      "Flesh out body sections and insert citations",
      "Proofread grammar and formatting checks"
    ];
  }

  // Default breakdown
  return [
    `Stage 1: Outline the blueprint for: ${title}`,
    "Stage 2: Assemble required tools and materials",
    "Stage 3: Execute the heavy lifting and core sections",
    "Stage 4: Polish details and double check quality"
  ];
};
