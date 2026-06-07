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

## Auth Handling

- Current hardcoded admin login remains unchanged.
- No OTP/admin auth integration was added.
- API client supports optional manual token through `localStorage.pehli-baat-admin-token`.
- If admin token is missing/invalid/forbidden, integrated list pages keep showing mock fallback data.
