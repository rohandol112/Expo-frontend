// Central API endpoint registry. Replace BASE_URL when backend is ready.
export const API_BASE_URL = "/api";

export const API = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/me",
  },
  news: {
    list: "/news",
    admin: "/news/admin",
    create: "/news",
    detail: (id: string) => `/news/${id}`,
    update: (id: string) => `/news/${id}`,
    delete: (id: string) => `/news/${id}`,
  },
  categories: "/categories",
  channels: "/channels",
  users: "/users",
  complaints: "/complaints",
  reports: "/reports",
  notifications: "/notifications",
} as const;