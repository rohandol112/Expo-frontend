import type { CompetitionLocation, ImportantLink, RewardsSettings } from "@/types/referrals";

export const rewardsSettings: RewardsSettings = {
  streakPointsPerDay: 10,
  referralPointsPerInstall: 100,
  referralApprovalDays: 7,
};

export const competitionLocations: CompetitionLocation[] = [
  { id: "loc-1", title: "Mumbai", state: "Maharashtra", district: "Mumbai", area: "All Areas", status: "Active" },
  { id: "loc-2", title: "Pune", state: "Maharashtra", district: "Pune", area: "All Areas", status: "Active" },
  { id: "loc-3", title: "Thane", state: "Maharashtra", district: "Thane", area: "All Areas", status: "Active" },
  { id: "loc-4", title: "Navi Mumbai", state: "Maharashtra", district: "Navi Mumbai", area: "All Areas", status: "Active" },
  { id: "loc-5", title: "Delhi", state: "Delhi", district: "New Delhi", area: "All Areas", status: "Active" },
];

export const importantLinks: ImportantLink[] = [
  { id: "link-1", title: "Terms & Conditions", description: "<p>Please read our terms and conditions carefully.</p>", status: "Active" },
  { id: "link-2", title: "Privacy Policy", description: "<p>Learn how we collect and use your data.</p>", status: "Active" },
  { id: "link-3", title: "About Us", description: "<p>Pehli Baat is your trusted local news and listings app.</p>", status: "Active" },
  { id: "link-4", title: "Contact Support", description: "<p>Reach out to us for any queries or issues.</p>", status: "Active" },
];
