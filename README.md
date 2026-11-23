# music-player

A Subsonic-compatible music player. Works with any server that speaks the Subsonic API — Navidrome, Airsonic, Funkwhale, etc.

## Requirements

- Node 22+
- For iOS: Xcode + macOS
- For Android: Android Studio

## Running locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`, enter your Subsonic server URL and credentials on first launch.

If your server doesn't allow cross-origin requests from localhost, proxy it through the dev server and sign in with `http://localhost:5173` as the server URL:

```bash
DEV_SERVER_PROXY=https://your-navidrome npm run dev
```

## Building

### Web

```bash
npm run build
```

Output goes to `dist/`. Serve it with any static file host.

### Android

```bash
npm run build
npx cap sync android
npx cap open android
```

Build and run from Android Studio, or use `npx cap run android` to deploy directly to a connected device.

### iOS

```bash
git pull
npm ci
npm run build
npx cap sync ios
npx cap open ios
```

`cap sync` copies the web build into the app and writes `ios/App/App/capacitor.config.json` (it holds the keyboard settings), so run it after every pull, not just after adding plugins. In Xcode, pick your iPhone as the run destination, set your team under Signing & Capabilities for the App target, and press ⌘R. If Xcode complains about Swift packages, use File › Packages › Reset Package Caches. Requires a Mac and an Apple developer account for device deployment.

#### CarPlay

The CarPlay screen (Playlists, Recently Played, Recently Added) is built in, but Apple only shows apps in CarPlay that hold the CarPlay audio entitlement, which you have to request:

1. Request it at [developer.apple.com/contact/request/carplay](https://developer.apple.com/contact/request/carplay/) for the app's bundle ID (`com.lolcoded.cascade`) and wait for approval.
2. In the Apple Developer portal, add the CarPlay Audio capability to the App ID so new provisioning profiles include it.
3. In `ios/App/App.xcodeproj/project.pbxproj`, change both `"CODE_SIGN_ENTITLEMENTS[sdk=iphonesimulator*]" = App/App.entitlements;` lines to `CODE_SIGN_ENTITLEMENTS = App/App.entitlements;`. Until then, the entitlement is only applied to Simulator builds, because device signing fails if the profile lacks it.

To try it in the Simulator, run the app and open I/O › External Displays › CarPlay.

## Self-hosting with Docker

The web build can be served as a Docker container — same idea as running Navidrome, point a port at it and you're done.

### Build and run yourself

```bash
docker build -t music-player .
docker run -d -p 4533:80 --name music-player music-player
```

Then open `http://your-server:4533`.

### docker-compose

A `docker-compose.yml` is included. By default it pulls from the published image, but you can swap the `image:` line for `build: .` to build locally.

```bash
docker compose up -d
```

The app will be available on port `4533`. Change the port mapping in `docker-compose.yml` if that conflicts with something else.

### Playlist covers (Navidrome 0.61+)

Uploading a playlist cover uses Navidrome's own API (`/auth/*` and `/api/*`), not the Subsonic one. Serve the player and Navidrome from the same origin by routing `/rest/*`, `/auth/*` and `/api/*` to Navidrome in your reverse proxy. The player asks for your password once per session and stores only Navidrome's session token, never the password.

## Stack

- React 19, TypeScript, Tailwind CSS
- Vite
- Capacitor (iOS / Android)
- Subsonic API
