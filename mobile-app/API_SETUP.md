# Connecting the mobile app to the team API

The **backend is owned by another team**. Do not change their server code from this frontend repo—only configure URLs and keep `src/services/api.ts` aligned with **`ReceiptController`** in their project.

**Backend source:** [Receipts-To-Spending-Tracker](https://github.com/UcheOnwe/Receipts-To-Spending-Tracker) → `backend-api/API`.

## Run the API (same as backend team)

```powershell
cd backend-api\API
dotnet run --launch-profile https
```

Use whatever host/port their `launchSettings.json` and environment define. The mobile app expects the API base to include the **`/api`** segment (see `src/services/api.ts`).

## Mobile app base URL

- **Android emulator:** defaults to `http://10.0.2.2:5001/api` (host machine).
- **iOS simulator:** defaults to `http://127.0.0.1:5001/api`.
- **Physical device:** set `mobile-app/.env`:

  `EXPO_PUBLIC_API_URL=http://YOUR_PC_LAN_IP:5001`

  (`/api` is appended automatically if missing.)

## Endpoints used by the app

Aligned with `ReceiptController`: `GET/POST /api/receipt`, `GET/DELETE /api/receipt/{id}`, `POST /api/receipt/setup-test-user`.

## JSON shape

Responses are normalized in code for **camelCase or PascalCase** property names so the app matches typical ASP.NET JSON without changing the server.

If `UseHttpsRedirection` or CORS causes problems in dev, that is decided and fixed on the **backend** side; this frontend only calls their URLs.
