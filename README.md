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
- Forgot password: dedicated designed flow — Forgot Password screen uses the login poster collage at the top (same asset, fading to black before the content): back arrow, StreamMax logo lockup over the poster (centered at 17.6% height, matching the mock), "Forgot Password?" centered split title (white + blue-to-purple gradient), two-line centered subtitle ("No worries! Enter your email address and we'll send you a link to reset your password."), tall dark-navy email field with blue border and mail icon, gradient "Send Reset Link" pill button with arrow, "Remember your password? Sign In" footer; Enter Reset Code screen (lockup header, message-bubble-with-padlock icon in the gradient ring, six rounded code boxes with glowing active border and cursor, resend timer starting at 01:23, "Next" button, "Didn't receive the code? Resend", and the login screen's blue-violet wave glow along the bottom edge), then a Reset Password screen (flat deep-navy background with a designed top aurora: indigo corner glow + sweeping blue ribbon; padlock in a glowing blue-violet ring, "Reset Password" split gradient title, three-line instruction, two password fields with eye toggles, a live 4-item requirements checklist (8 characters / a letter / a number / a symbol) with blue checks, gradient "Reset Password" button, "Back to Login" footer, and the login bottom wave glow) — six-digit codes expire in 10 minutes and invalidate after 5 wrong attempts; until the backend mail service is connected the code is shown in a system dialog; every auth screen surfaces errors as Veltravia-style dark pill toasts that slide in at the top below the status bar and auto-dismiss
- Session routing: splash resumes a remembered session straight to Home; account avatar in the Home top bar shows the signed-in initial and signs out (confirm dialog)
- Auth service is an isolated layer (`src/core/auth/authService.ts`) so storage can later be swapped for a remote backend without touching screens
- Splash screen with deep navy radial backdrop, faint poster art in the corners and two sweeping translucent film-strip ribbons with sprocket holes
- Android 12+ device splash (SplashScreen API): neon logo icon on the deep navy backdrop, matching icon background inside the system container and a 200 ms icon animation, followed by the in-app cinematic splash
- Welcome onboarding: cinematic TV-room hero (new background art) runs edge to edge as the full-screen backdrop fading into deep black, with the neon logo, StreamMax wordmark, tagline, description, gradient feature icons, full-width Get Started CTA and page dots overlaid on top at design-mockup proportions — fixed layout, no scrolling
- Create Account and Login with corner hero art, brand lockup, gradient title accent, gradient-focused first field and full-width gradient CTA. Create Account uses a compact vertical chain: the CTA sits directly under the field stack, social buttons follow sequentially, and the sign-in row + legal footer are anchored from the screen bottom so they never clip.
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
### DramaPlayer (opened from any Dramas card)
MovieBox-style full-screen short-drama player, now matching the episode-feed recording:
- Vertical episode paging: swiping up/down moves between episodes (EP01..EPn); the top EP label, subtitle, description and the EP01/EP67 pill track the active episode. Locked episodes keep the top bar, right icon column, bottom meta, episode pill and utility row visible over a dimmed frame.
- Premium is NOT live yet: every episode plays for everyone. Planned rules (documented in code for when Premium launches): only the first 10 episodes free, downloading a drama requires Premium, watching complete episodes requires Premium, owner gets a permanent override.

MovieBox-style full-screen short-drama player measured from the reference screenshots. Interaction per Ijezie:
- Every overlay — top back/EP bar, centered subtitle, right icon column (download, bookmark with count, share), bottom meta (thumbnail, title, description with a More/Less pill), the EP01/EP67 episode-selector pill, and the utility row (gold Premium Pro pill, speed dial opening a semi-transparent black rounded popup above the trigger with 0.5x–2x and the active speed highlighted in #00f2fe, HD 480P badge) — auto-hides after 3 seconds while playing.
- Tap with overlays hidden brings everything back; tap while visible pauses (and resumes) the video, and while paused the overlays stay on screen. Paused state shows a translucent center play button.
- The thin seek line at the very bottom edge is the only way to forward/scrub the video (thickens with a larger handle while dragging). No double-tap or hold gestures in this player.
- Bookmark toggles green with an incremented count; download/share and the episode selector are wired as visual placeholders pending the real drama backend. Episode counts are placeholder data.


### Dramas (bottom-bar tab, replaces the old direct-to-search routing)
MovieBox-style short-drama screen built from the reference recording, with the premium banner and error state explicitly excluded per Ijezie:
- Snap hero carousel of tall portrait poster cards (62% screen width, 1.45 ratio) with neighbor cards peeking at the sides; each card carries a brand-gradient circular play button at the bottom-right and a title/meta/episode overlay.
- Latest / Hottest / All chip row: dark rounded pills with small brand-gradient icon badges; Latest/Hottest/All swaps the New Arrivals shelf data.
- Home screen loading state: same network-driven skeleton (NetInfo) — the full-height hero banner placeholder plus the poster-card rows pulse while loading, and offline keeps them loading indefinitely.
- Dramas loading state: pulsing dark skeleton placeholders (hero cards, chip pills, shelf posters with title/meta bars) shown while the drama feed loads; the load is network-driven via NetInfo: while the device is offline the skeleton stays up indefinitely (no error screen), and as soon as connectivity returns the feed fetches and the skeleton swaps out for the real layout (~1.2s placeholder fetch; swap in the real drama API call).
- Content shelves — New Arrivals, Top Searches, Asian Land — horizontal poster rows (104px cards) with two-line titles and episode counts.
- All content is placeholder (mock titles with episode counts); tapping a card opens the existing MovieView screen.
- The bar's Home button pops back to Home.



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
Rebuilt to mirror MovieBox's real player behavior (measured frame by frame from a screen recording):
- **Inline player**: a pinned 16:9 slot directly under the status bar at the top of the movie page; the page (title, resources, episodes, For you / Comments) scrolls underneath it. Real playback via `react-native-video` (native Media3/ExoPlayer, HLS and MP4).
- **Portrait controls**: back arrow (top-left), Help "?" (top-right), bottom row = pause/play, thin white seek bar with dot, `00:25/43:43` time, mini-window icon, fullscreen icon. Controls auto-hide after ~3s; single tap shows/hides them.
- **Gestures**: double-tap left/right = seek -10s/+10s with a dim circle ripple labelled "10 seconds"; vertical swipe on the left half = brightness, right half = volume, each with a centered dark HUD pill and a level bar that fades out ~0.7s after release. Works whether the controls are showing or hidden (blocked only in Lock mode).
- **Two-stage volume (MovieBox-verified from its APK + recordings)**: the pill's speaker icon swaps in quantized bands like MovieBox's `ls_ic_player_feedback_volume_0/33/66/100` drawables (mute / one wave / two waves / three waves). The bar is two ranges: 0–100% fills white left-to-right; swiping past the top switches to a boost range where the track turns full white and a green segment (#0FA64C, sampled from the reference) grows to 100% = 200%. Swiping back down shrinks green, then white. Brightness mirrors it with a 3-band sun icon (33/66/100) and a white bar.
- **Fullscreen (landscape)**: tapping the fullscreen icon takes over the screen in landscape with: back arrow + episode title (top-left), Help and Setting (top-right), "Tap to Lock" chip (left-middle), rewind-10 / pause / forward-10 (center), current time + seek bar + total time, then pause, next-episode, and right-aligned **Fit / Language / 1x / Rotate**. Rotate returns to portrait.
- **Lock mode (MovieBox Layer 2C)**: "Tap to Lock" (plain white icon + text, no pill) hides every control and blocks all gestures. The "Tap to Unlock" prompt appears mid-left when the screen is tapped and auto-hides after ~3s exactly like the other controls — tap the screen to bring it back; tapping the prompt itself unlocks.
- **Pre-roll ad (free tier)**: black stage with an "AD" tag, countdown + gold "Go ad-free >" (top-right) and "Tap and skip the ad" (bottom-right); playback starts when it ends. Ad content is a placeholder slot until an ad network is connected.
- **Sheets**: playback speed (0.5x-2x), Language (subtitle tracks from the stream), Setting.
- Until per-title stream URLs are in the catalog it plays a public test HLS stream that includes real subtitle tracks.

- **Volume boost is real, not cosmetic**: the player library is patched via `patch-package` (see `patches/react-native-video+6.19.3.patch`, auto-applied by the `postinstall` script).
  - **Android**: values above 100% attach a system `LoudnessEnhancer` DSP to ExoPlayer's audio session and drive up to +6 dB gain (200% = +6 dB); the base player volume stays capped at 1.0 and mute resets gain to 0.
  - **iOS**: values above 100% are applied as software gain on the audio track via `AVAudioMix` (capped at 2.0). Progressive/MP4 playback amplifies fully; HLS assets may not expose audio tracks, in which case boost safely no-ops.

- **Bottom button bar (MovieBox-style)**: a floating rounded bar (radius 22, dark glass `rgba(13,15,23,0.97)` with a subtle border) hovering 10dp above the gesture area, on Home and Search. Four evenly spaced items — Home, Dramas, Downloads, Me — with 22dp icons and 10sp labels; the active item's label renders as a cyan-to-purple gradient (`#00d2ff` → `#9d50bb`) with a white icon, inactive items slate grey (`#7A8296`). Home and Search route between screens; Downloads/Mine are placeholders until their screens exist. The Me icon is the MovieBox-style person glyph measured from the reference: a large circle head floating above a wide horizontal oval body; untapped both shapes are stroked light grey, tapped both fill with the StreamMax gradient (cyan top to purple bottom).

The Dramas icon matches the tab family: a rounded screen with a play triangle inside — untapped a light-grey outline with a stroked triangle, tapped the screen fills with the StreamMax gradient and the triangle goes solid dark (mirroring the Downloads square). It replaces the stock magnifier while the tab still routes to the search screen.

The Downloads icon is the MovieBox-style three-state rounded square: untapped it is a light-grey outline square with a down-arrow stroke and a brand-gradient pill badge at the top-right corner showing the paused-download count (the total of downloads paused and not yet completed); tapped the square fills with the StreamMax gradient (cyan `#00d2ff` to purple `#9d50bb`) with a solid dark arrow; when a download is interrupted because the network went offline, or the user is offline and resumes, the badge swaps to a red circle (`#E34338`) with a white exclamation mark. Both values are plumbed as `downloadsCount` / `downloadsWarning` props on the bar, ready to wire to the real download engine.

The Home icon is the MovieBox-style two-state house measured from the reference: untapped it is a rounded-pentagon outline with a center door stroke in light grey (`#C1C4CC`); tapped the pentagon fills with the StreamMax gradient (cyan `#00d2ff` bottom-left to purple `#9d50bb` top-right) with a door cutout in the bar's background color, and its label turns white bold. Inactive items across the bar are light grey, active labels white.

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
