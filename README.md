<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1h-FHIUVPdqF8Y0aBHTRuI_6qOP-i9hz0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

If you're deploying on Vercel, include the provided `vercel.json` so routes like `/admin` and `/blog` resolve to the SPA entrypoint instead of returning a 404.

## Payload-ready theme and routes

- Core marketing pages: `/`, `/purely-flex`, `/focused-development`, `/focused-recruiting`, `/focused-proposals`
- Blog index: `/blog`
- Admin login handoff for your Payload instance: `/admin`

Default admin credentials for local handoff and staging:

```
Email: admin@purely.works
Password: purely!123
```

Replace these with environment-specific secrets when connecting to a live Payload backend.

## How to log in to the admin handoff

1. Start the site locally with `npm run dev` (or deploy it and visit the hosted URL).
2. Open `/admin` in your browser (e.g., `http://localhost:5173/admin` when running locally).
3. Use the default credentials above to sign in and manage pages or blog posts via your Payload instance.

Once your Payload backend is wired up, swap in your real admin email/password (or SSO) so the handoff screen reflects the production credentials.
