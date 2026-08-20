const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || "https://api.pehlibaat.com";

function resolveApiOrigin(baseUrl: string) {
  const normalized = baseUrl.replace(/\/$/, "");

  if (typeof window === "undefined") {
    return normalized;
  }

  try {
    const url = new URL(normalized);
    if (window.location.protocol === "https:" && url.protocol === "http:") {
      url.protocol = "https:";
      return url.toString().replace(/\/$/, "");
    }
  } catch {
    return normalized;
  }

  return normalized;
}

export const API_ORIGIN = resolveApiOrigin(configuredBaseUrl);
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const API = {
  auth: {
    adminLogin: "/admin/auth/login",
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
    mergeGuest: "/auth/merge-guest",
    profile: "/auth/profile",
    profilePhotoUploadUrl: "/auth/profile/photo/upload-url",
    profilePhotoConfirm: "/auth/profile/photo/confirm",
    account: "/auth/account",
    logout: "/auth/logout",
  },
  languages: {
    publicList: "/languages",
    adminList: "/admin/languages",
    detail: (id: string | number) => `/admin/languages/${id}`,
    status: (id: string | number) => `/admin/languages/${id}/status`,
  },
  categories: {
    publicList: "/categories",
    publicDetail: (id: string | number) => `/categories/${id}`,
    subcategories: (id: string | number) => `/categories/${id}/subcategories`,
    videos: (id: string | number) => `/categories/${id}/videos`,
    adminList: "/admin/categories",
    detail: (id: string | number) => `/admin/categories/${id}`,
    status: (id: string | number) => `/admin/categories/${id}/status`,
    sort: "/admin/categories/sort",
    iconUploadUrl: "/admin/categories/upload-url",
  },
  channels: {
    publicList: "/channels",
    adminList: "/admin/channels",
    detail: (id: string | number) => `/admin/channels/${id}`,
    logoUploadUrl: "/admin/channels/logo/upload-url",
  },
  news: {
    list: "/news",
    adminList: "/admin/news",
    adminStats: "/admin/news/stats",
    detail: (id: string | number) => `/admin/news/${id}`,
    approve: (id: string | number) => `/admin/news/${id}/approve`,
    reject: (id: string | number) => `/admin/news/${id}/reject`,
    schedule: (id: string | number) => `/admin/news/${id}/schedule`,
    sendNotification: (id: string | number) => `/admin/news/${id}/send-notification`,
    feature: (id: string | number) => `/admin/news/${id}/feature`,
    bulk: "/admin/news/bulk",
    autoFillTranslations: "/admin/news/translations/auto-fill",
    poll: (id: string | number) => `/admin/news/${id}/poll`,
    pollResults: (id: string | number) => `/admin/news/${id}/poll/results`,
    uploadUrl: (id: string | number) => `/news/${id}/upload-url`,
    uploadConfirm: (id: string | number) => `/news/${id}/upload-confirm`,
    thumbnailUploadUrl: (id: string | number) => `/news/${id}/thumbnail/upload-url`,
    thumbnailConfirm: (id: string | number) => `/news/${id}/thumbnail/confirm`,
    imageUploadUrl: (id: string | number) => `/news/${id}/images/upload-url`,
    imageConfirm: (id: string | number) => `/news/${id}/images/confirm`,
    imageDelete: (id: string | number, imageId: string | number) => `/news/${id}/images/${imageId}`,
    view: (id: string | number) => `/news/${id}/view`,
    like: (id: string | number) => `/news/${id}/like`,
    share: (id: string | number) => `/news/${id}/share`,
    comments: (id: string | number) => `/news/${id}/comments`,
    categories: (id: string | number) => `/news/${id}/categories`,
  },
  users: {
    adminList: "/admin/users",
    adminSearch: "/admin/users/search",
    adminStats: "/admin/users/stats",
    detail: (id: string | number) => `/admin/users/${id}`,
    status: (id: string | number) => `/admin/users/${id}/status`,
  },
  complaints: {
    adminList: "/admin/complaints",
    adminStats: "/admin/complaints/stats",
    detail: (id: string | number) => `/admin/complaints/${id}`,
    status: (id: string | number) => `/admin/complaints/${id}/status`,
    imageUploadUrl: "/admin/complaints/image/upload-url",
    messages: (id: string | number) => `/admin/complaints/${id}/messages`,
    timeline: (id: string | number) => `/admin/complaints/${id}/timeline`,
  },
  notifications: {
    adminList: "/admin/notifications",
    adminStats: "/admin/notifications/stats",
    detail: (id: string | number) => `/admin/notifications/${id}`,
    publish: (id: string | number) => `/admin/notifications/${id}/publish`,
    send: (id: string | number) => `/admin/notifications/${id}/send`,
    thumbnailUploadUrl: "/admin/notifications/thumbnail/upload-url",
    open: (id: string | number) => `/notifications/${id}/open`,
  },
  complaintCategories: {
    list: "/admin/complaint-categories",
    stats: "/admin/complaint-categories/stats",
    uploadUrl: "/admin/complaint-categories/upload-url",
    detail: (id: string | number) => `/admin/complaint-categories/${id}`,
    status: (id: string | number) => `/admin/complaint-categories/${id}/status`,
    subCategories: "/admin/complaint-categories/sub-categories",
    subCategoryDetail: (id: string | number) => `/admin/complaint-categories/sub-categories/${id}`,
    subCategoryStatus: (id: string | number) => `/admin/complaint-categories/sub-categories/${id}/status`,
    assignRules: "/admin/complaint-categories/assign-rules",
    assignRuleStats: "/admin/complaint-categories/assign-rules/stats",
    assignRuleDetail: (id: string | number) => `/admin/complaint-categories/assign-rules/${id}`,
    assignRuleStatus: (id: string | number) => `/admin/complaint-categories/assign-rules/${id}/status`,
  },
  locations: {
    summary: "/admin/locations/summary",
    states: "/admin/locations/states",
    stateDetail: (id: string | number) => `/admin/locations/states/${id}`,
    stateStatus: (id: string | number) => `/admin/locations/states/${id}/status`,
    stateImageUploadUrl: "/admin/locations/states/upload-url",
    districts: "/admin/locations/districts",
    districtDetail: (id: string | number) => `/admin/locations/districts/${id}`,
    districtStatus: (id: string | number) => `/admin/locations/districts/${id}/status`,
    areas: "/admin/locations/areas",
    areaDetail: (id: string | number) => `/admin/locations/areas/${id}`,
    areaStatus: (id: string | number) => `/admin/locations/areas/${id}/status`,
  },
  regions: "/regions",
  competition: {
    adminStats: "/admin/competition/stats",
    adminLeaderboard: "/admin/competition/leaderboard",
    adminEntries: "/admin/competition/entries",
    adminEntry: (id: string | number) => `/admin/competition/entries/${id}`,
    adminUpdateEntry: (id: string | number) => `/admin/competition/entries/${id}`,
    adminDeleteEntry: (id: string | number) => `/admin/competition/entries/${id}`,
    adminReviewEntry: (id: string | number) => `/admin/competition/entries/${id}/review`,
    adminEntryNotes: (id: string | number) => `/admin/competition/entries/${id}/notes`,
    adminBanners: "/admin/competition/banners",
    adminReviewBanner: (id: string | number) => `/admin/competition/banners/${id}/review`,
    adminAiReviewBanner: (id: string | number) => `/admin/competition/banners/${id}/ai-review`,
    adminAiReviewPending: "/admin/competition/banners/ai-review",
    adminConfig: "/admin/competition/config",
    adminAssetUploadUrl: "/admin/competition/assets/upload-url",
    adminFormFields: "/admin/competition/form-fields",
    adminFormField: (id: string | number) => `/admin/competition/form-fields/${id}`,
    adminFormFieldsReorder: "/admin/competition/form-fields/reorder",
    publicConfig: "/competition/config",
    filters: "/competition/filters",
    adminReports: "/admin/competition/reports",
    adminReport: (id: string | number) => `/admin/competition/reports/${id}`,
    adminRules: "/admin/competition/rules",
    adminRule: (id: string | number) => `/admin/competition/rules/${id}`,
  },
  roles: {
    list: "/admin/roles",
    detail: (id: string | number) => `/admin/roles/${id}`,
    assign: (userId: string | number) => `/admin/roles/assign/${userId}`,
  },
  monetization: {
    settings: "/admin/monetization/settings",
    ads: "/admin/monetization/ads",
    ad: (id: string | number) => `/admin/monetization/ads/${id}`,
    reorder: "/admin/monetization/ads/reorder",
    uploadUrl: "/admin/monetization/ads/upload-url",
  },
  advertisement: {
    banners: "/admin/advertisement/banners",
    banner: (id: string | number) => `/admin/advertisement/banners/${id}`,
    bannersUploadUrl: "/admin/advertisement/banners/upload-url",
  },
  campaign: {
    settings: "/admin/campaign/settings",
    stats: "/admin/campaign/stats",
    uploads: "/admin/campaign/uploads",
    contacts: "/admin/campaign/contacts",
    uploadContacts: "/admin/campaign/contacts/upload",
    contact: (id: string | number) => `/admin/campaign/contacts/${id}`,
    callContact: (id: string | number) => `/admin/campaign/contacts/${id}/call`,
    start: "/admin/campaign/start",
  },
} as const;
