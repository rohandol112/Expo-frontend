import type { ListingSubCategory } from "@/types/listingCategory";

export const listingSubCategories: ListingSubCategory[] = [
  { id: "sub-1", categoryId: "cat-1", category: "Food & Dining", name: "Restaurants", type: "Shop", icon: "🍴", status: "Active", sortOrder: 1, displayOnHome: true, shopsCount: 124, productsCount: 568, servicesCount: 32, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-2", categoryId: "cat-1", category: "Food & Dining", name: "Cafes & Coffee Shops", type: "Shop", icon: "☕", status: "Active", sortOrder: 2, displayOnHome: true, shopsCount: 98, productsCount: 342, servicesCount: 18, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-3", categoryId: "cat-1", category: "Food & Dining", name: "Fast Food", type: "Shop", icon: "🍔", status: "Active", sortOrder: 3, displayOnHome: true, shopsCount: 76, productsCount: 290, servicesCount: 15, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-4", categoryId: "cat-2", category: "Shopping", name: "Grocery Stores", type: "Shop", icon: "🛒", status: "Active", sortOrder: 1, displayOnHome: true, shopsCount: 210, productsCount: 1254, servicesCount: 42, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-5", categoryId: "cat-2", category: "Shopping", name: "Clothing & Fashion", type: "Shop", icon: "👗", status: "Active", sortOrder: 2, displayOnHome: true, shopsCount: 185, productsCount: 1820, servicesCount: 36, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-6", categoryId: "cat-2", category: "Shopping", name: "Mobile & Electronics", type: "Product", icon: "📱", status: "Active", sortOrder: 3, displayOnHome: true, shopsCount: 142, productsCount: 2145, servicesCount: 28, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-7", categoryId: "cat-2", category: "Shopping", name: "Home Appliances", type: "Product", icon: "🧺", status: "Active", sortOrder: 4, displayOnHome: false, shopsCount: 96, productsCount: 1102, servicesCount: 22, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-8", categoryId: "cat-4", category: "Home Services", name: "Home Cleaning Services", type: "Service", icon: "🧹", status: "Active", sortOrder: 1, displayOnHome: true, servicesCount: 156, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-9", categoryId: "cat-4", category: "Home Services", name: "Electricians", type: "Service", icon: "⚡", status: "Inactive", sortOrder: 2, displayOnHome: false, servicesCount: 89, createdOn: "15 May 2024, 10:30 AM" },
  { id: "sub-10", categoryId: "cat-5", category: "Automotive", name: "Car Repair", type: "Service", icon: "🔧", status: "Active", sortOrder: 3, displayOnHome: true, servicesCount: 74, createdOn: "15 May 2024, 10:30 AM" },
];
