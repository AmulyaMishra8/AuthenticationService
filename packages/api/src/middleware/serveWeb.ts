import path from "node:path";
import express, { Router } from "express";

// ----------------------------------------------------------------------------
// In production we serve the built React app (packages/web/dist) from the SAME
// origin as the API. One origin means the auth cookies are first-party, so they
// keep working with SameSite=Lax and we need no CORS at all — exactly what a
// browser login flow wants. (In dev the web runs separately on Vite :5173, so
// this is only mounted when NODE_ENV=production — see app.ts.)
// ----------------------------------------------------------------------------

// __dirname at runtime: packages/api/dist/src/middleware -> up to packages/, then web/dist.
const WEB_DIST = path.resolve(__dirname, "../../../../web/dist");

// Requests beginning with these are API calls, never the single-page app. They
// are excluded from the SPA fallback so an unknown API path still 404s as JSON.
const API_PREFIXES = ["/auth", "/mfa", "/oauth", "/.well-known", "/health"];

export const serveWeb = Router();

// 1. Serve the hashed JS/CSS/image assets that Vite emitted.
serveWeb.use(express.static(WEB_DIST));

// 2. SPA fallback: any other GET returns index.html so react-router can handle
//    client-side routes (e.g. /login, /verify-email) on a full page load.
serveWeb.get("*", (req, res, next) => {
  if (API_PREFIXES.some((prefix) => req.path.startsWith(prefix))) return next();
  res.sendFile(path.join(WEB_DIST, "index.html"));
});
