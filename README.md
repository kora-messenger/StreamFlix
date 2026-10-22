<div align="center">

<img src="src/assets/img/logo.png" width="140" alt="StreamFlix logo" />

# StreamFlix

**Your Movies. Your Way.**

A modern movie and TV streaming platform for Android and iOS.

React Native · TypeScript · Dark Cinematic UI

[![Build](https://img.shields.io/badge/build-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](https://github.com/kora-messenger/StreamFlix/actions)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-6C63FF)]()
[![License](https://img.shields.io/badge/license-Proprietary-00D2FF)]()

</div>

---

## Overview

StreamFlix is a full-featured streaming app built with React Native. It delivers a premium, cinema-grade experience: a dark, immersive interface, a purple-to-blue brand gradient, and a neon play-button-and-film-strip logo. Discovery, search and playback are designed to feel instant and personal.

## Features

### Authentication
- Splash screen with poster-wall backdrop, animated wordmark and gradient spinner
- Welcome onboarding with cinematic hero art and feature highlights
- Create Account and Login with animated gradient-focused input fields
- Google and Apple sign-in options
- Remember me and forgot-password flows

### Discovery
- Home screen with auto-rotating hero banners
- Rotating search pill with trending title placeholders
- Category tabs: Football, Trending, Movie, Nollywood
- Horizontal title rows with one-tap download buttons

### Search
- Full search screen with recent and trending searches
- Movie / Series / Short TV / Music / Community tabs
- Ranked results list and community discovery

## Screens

| Screen | Purpose |
| --- | --- |
| Splash | Branding and load sequence |
| Welcome | Onboarding and sign-up entry point |
| Create Account | New user registration |
| Login | Returning user authentication |
| Home | Banners, categories and title rows |
| Search | Discovery, trending and community |

## Design system

| Token | Value |
| --- | --- |
| Background | `#050507` |
| Splash navy | `#0a1122` |
| Brand gradient | `#6C63FF` → `#00D2FF` |
| Accent wordmark | `#00D2FF` → `#B300FF` |
| Typography | System sans-serif, 800-weight display |

All icons are professional SVG. No emoji in the UI. Hero artwork fades into the background with custom gradients.

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
├── screens/      Splash, Welcome, CreateAccount, Login, Home, Search
└── theme/        Colors, gradients, radius tokens
```

## Getting started

```bash
npm install
npm run android   # or: npm run ios
```

Requires Node 22+ and JDK 21.

## Building the APK

Every push to `main` triggers a release build via GitHub Actions. Grab the `streamflix-release-apk` artifact from the [Actions tab](https://github.com/kora-messenger/StreamFlix/actions).

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

© 2026 StreamFlix. All rights reserved.
