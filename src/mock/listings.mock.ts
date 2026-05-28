import type { Listing } from "@/types/listing";

export const listings: Listing[] = [
  { id: "lst-1", name: "Sai Mobile Store", type: "Shop", category: "Electronics", subcategory: "Mobiles", city: "Pune", contact: "+91 90123 45678", createdOn: "08 Apr 2026", views: 2480, status: "Active" },
  { id: "lst-2", name: "QuickFix Plumbing", type: "Service", category: "Home Repair", subcategory: "Plumbing", city: "Mumbai", contact: "+91 93456 78901", createdOn: "12 Apr 2026", views: 1130, status: "Active" },
  { id: "lst-3", name: "City Fashion Hub", type: "Shop", category: "Retail", subcategory: "Fashion", city: "Lucknow", contact: "+91 97890 12345", createdOn: "18 Apr 2026", views: 842, status: "Inactive" },
];
