import type { Language } from "@/types/system";

export const languages: Language[] = [
  { id: "lang-hi", name: "Hindi", nativeName: "Hindi", code: "hi", direction: "LTR", status: "Active", contentCount: 8240, addedOn: "12 Jan 2026", icon: "HI" },
  { id: "lang-en", name: "English", nativeName: "English", code: "en", direction: "LTR", status: "Active", contentCount: 5480, addedOn: "18 Jan 2026", icon: "EN" },
  { id: "lang-mr", name: "Marathi", nativeName: "Marathi", code: "mr", direction: "LTR", status: "Active", contentCount: 2634, addedOn: "02 Feb 2026", icon: "MR" },
  { id: "lang-ur", name: "Urdu", nativeName: "Urdu", code: "ur", direction: "RTL", status: "Inactive", contentCount: 712, addedOn: "10 Feb 2026", icon: "UR" },
];
