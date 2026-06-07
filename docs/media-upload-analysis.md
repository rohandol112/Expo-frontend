# Media Upload Analysis

## Backend Support

Backend uses Cloudflare R2 with presigned PUT URLs.

Confirmed supported upload flows:

- Profile photo:
  - `POST /api/auth/profile/photo/upload-url`
  - `POST /api/auth/profile/photo/confirm`
- News/video file:
  - `POST /api/news/:id/upload-url`
  - `POST /api/news/:id/upload-confirm`
  - `POST /api/videos/:id/upload-url`
  - `POST /api/videos/:id/upload-confirm`
- Thumbnail:
  - `POST /api/news/:id/thumbnail/upload-url`
  - `POST /api/news/:id/thumbnail/confirm`
  - `POST /api/videos/:id/thumbnail/upload-url`
  - `POST /api/videos/:id/thumbnail/confirm`

## File Types

- Video upload content types: `video/mp4`, `video/quicktime`, `video/webm`.
- Thumbnail/profile content types: `image/jpeg`, `image/png`, `image/webp`.

## Not Yet Supported For Admin Panel Forms

- Category direct image/video upload.
- Channel logo/video upload.
- Language icon/video upload.
- Generic admin media endpoint.

## Frontend Decision

- Do not fake uploads for category/channel/language.
- Category form uses `icon_url`.
- Channel form uses `image_url`.
- Existing UI-only media pickers remain only where the old design already had them and are marked TODO if backend has no field.

## Next Steps

- Add a reusable presigned upload service after admin JWT flow exists.
- Wire news thumbnail/video uploads after a backend news record is created.
- Ask backend team whether category/channel/language media should use a generic admin upload endpoint or URL-only fields.
