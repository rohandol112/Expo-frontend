export interface Offer {
  id: string;
  category: string;
  type: "Product" | "Service" | "Shop";
  subcategories: string[];
  createdOn: string;
}
