# News API Gaps

Backend admin news payload is clear in source, but the current frontend Add News flow is not ready for safe live create/edit writes.

## Backend Requires

- `title`
- `description`
- `news_source_id`
- `category_ids`
- Optional `subcategory_ids`
- Optional `location` ids: `state_id`, `district_id`, `area_id`
- Optional `visibility` ids: `state_ids`, `district_ids`, `area_ids`
- Optional `status`: `draft`, `publish`, `schedule`
- `scheduled_for` when `status = schedule`

## Frontend Gap

- Current Add News uses mock display labels for channel/category/location.
- Backend requires numeric ids.
- The UI has a multi-step shape, but not a single typed payload object yet.
- Media upload must happen after a backend news record exists because upload URLs use `/:id/upload-url`.

## Implemented In Phase 2

- Admin news list.
- Admin news stats.
- Approve.
- Reject with a default admin reason.
- Schedule with a temporary “tomorrow” action.
- Delete.

## TODO

- Replace mock channel/category/location selectors with backend id-backed options.
- Build a typed Add News form state that maps to backend `AdminCreateNewsInput`.
- Add a proper reject reason dialog.
- Add schedule date/time picker before using live schedule mutation in production workflows.
- Add edit page only after id-backed selectors are in place.
