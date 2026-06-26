# Deploying to Render

The whole monorepo deploys as **one** Render service: the Express API builds the
React app and serves it from the same origin. One free instance, no CORS, and the
auth cookies stay first-party so browser login works.

The blueprint is [`render.yaml`](./render.yaml).

## 1. Push to GitHub

```bash
git push
```

## 2. Create the service

1. In Render: **New +** → **Blueprint**.
2. Select this repository. Render reads `render.yaml` and proposes the
   `authentication-service` web service. Click **Apply**.

## 3. Set the secret env vars

`render.yaml` declares these as `sync: false`, so set them in the dashboard
(**Environment** tab). `ENCRYPTION_KEY` is auto-generated; leave it.

| Variable        | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| `DATABASE_URL`  | Supabase Postgres URL — include `?sslmode=require`, and URL-encode `@` in the password as `%40` |
| `REDIS_URL`     | Redis Cloud connection URL                                   |
| OAuth / SMTP    | Optional — only if you use Google/GitHub login or email      |

`WEB_ORIGIN` and `APP_URL` are set automatically from the service's public URL
at startup — no action needed.

## 4. JWT signing keys (recommended)

The API signs access tokens with an RSA key pair. Without a stable key, every
redeploy/restart invalidates existing sessions. To keep them stable, add the
keys as **Secret Files** in Render (**Environment** → **Secret Files**):

1. Generate a pair locally:
   ```bash
   npm run keys --workspace @auth/api      # writes packages/api/keys/*.pem
   ```
2. Add two secret files in Render with these **paths** and paste the contents:
   - `packages/api/keys/private.pem`
   - `packages/api/keys/public.pem`

> If you skip this, the start command generates a throwaway key pair on boot.
> It works, but users are logged out whenever the instance restarts.

## 5. OAuth redirect URIs (if using social login)

In the Google / GitHub developer consoles, set the callback URL to your live
service, e.g. `https://authentication-service-xxxx.onrender.com/oauth/google/callback`.

## Free-tier note

Free Render services sleep after ~15 min idle; the first request after that
takes a few seconds to wake. Supabase and Redis Cloud free tiers are fine
alongside it.
