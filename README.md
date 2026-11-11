# TEONA — coaching website

Next.js site with its API built in, backed by Firebase (Firestore and Authentication,
both on the free plan). Everything deploys to Vercel as one project; there is no separate
backend server to run and no paid Firebase feature is needed.

## How it is put together

| Part | Where | Notes |
|---|---|---|
| Pages and admin panel | `app/`, `components/` | React, Tailwind, Motion |
| API | `app/api/**/route.ts` | Next.js Route Handlers, same URLs the old Django API had |
| Server helpers | `lib/server/` | Firebase Admin SDK, auth, validation, uploads, notifications |
| Data | Firestore | collections listed in `lib/server/data.ts` |
| Sign-in | Firebase Authentication | email + password, driven from the API; tokens in httpOnly cookies |
| Files | Firestore (`files` collection) | hero image, event photos, certificates, vault files; images are compressed to WebP, served by `/api/files/{id}` |

## 1. Create the Firebase project (once)

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** (production mode, pick a region near Georgia, e.g. `europe-west3`).
4. **Project settings → Service accounts → Generate new private key.** Keep the JSON file; it is the `FIREBASE_SERVICE_ACCOUNT` value.
5. **Project settings → General → Web API Key** is the `FIREBASE_WEB_API_KEY` value.
6. Paste the contents of `firestore.rules` into the Firestore **Rules** tab and publish (it blocks all direct browser access; the API uses the Admin SDK).

Firebase Storage is not used (it needs a billing account): uploaded files are stored in Firestore.
Keep uploads reasonable: images are compressed automatically, and the free plan holds 1 GiB.

## 2. Run locally

```bash
pnpm install
cp .env.example .env.local   # then fill in the Firebase values
pnpm seed                    # first admin account + demo content
pnpm dev
```

`pnpm seed` needs `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env.local`. It creates the
admin, a demo member (`SEED_MEMBER_EMAIL` / `SEED_MEMBER_PASSWORD`, default `elena@email.com` /
`member1234`; set the password to an empty string to skip it), sessions with two months of
weekday availability, a group session with two dates, a package, a voucher, consultation slots,
events, pillars, testimonials and a test, all with Georgian translations. It never overwrites
existing data (it only fills in empty Georgian fields), so it is safe to run again.

### Local development with the Firebase emulators

You can run the whole site without a Firebase project by pointing it at the emulators:

```bash
npx firebase-tools emulators:start --import=.firebase-data --export-on-exit
```

(needs Java 21+). Then put only these in `.env.local`, seed and start the dev server:

```
GCLOUD_PROJECT=demo-ascend
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
SEED_ADMIN_EMAIL=admin@teona.ge
SEED_ADMIN_PASSWORD=admin12345
```

The emulator UI is at http://localhost:4000. Data is kept in `.firebase-data/` between runs.

## 3. Deploy to Vercel

1. Import the GitHub repository in Vercel.
2. **Settings → Environment Variables:** add `FIREBASE_SERVICE_ACCOUNT` and `FIREBASE_WEB_API_KEY`
   (and the optional ones from `.env.example`). For the service account, paste the JSON as a single line.
3. Deploy. Vercel detects Next.js; no build settings need changing.

## 4. Move data from the old Django backend (optional)

On the old server:

```bash
python manage.py dumpdata --indent 2 -e contenttypes -e auth.permission -e admin -e sessions -e token_blacklist -e notifications > dump.json
```

Then here:

```bash
pnpm import-django dump.json
```

Members keep their accounts and passwords: the old password hash is checked on their first
login and moved into Firebase Authentication. Uploaded images and vault files are not part of
a Django export; re-upload them from the admin panel.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | yes | Service-account JSON (raw or base64) |
| `FIREBASE_WEB_API_KEY` | yes | Email/password sign-in |
| `RESEND_API_KEY`, `EMAIL_FROM` | no | Send booking emails through Resend; otherwise they are only logged |
| `ADMIN_EMAIL` | no | Receives contact-form messages |
| `ADMIN_PHONE` | no | Shown in SMS log entries (no SMS provider is connected) |

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Development server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | TypeScript check |
| `pnpm seed` | First admin + demo content |
| `pnpm import-django <dump.json>` | Import an export from the old backend |

## Things to know

- **Google Meet links are placeholders** (`meet.google.com/mock-…`), as they were in the old backend.
  Real links need a Google Calendar integration.
- **No payment is taken.** "Confirm & Pay" records the booking as *Pending*; the admin confirms it.
- Notifications are written to the `notificationLogs` collection in Firestore even when no email provider is configured.
