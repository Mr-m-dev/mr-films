# مستر افلام 🎬

  Netflix-inspired Arabic movie & TV app built with Expo React Native.

  ## Features
  - 🏠 Home screen with hero banner and content rows
  - 🔍 Browse & Search with genre filtering
  - ❤️ Favorites with AsyncStorage persistence
  - 🎬 Movie, TV Show, and Actor detail pages
  - 📋 Genre pages with infinite scroll
  - 🌐 Arabic UI with TMDB API integration
  - 📴 Offline detection screen
  - ⚡ Spring animations & ripple effects on card press

  ## Build APK via GitHub Actions

  To enable automatic APK builds, create the GitHub Actions workflow:

  ### Step 1: Get your Expo token
  1. Create an account at [expo.dev](https://expo.dev)
  2. Go to **Account Settings > Access Tokens**
  3. Create a new token

  ### Step 2: Add secret to GitHub
  1. Go to your repo **Settings > Secrets and variables > Actions**
  2. Add secret: Name = `EXPO_TOKEN`, Value = your token

  ### Step 3: Create the workflow file
  Create file `.github/workflows/build-apk.yml` with the content from `workflow-templates/build-apk.yml` in this repo.

  Then push to main branch — the APK will build automatically!

  ## Local Development

  ```bash
  npm install
  npx expo start
  ```

  ## Tech Stack
  - Expo React Native
  - TMDB API
  - AsyncStorage (favorites)
  - Expo Router (navigation)
  - EAS Build (APK generation)
  