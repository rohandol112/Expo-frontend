import type { LoginPayload, LoginResponse, AdminUser } from "@/types/auth";

// Mock credentials — replace with real httpClient call when backend is ready.
const MOCK_USER: AdminUser = {
  id: "u-1",
  name: "Admin User",
  email: "admin@news.com",
  role: "super_admin",
  avatarUrl: "https://i.pravatar.cc/100?img=12",
};

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    await new Promise((r) => setTimeout(r, 400));
    if (payload.email !== "admin@news.com" || payload.password !== "admin123") {
      throw new Error("Invalid email or password");
    }
    return { user: MOCK_USER, token: "mock-token-123" };
  },
  async logout() {
    await new Promise((r) => setTimeout(r, 100));
  },
};