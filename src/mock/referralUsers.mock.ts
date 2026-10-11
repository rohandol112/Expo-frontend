import type { ReferralUser } from "@/types/referrals";

const NAMES = [
  "Priya Singh", "Rahul Sharma", "Ananya Patel", "Vikram Desai", "Sneha Reddy",
  "Arjun Nair", "Kavya Iyer", "Rohan Gupta", "Meera Joshi", "Aditya Kumar",
  "Pooja Mehta", "Karan Malhotra",
];
const LOCATIONS = [
  { state: "Maharashtra", district: "Mumbai", area: "Andheri West" },
  { state: "Maharashtra", district: "Thane", area: "Ghodbunder" },
  { state: "Maharashtra", district: "Pune", area: "Kothrud" },
  { state: "Gujarat", district: "Ahmedabad", area: "Navrangpura" },
  { state: "Delhi", district: "New Delhi", area: "Connaught Place" },
];
const LANGUAGES: ReferralUser["language"][] = ["Hindi", "English", "Marathi", "Gujarati", "Tamil"];

export const referralUsers: ReferralUser[] = NAMES.map((name, i) => {
  const loc = LOCATIONS[i % LOCATIONS.length];
  const totalReferred = 40 - i * 2;
  const successful = Math.round(totalReferred * 0.7);
  const active = Math.round(successful * 0.72);
  const uninstalled = successful - active;
  return {
    id: `ref-${i + 1}`,
    name,
    phone: `+91 98${(765430000 + i * 11).toString().slice(0, 8)}`,
    rank: i + 1,
    state: loc.state,
    district: loc.district,
    area: loc.area,
    language: LANGUAGES[i % LANGUAGES.length],
    referralCode: `RB${(7000 + i * 37).toString(36).toUpperCase()}`,
    totalReferredUsers: totalReferred,
    successfulReferrals: successful,
    activeUsers: active,
    uninstalledUsers: uninstalled,
    totalReferredPoints: successful * 350,
  };
});
