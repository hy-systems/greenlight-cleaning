# Greenlight Cleaning

Marketing website for Greenlight Cleaning Pty Ltd, a domestic and commercial cleaning business operating across Melbourne, Australia.

Live site: https://greenlight-cleaning.vercel.app

## Tech stack

- **React 18** with **React Router 6** for client-side routing
- **Vite 5** for the dev server and production build
- **Tailwind CSS** loaded from the CDN in `index.html` (not a build step)
- **lucide-react** for icons
- **Vercel** for hosting, including one serverless function

## Getting started

Requires Node.js 18 or newer.

```bash
npm install     # install dependencies
npm run dev     # start the local dev server (http://localhost:5173)
npm run build   # produce a production build in dist/
npm run preview # serve the production build locally
```

## Project structure

```
src/App.tsx              Entire application: routing, data, and all page components
index.html               HTML shell, Tailwind CDN, and static SEO/social meta tags
api/send-notification.js Vercel serverless function that sends enquiry notifications
public/                  Static assets served from the site root
  sitemap.xml            Sitemap listing every route
  robots.txt             Crawler rules
  logo.png               Company logo, also used as the favicon
  *.jpg                  Before and after gallery images
vercel.json              Rewrites all paths to index.html for client-side routing
```

Note that `src/App.tsx` is a single large file containing all page components, the
services and suburbs data, and the router configuration. Content changes are usually
made in the `SERVICES` and `SUBURBS` objects near the top of that file.

## Enquiry form

The enquiry form on the homepage posts JSON to `/api/send-notification`, which is
implemented in `api/send-notification.js` and runs as a Vercel serverless function.
It sends the enquiry details to the business via SMS and WhatsApp using the Twilio
REST API. If the request fails, the form falls back to opening WhatsApp and a
`mailto:` link so the enquiry is never lost.

The endpoint always returns HTTP 200 with a per-channel result, for example:

```json
{ "ok": true, "results": { "sms": "sent", "whatsapp": "sent" } }
```

## Environment variables

Set these in the Vercel project under Settings, Environment Variables. They are read
only by the serverless function and are never exposed to the browser.

| Variable | Required | Description |
| --- | --- | --- |
| `TWILIO_ACCOUNT_SID` | Yes | Twilio account SID, begins with `AC`. Identifies the Twilio account used to send messages. |
| `TWILIO_AUTH_TOKEN` | Yes | Twilio auth token. Secret credential paired with the account SID. |
| `TWILIO_PHONE_NUMBER` | Yes | The Twilio number messages are sent **from**, in E.164 format. |
| `NOTIFY_PHONE_NUMBER` | No | The number enquiry alerts are sent **to**, in E.164 format. Defaults to `+61430230971` if unset. |

If the three required Twilio variables are missing, the endpoint returns HTTP 500
with `{ "error": "Twilio is not configured on the server yet" }`.

## Deployment

Vercel is connected to this repository and deploys automatically. Any push to `main`
triggers a production deploy; pull requests get preview deploys. Build command is
`npm run build` with an output directory of `dist`.

To deploy manually, run `npx vercel --prod` from the project root.
