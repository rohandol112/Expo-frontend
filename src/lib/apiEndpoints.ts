export const ApiEndpoints = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USER: {
    PROFILE: '/users/profile',
    GET_BY_ID: (userId: string) => `/users/${userId}`,
  },
} as const;
