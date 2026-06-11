# Just on the Spectrum — Landing Page

A colorful, animated landing page for **Just on the Spectrum**: educational
content, resources, and practical guides for parents raising children on the
autism spectrum.

## Stack

- Static HTML / CSS / vanilla JS — no build step
- [GSAP 3](https://gsap.com) + ScrollTrigger (vendored in `vendor/`)
- Self-hosted fonts: Fraunces (display) + Outfit (UI), in `fonts/`

## Run locally

Any static server works:

```sh
npx http-server .        # then open http://localhost:8080
```

## Features

- Animated hero with word-by-word headline reveal, parallax floating shapes,
  and a rotating "Sharing …" word loop
- Infinite marquee, scroll-triggered section reveals, stat counters,
  and a pinned horizontal-scrub "Highs & Lows" gallery (desktop) that falls
  back to native swipe on mobile
- Fully responsive (tested at 390px and 1440px) with a mobile overlay menu
- **Motion accessibility**: honors `prefers-reduced-motion` and includes an
  on-page "Reduce motion" toggle (persisted in `localStorage`) that disables
  all animation while keeping every piece of content visible — important for
  sensory-sensitive visitors
- Works with JavaScript disabled (content is never hidden by default)

## TODO

- Point the Instagram / TikTok / YouTube buttons in the "Join us" section at
  the real profile URLs (`index.html`, search for `TODO`)
- Wire the newsletter form to a real email service (currently front-end only)
