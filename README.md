<div align="center">

<img src="src/assets/img/logo.png" width="140" alt="StreamMax logo" />

# StreamMax

**Your Movies. Your Way.**

A modern movie and TV streaming platform for Android and iOS.

React Native · TypeScript · Dark Cinematic UI

[![Build](https://img.shields.io/badge/build-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/kora-messenger/StreamMax/actions)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-6C63FF)]()
[![License](https://img.shields.io/badge/license-Proprietary-00D2FF)]()

</div>

---

## Overview

StreamMax is a full-featured streaming app built with React Native. It delivers a premium, cinema-grade experience: a dark, immersive interface, a purple-to-blue brand gradient, and a neon play-button-and-film-strip logo. Discovery, search and playback are designed to feel instant and personal.

## Features

### Authentication
- Real device-local accounts: salted SHA-256 password hashing (js-sha256), per-field validation with red error states and an inline error banner — no plaintext passwords ever stored (AsyncStorage)
- Create Account: name/email/password/confirm validation, duplicate-email protection, auto sign-in on success
- Login: credential checks with field-specific errors ("No account found with this email", "Incorrect password"), Remember me checkbox (session persists across app restarts only when checked)
- Forgot password: dedicated designed flow — Forgot Password screen uses the login poster collage at the top (same asset, fading to black before the content): back arrow, "Forgot Password?" centered split title (white + blue-to-purple gradient), two-line centered subtitle ("No worries! Enter your email address and we'll send you a link to reset your password."), tall dark-navy email field with blue border and mail icon, gradient "Send Reset Link" pill button with arrow, "Remember your password? Sign In" footer; Enter Reset Code screen (lockup header, message-bubble-with-padlock icon in the gradient ring, six rounded code boxes with glowing active border and cursor, resend timer starting at 01:23, "Next" button, "Didn't receive the code? Resend", and the login screen's blue-violet wave glow along the bottom edge), then a Reset Password screen (flat deep-navy background with a designed top aurora: indigo corner glow + sweeping blue ribbon; padlock in a glowing blue-violet ring, "Reset Password" split gradient title, three-line instruction, two password fields with eye toggles, a live 4-item requirements checklist (8 characters / a letter / a number / a symbol) with blue checks, gradient "Reset Password" button, "Back to Login" footer, and the login bottom wave glow) — six-digit codes expire in 10 minutes and invalidate after 5 wrong attempts; until the backend mail service is connected the code is shown in a system dialog; every auth screen surfaces errors as Veltravia-style dark pill toasts that slide in at the top below the status bar and auto-dismiss
- Session routing: splash resumes a remembered session straight to Home; account avatar in the Home top bar shows the signed-in initial and signs out (confirm dialog)
- Auth service is an isolated layer (`src/core/auth/authService.ts`) so storage can later be swapped for a remote backend without touching screens
- Splash screen with deep navy radial backdrop, faint poster art in the corners and two sweeping translucent film-strip ribbons with sprocket holes
- Android 12+ device splash (SplashScreen API): neon logo icon on the deep navy backdrop, matching icon background inside the system container and a 200 ms icon animation, followed by the in-app cinematic splash
- Welcome onboarding: cinematic TV-room hero (new background art) runs edge to edge as the full-screen backdrop fading into deep black, with the neon logo, StreamMax wordmark, tagline, description, gradient feature icons, full-width Get Started CTA and page dots overlaid on top at design-mockup proportions — fixed layout, no scrolling
- Create Account and Login with corner hero art, brand lockup, gradient title accent, gradient-focused first field and full-width gradient CTA
- Google and Apple sign-in options
- Remember me and forgot-password flows

### Discovery
- Home screen with auto-rotating full-bleed hero banners with baked key-art titles, a tappable heading-less card strip of the banner titles (poster, name, year, download button), then Trending, Popular and New Releases — every banner and card opens the Movie View screen
- Rotating search pill with trending placeholders and gradient "Search" text; the far-right slot is reserved for future ad placements
- Category tabs: Football, Trending, Movie, Nollywood
- Horizontal title rows with one-tap download buttons

### Search
- Full search screen with recent and trending searches
- Movie / Series / Short TV / Music / Community tabs
- Ranked results list and community discovery

## Screens

| Screen | Purpose |
| --- | --- |
| Splash | Cinematic backdrop, sweeping film-strip ribbons, brand lockup and gradient spinner |
| Welcome | Onboarding and sign-up entry point |
| Create Account | New user registration |
| Login | Darkened character collage, brand lockup, gradient title accent, both fields gradient-bordered, corner glow backdrop |
| Home | Banners, categories and title rows |
| Search | Discovery, trending and community |
| Adaptive launcher icon | Transparent logo foreground on a dark gradient background, masked by Android into the device shape — no black square on the home screen (legacy rounded/circle PNGs included for older devices) |
| Movie View | Placeholder player (play/pause, progress, HD notice, fullscreen), meta line, action chips, resource block with episode grid, For you grid + Comments, floating Download button, download sheet with quality chips and episode checkboxes |

## Design system

| Token | Value |
| --- | --- |
| Background | `#050507` |
| Splash navy | `#0a1122` |
| Brand gradient | `#6C63FF` → `#00D2FF` |
| Accent wordmark | `#00D2FF` → `#B300FF` |
| Typography | System sans-serif, 800-weight display |

All icons are professional SVG. No emoji in the UI. Hero artwork fades into the background with custom gradients. The brand lockup uses an alpha-keyed neon logo with its own glow.

## Video player
- Real playback via `react-native-video` (native Media3/ExoPlayer core) — HLS (.m3u8) and MP4 sources, with `react-native-orientation-locker` forcing landscape while playing
- MovieBox-style gesture layer: double-tap left/right = seek -10s/+10s with ripple feedback, vertical swipe on the left half = brightness (dim layer), right half = player volume, both with a centered HUD pill
- Player overlay per the design mock: back arrow + StreamFlix lockup, cast / CC / three-dot top bar, rewind-10 / pause / forward-10 on a subtle dark pill, purple (#8A2BE2) seek bar with white glow knob, timestamps, fullscreen (contain/cover) toggle; controls auto-hide after ~3s, tap to resurface
- Playback speed sheet (0.5x–2x) and subtitle sheet wired to the stream's real text tracks (CC badge lights cyan when active)
- Movie view's big play button and fullscreen icon open the player; until per-title stream URLs are wired into the catalog it plays a public test HLS stream (Apple bipbop advanced, which includes real subtitle tracks)

## Tech stack

- **React Native 0.87** with React 19 and TypeScript
- **React Navigation** (native stack)
- **react-native-svg** for the icon and gradient-text system
- **react-native-linear-gradient** for surfaces and buttons
- **react-native-safe-area-context** for edge-to-edge layouts

## Project structure

```
src/
├── assets/       Logo, hero artwork, poster art
├── components/   Buttons, input fields, SVG icon set
├── data/         Mock catalog, categories, search data
├── navigation/   Stack navigator
├── screens/      Splash, Welcome, CreateAccount, Login, Home, Search, MovieView
└── theme/        Colors, gradients, radius tokens
```

## Getting started

```bash
npm install
npm run android   # or: npm run ios
```

Requires Node 22+ and JDK 21.

## Building the APK

Every push to `main` triggers a release build via GitHub Actions. Grab the `streammax-release-apk` artifact from the [Actions tab](https://github.com/kora-messenger/StreamMax/actions).

## Roadmap

- [ ] Title details screen
- [ ] Video player
- [ ] Downloads and offline playback
- [ ] Profile and account management
- [ ] Payments and premium plans
- [ ] Real catalog backend

## Status

Core experience implemented with mock data. Backend, playback and payments are in development.

---

© 2026 StreamMax. All rights reserved.
