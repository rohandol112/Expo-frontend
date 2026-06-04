# Backend Integration Plan

## Backend Sources

- Backend project: `C:\Users\vivek gupta\OneDrive\Desktop\pehli-baat\Expo-router-backend`
- Deployed backend: `https://expo-router-backend.onrender.com`
- Swagger UI: `https://expo-router-backend.onrender.com/docs`
- OpenAPI JSON: `https://expo-router-backend.onrender.com/openapi.json`
- Frontend API base: `${VITE_API_BASE_URL}/api`

## Confirmed API Shape

- Base API prefix: `/api`
- Response envelope: `{ success: boolean, message?: string, code?: string | null, data?: unknown }`
- Some auth/admin failures return HTTP `200` with `success: false`, so the frontend must check the envelope.
- Auth headers supported by backend: `Authorization: Bearer <token>` or `api-token: <token>`.
- Pagination format for list endpoints that support it: `{ items, page, per_page, total, has_more }`.
- Public locale header is handled by backend language middleware; Phase 1 does not need custom language headers.

## Available Backend Modules

- Auth and profile: `/api/auth/*`
- News/videos feed: `/api/news`, `/api/videos`
- Admin news management: `/api/admin/news/*`
- Channels/news sources: `/api/channels`, `/api/admin/channels/*`
- Regions/location tree: `/api/regions`
- Languages: `/api/languages`, `/api/admin/languages/*`
- Categories: `/api/categories`, `/api/admin/categories/*`
- Preferences: `/api/preferences`

## Missing Or Not Stable For This Admin Panel Yet

- Users admin management
- Complaints
- Reports/analytics for dashboard charts
- Monetization/ads
- Offers
- Listings
- Referrals
- Settings
- Notifications/push management
- Role and permission management

## Phase 1 Endpoints Selected

- Languages:
  - `GET /api/admin/languages`
  - `POST /api/admin/languages`
  - `GET /api/admin/languages/:id`
  - `PUT /api/admin/languages/:id`
  - `PUT /api/admin/languages/:id/status`
  - `DELETE /api/admin/languages/:id`
- Categories:
  - `GET /api/admin/categories`
  - `POST /api/admin/categories`
  - `GET /api/admin/categories/:id`
  - `PUT /api/admin/categories/:id`
  - `PUT /api/admin/categories/:id/status`
  - `DELETE /api/admin/categories/:id`
- Channels:
  - `GET /api/admin/channels`
  - `POST /api/admin/channels`
  - `GET /api/admin/channels/:id`
  - `PUT /api/admin/channels/:id`
  - `DELETE /api/admin/channels/:id`
- Admin News:
  - `GET /api/admin/news`
  - `GET /api/admin/news/stats`
  - `POST /api/admin/news`
  - `GET /api/admin/news/:id`
  - `PUT /api/admin/news/:id`
  - `DELETE /api/admin/news/:id`
  - `POST /api/admin/news/:id/approve`
  - `POST /api/admin/news/:id/reject`
  - `POST /api/admin/news/:id/schedule`

## Frontend Pages Integrated Now

- `/system/language`
- `/categories`
- `/channels`
- `/news/admin`

These pages now use TanStack Query hooks and keep mock data fallback when admin auth is unavailable.

## Frontend Pages Kept On Mock Data

- Dashboard analytics
- Add forms until backend media upload flow is connected end to end
- Users
- Complaints
- Reports
- Monetization
- Offers
- Listings
- Referrals
- Settings
- Notifications
- Roles/permissions

## Payload Mapping Notes

- Backend language fields use snake_case: `native_name`, `is_active`, `sort_order`.
- Backend category fields use `icon_url`, `sort_order`, `is_active`, and `translations`.
- Backend channels are currently named `NewsSourceData` in Swagger: `title`, `company_name`, `source_url`, `image_url`, `is_active`.
- Backend admin news fields use video/news naming: `language_code`, `news_source_id`, `thumbnail_url`, `view_count`, `visibility.scope`.
- Frontend page components should receive existing UI types; backend-specific fields are mapped in service adapters.

## Auth Notes

- Current frontend login is hardcoded and must not be broken.
- Backend auth supports OTP endpoints, not an email/password admin login endpoint.
- Admin APIs require JWT users with `admin` or `subadmin` role.
- Phase 1 creates auth service methods for available OTP/profile endpoints, but does not replace the current login screen.
- Until admin token flow is agreed, Phase 1 pages will show mock fallback if backend returns `tokenMissing`, `tokenInvalid`, or `forbidden`.

## Risks And TODOs

- Confirm how project leaders want admin users to obtain JWTs.
- Confirm whether channel subscriber/post counts should be added to backend responses or computed separately.
- Confirm category image/video upload lifecycle; backend currently accepts `icon_url`, not direct file upload.
- Add real create/update form submissions only after auth and upload flow are settled.
- Add tests around adapters once backend response fixtures are stable.
