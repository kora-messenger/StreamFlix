# StreamFlix

**Your Movies. Your Way.**

StreamFlix is a movie and TV streaming app built with React Native. It features a dark cinematic UI with a purple-to-blue brand gradient and a neon play-button-and-film-strip logo.

## Screens

| Screen | Description |
| --- | --- |
| Splash | Poster-wall background, logo, wordmark, tagline and gradient spinner |
| Welcome | Cinematic hero image, feature highlights and a Get Started button |
| Create Account | Full name, email and password fields, Google and Apple sign-in, hero art fading into the background |
| Login | Email and password, remember me, forgot password, Google and Apple sign-in |
| Home | Rotating search pill, category tabs (Football, Trending, Movie, Nollywood), auto-rotating hero banner, horizontal title rows with download buttons |
| Search | Recent searches, trending chips, Movie / Series / Short TV / Music / Community tabs with a ranked list |

## Design

- Background `#050507`, navy splash `#0a1122`
- Brand gradient `#6C63FF` to `#00D2FF`
- Professional SVG icons only, no emoji in the UI
- Hero images fade into the background with custom gradients

## Tech stack

- React Native 0.87, React 19, TypeScript
- React Navigation (native stack)
- react-native-svg, react-native-linear-gradient
- react-native-safe-area-context, react-native-screens

## Project structure

```
src/
  assets/       logo, hero images, poster art
  components/   shared UI (buttons, fields, icons)
  data/         mock titles, categories, search data
  navigation/   stack navigator
  screens/      Splash, Welcome, CreateAccount, Login, Home, Search
  theme/        colors and gradients
```

## Getting started

```bash
npm install
npm run android
```

## Build

Every push to `main` builds a release APK through GitHub Actions (`.github/workflows/android.yml`). Download it from the **Actions** tab of the repo, under the `streamflix-release-apk` artifact.

## Status

- Auth screens, home and search are built with mock data.
- Not yet built: title details, video player, downloads, profile, backend and real authentication.
