# Phase 2 CRUD Audit

## Languages

- List: implemented through `GET /api/admin/languages`.
- Detail: implemented through `GET /api/admin/languages/:id`.
- Create: implemented through `POST /api/admin/languages`.
- Update: implemented through `PUT /api/admin/languages/:id`.
- Status update: implemented through `PUT /api/admin/languages/:id/status`.
- Delete: implemented through `DELETE /api/admin/languages/:id`.
- UI: list status toggle, delete confirmation, add form, edit form.

## Categories

- List: implemented through `GET /api/admin/categories`.
- Detail: implemented through `GET /api/admin/categories/:id`.
- Create: implemented through `POST /api/admin/categories`.
- Update: implemented through `PUT /api/admin/categories/:id`.
- Status update: implemented through `PUT /api/admin/categories/:id/status`.
- Delete: implemented through `DELETE /api/admin/categories/:id`.
- UI: list status toggle, delete confirmation, add form, edit form.
- Media: backend accepts `icon_url`; direct category image/video upload is not implemented.

## Channels

- List: implemented through `GET /api/admin/channels`.
- Detail: implemented through `GET /api/admin/channels/:id`.
- Create: implemented through `POST /api/admin/channels`.
- Update: implemented through `PUT /api/admin/channels/:id`.
- Delete: implemented through `DELETE /api/admin/channels/:id`.
- UI: delete confirmation, add form, edit form.
- Location fields remain frontend-only because backend channel schema currently uses news-source fields.

## Admin News

- List: implemented through `GET /api/admin/news`.
- Stats: implemented through `GET /api/admin/news/stats`.
- Detail/update/create service methods exist.
- Delete: implemented through `DELETE /api/admin/news/:id`.
- Approve: implemented through `POST /api/admin/news/:id/approve`.
- Reject: implemented through `POST /api/admin/news/:id/reject`.
- Schedule: implemented through `POST /api/admin/news/:id/schedule`.
- Full create/edit UI is intentionally not wired yet because the current Add News UI uses labels while backend requires stable channel/category/location ids.

## Users

- List: implemented through `GET /api/admin/users`.
- Stats: implemented through `GET /api/admin/users/stats`.
- Detail: implemented through `GET /api/admin/users/:id`.
- Create/Update service methods exist (`POST`/`PUT /api/admin/users/:id`), matching `adminUpdateUserSchema` (`name`, `email`, `gender`, `dob`, `role`, `is_active` only — no location/language fields accepted on update).
- Status update (suspend/activate): implemented through `PUT /api/admin/users/:id/status`.
- Delete: implemented through `DELETE /api/admin/users/:id`.
- UI: list page with stats, search, status/type/language/location filters, suspend-or-activate confirmation dialog, delete confirmation dialog.
- The `deviceType` column was removed — backend does not provide device/platform data for users.

## Complaints

- List: implemented through `GET /api/admin/complaints`.
- Stats: implemented through `GET /api/admin/complaints/stats`.
- Detail: implemented through `GET /api/admin/complaints/:id`.
- Create/Update service methods exist.
- Status update (with optional admin response note): implemented through `PUT /api/admin/complaints/:id/status`. Frontend display labels (`Pending`, `In Review`, ...) are mapped to/from backend snake_case codes via `STATUS_LABELS`/`STATUS_VALUES` in `complaint.adapter.ts`.
- Delete: implemented through `DELETE /api/admin/complaints/:id`.
- Conversation: implemented through `GET/POST /api/admin/complaints/:id/messages`.
- Status timeline: implemented through `GET /api/admin/complaints/:id/timeline`.
- Image upload URL request: service method exists for `POST /api/admin/complaints/image/upload-url`.
- UI: list page with stats, search, status/priority/category/language/location filters; detail page (`/complaints/:complaintId`) showing complaint info, description, admin response, image gallery, conversation thread with reply box, and status-update panel with timeline.
- The `videos` field was removed from the `Complaint` type — backend does not support video attachments on complaints.
- "Add New Complaint" action was removed from the list page because no create form exists yet (complaints are reported by end users, not created by admins in the current flow).

## Complaint Categories (service layer)

- Full CRUD + status toggling implemented in `complaintCategory.service.ts` for categories, sub-categories, and assign-rules (`/api/admin/complaint-categories/*`), including their own stats endpoints. Status updates use `PATCH .../status` (different verb than users/complaints, confirmed against `adminComplaintCategoryRoutes`).
- No dedicated management UI/route exists yet for these (would require new routes under `routes.constants.ts` and `routes/_app/`); currently consumed by `useComplaintCategories()` to power the category filter dropdown on the complaints list page.

## Auth Handling

- Current hardcoded admin login remains unchanged.
- No OTP/admin auth integration was added.
- API client supports optional manual token through `localStorage.pehli-baat-admin-token`.
- If admin token is missing/invalid/forbidden, integrated list pages keep showing mock fallback data.
