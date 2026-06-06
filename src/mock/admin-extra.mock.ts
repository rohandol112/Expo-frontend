export type RoleRow = {
  id: string;
  name: string;
  description: string;
  scope: string;
  permissions: number;
  contentTypes: string;
  status: "Active" | "Inactive";
  createdAt: string;
};

export const roleRows: RoleRow[] = [
  { id: "super-admin", name: "Super Admin", description: "Full platform access with all system controls.", scope: "Global", permissions: 156, contentTypes: "All", status: "Active", createdAt: "04 Jun 2026" },
  { id: "editor", name: "Editor", description: "Reviews, edits, and publishes news content.", scope: "Language & Location", permissions: 92, contentTypes: "Article, Video", status: "Active", createdAt: "03 Jun 2026" },
  { id: "author", name: "Author", description: "Creates drafts and manages own assigned content.", scope: "Channel", permissions: 54, contentTypes: "Article, Story", status: "Active", createdAt: "02 Jun 2026" },
  { id: "reporter", name: "Reporter", description: "Submits field reports for assigned areas.", scope: "District", permissions: 38, contentTypes: "Article, Video", status: "Active", createdAt: "01 Jun 2026" },
  { id: "moderator", name: "Moderator", description: "Moderates user news and comments.", scope: "State", permissions: 48, contentTypes: "All", status: "Active", createdAt: "29 May 2026" },
  { id: "location-manager", name: "Location Manager", description: "Maintains state, district, and area data.", scope: "Location", permissions: 32, contentTypes: "None", status: "Active", createdAt: "28 May 2026" },
  { id: "monetization-manager", name: "Monetization Manager", description: "Manages ads and monetization settings.", scope: "Global", permissions: 41, contentTypes: "None", status: "Active", createdAt: "27 May 2026" },
  { id: "support-agent", name: "Support Agent", description: "Handles feedback and complaints.", scope: "Language & Location", permissions: 35, contentTypes: "None", status: "Active", createdAt: "25 May 2026" },
  { id: "viewer", name: "Viewer", description: "Read-only admin dashboard access.", scope: "Global", permissions: 18, contentTypes: "All", status: "Inactive", createdAt: "22 May 2026" },
  { id: "user", name: "User", description: "Default application user role.", scope: "App", permissions: 8, contentTypes: "None", status: "Active", createdAt: "20 May 2026" },
];

export type FeedbackRow = {
  id: string;
  user: string;
  userType: "Registered" | "Guest";
  type: "Rating" | "Suggestion" | "Complaint" | "Bug";
  feedback: string;
  language: string;
  location: string;
  submittedOn: string;
  status: "New" | "Reviewed" | "Under Review" | "Closed" | "Replied" | "Resolved";
};

export const feedbackRows: FeedbackRow[] = [
  { id: "fb-1", user: "Amit Sharma", userType: "Registered", type: "Rating", feedback: "News updates are fast and useful for my city.", language: "Hindi", location: "Madhya Pradesh, Bhopal", submittedOn: "05 Jun 2026", status: "New" },
  { id: "fb-2", user: "Priya Singh", userType: "Registered", type: "Suggestion", feedback: "Please add more district-level notifications.", language: "English", location: "Uttar Pradesh, Lucknow", submittedOn: "04 Jun 2026", status: "Reviewed" },
  { id: "fb-3", user: "Rohit Verma", userType: "Registered", type: "Bug", feedback: "Video took time to load on mobile network.", language: "Hindi", location: "Delhi, New Delhi", submittedOn: "03 Jun 2026", status: "Under Review" },
  { id: "fb-4", user: "Neha Patel", userType: "Registered", type: "Suggestion", feedback: "Add bookmark folders for local news.", language: "Gujarati", location: "Gujarat, Ahmedabad", submittedOn: "02 Jun 2026", status: "Replied" },
  { id: "fb-5", user: "Guest User", userType: "Guest", type: "Complaint", feedback: "Some category labels are confusing.", language: "English", location: "Maharashtra, Mumbai", submittedOn: "01 Jun 2026", status: "Resolved" },
];

export type TranslationRow = {
  id: string;
  key: string;
  group: string;
  english: string;
  status: "Complete" | "Partial" | "Missing";
  lastUpdated: string;
};

export const translationRows: TranslationRow[] = [
  { id: "tr-1", key: "login", group: "Auth", english: "Login", status: "Complete", lastUpdated: "05 Jun 2026" },
  { id: "tr-2", key: "register", group: "Auth", english: "Register", status: "Complete", lastUpdated: "05 Jun 2026" },
  { id: "tr-3", key: "submit_complaint", group: "Complaint", english: "Submit Complaint", status: "Partial", lastUpdated: "04 Jun 2026" },
  { id: "tr-4", key: "get_news_list", group: "API", english: "Get News List", status: "Complete", lastUpdated: "04 Jun 2026" },
  { id: "tr-5", key: "user_profile", group: "User", english: "User Profile", status: "Partial", lastUpdated: "03 Jun 2026" },
  { id: "tr-6", key: "invalid_token", group: "API", english: "Invalid token", status: "Complete", lastUpdated: "03 Jun 2026" },
  { id: "tr-7", key: "something_went_wrong", group: "Message", english: "Something went wrong", status: "Complete", lastUpdated: "02 Jun 2026" },
  { id: "tr-8", key: "no_internet_connection", group: "Message", english: "No internet connection", status: "Missing", lastUpdated: "02 Jun 2026" },
  { id: "tr-9", key: "data_not_found", group: "Message", english: "Data not found", status: "Partial", lastUpdated: "01 Jun 2026" },
  { id: "tr-10", key: "try_again", group: "Message", english: "Try again", status: "Complete", lastUpdated: "01 Jun 2026" },
];
