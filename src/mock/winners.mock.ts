import type { Winner } from "@/types/referrals";

const NAMES = [
  "Priya Singh", "Rohan Gupta", "Ananya Patel", "Vikram Desai", "Sneha Reddy",
  "Arjun Nair", "Kavya Iyer", "Aditya Kumar", "Meera Joshi", "Karan Malhotra",
  "Pooja Mehta", "Rahul Sharma",
];
const LOCATIONS = [
  { state: "Maharashtra", district: "Mumbai", area: "Andheri West" },
  { state: "Maharashtra", district: "Thane", area: "Ghodbunder" },
  { state: "Maharashtra", district: "Pune", area: "Kothrud" },
  { state: "Gujarat", district: "Ahmedabad", area: "Navrangpura" },
  { state: "Delhi", district: "New Delhi", area: "Connaught Place" },
];
const LANGUAGES: Winner["language"][] = ["Hindi", "English", "Marathi", "Gujarati", "Tamil"];

function quizRounds(seed: number): boolean[] {
  return Array.from({ length: 5 }, (_, i) => (seed + i) % 4 !== 0);
}

export const winners: Winner[] = NAMES.map((name, i) => {
  const loc = LOCATIONS[i % LOCATIONS.length];
  const reading = 85240 - i * 3100;
  const quiz = 30440 - i * 900;
  const bonus = 20000 - i * 600;
  const referral = 45000 - i * 1400;
  const total = reading + quiz + bonus + referral;
  const hasGiftRequest = i % 3 !== 2;
  return {
    id: `win-${i + 1}`,
    userId: `user-${i + 1}`,
    name,
    phone: `+91 87${(654320000 + i * 17).toString().slice(0, 8)}`,
    state: loc.state,
    district: loc.district,
    area: loc.area,
    language: LANGUAGES[i % LANGUAGES.length],
    totalPoints: total,
    readingPoints: reading,
    quizPoints: quiz,
    bonusPoints: bonus,
    referralPoints: referral,
    streakDays: 30 - i * 2,
    giftRequestStatus: hasGiftRequest ? "Requested" : "Not Requested",
    giftRequestedAt: hasGiftRequest ? "28 Sep 2026, 09:15 AM" : undefined,
    rewardsStatus: i % 4 === 0 ? "Submitted" : i % 4 === 1 ? "Pending" : "-",
    quiz1Results: quizRounds(i),
    quiz1AttemptTime: "28 Sep 2026, 08:02 PM",
    quiz2Results: quizRounds(i + 2),
    quiz2AttemptTime: "28 Sep 2026, 08:14 PM",
  };
});
