# CreatorHub

A working prototype of YouTube's core video consumption & discovery experience, built from a full product requirements document — auth, real video upload and streaming, a personalized feed, search, subscriptions, notifications, and live chat.

**Live demo:** https://authentic-creator-vault-hub.base44.app

## What it does

CreatorHub lets creators upload videos that are transcoded and streamed with real adaptive bitrate playback via Mux, while viewers browse a personalized home feed, search, subscribe to channels, and get notified of new uploads.

### Features

- **Auth & roles** — creator and viewer accounts, with creator-only upload access
- **Real video pipeline** — uploads are processed through Mux's API for transcoding and adaptive-bitrate streaming, not just raw file playback
- **Watch page** — embedded Mux player, like/dislike (dislike count hidden from non-creators, matching YouTube's actual behavior), share, and threaded comments with pinning
- **"For You" home feed** — mixes videos from subscribed channels with category matches from watch history, falling back to recent uploads for new users
- **Search** — matches videos by title and description
- **Subscriptions feed** — a dedicated, unfiltered, chronological feed of only-subscribed content
- **Notifications** — bell-icon system that notifies subscribers when a creator publishes, respecting per-user notification preferences
- **Live chat** — a lightweight, auto-refreshing chat panel on the watch page

## Tech stack

- **Frontend:** React + Vite
- **Backend/platform:** [Base44](https://base44.com) — AI app builder handling auth, database, and serverless functions
- **Video infrastructure:** [Mux](https://mux.com) — transcoding, adaptive bitrate streaming, thumbnails

## Scope notes

This is a prototype, not YouTube's actual infrastructure — things like global CDN edge caching, sub-400ms playback start at scale, and ingesting thousands of hours of video per minute are data-center-scale engineering problems that are intentionally out of scope here. The goal was to replicate the *product experience*, not the infrastructure scale.

---

## Running it locally

This repo is generated from a [Base44](https://base44.com) app. To run or edit it locally:

1. Clone this repository
2. Run `npm install`
3. Install the Base44 CLI: `npm install -g base44@latest`
4. Run `base44 dev` to start the local backend and frontend together

See [Base44's docs](https://docs.base44.com/Integrations/Using-GitHub) for the full CLI reference and hosted-backend setup.
