import type { StreakUser } from "@/types/referrals";

const NAMES = [
  "Rohan Gupta", "Priya Singh", "Aditya Kumar", "Sneha Reddy", "Karan Malhotra",
  "Ananya Patel", "Vikram Desai", "Meera Joshi", "Arjun Nair", "Kavya Iyer",
  "Pooja Mehta", "Rahul Sharma",
];
const LOCATIONS = [
  { state: "Maharashtra", district: "Mumbai", area: "Andheri West" },
  { state: "Maharashtra", district: "Thane", area: "Ghodbunder" },
  { state: "Maharashtra", district: "Pune", area: "Kothrud" },
  { state: "Gujarat", district: "Ahmedabad", area: "Navrangpura" },
  { state: "Delhi", district: "New Delhi", area: "Connaught Place" },
];
const LANGUAGES: StreakUser["language"][] = ["Hindi", "English", "Marathi", "Gujarati", "Tamil"];

export const streakUsers: StreakUser[] = NAMES.map((name, i) => {
  const loc = LOCATIONS[i % LOCATIONS.length];
  const longest = 365 - i * 28;
  const current = Math.max(1, longest - i * 5);
  return {
    id: `streak-${i + 1}`,
    name,
    phone: `+91 97${(654320000 + i * 13).toString().slice(0, 8)}`,
    rank: i + 1,
    state: loc.state,
    district: loc.district,
    area: loc.area,
    language: LANGUAGES[i % LANGUAGES.length],
    currentStreak: current,
    longestStreak: longest,
    totalActiveDays: longest + Math.round(longest * 0.3),
    lastActiveAt: "28 Sep 2026, 10:24 AM",
    streakPoints: current * 10,
  };
});
