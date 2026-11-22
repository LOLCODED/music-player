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
npm run build
npx cap sync ios
npx cap open ios
```

Build and run from Xcode. Requires a Mac and a valid Apple developer account for device deployment.

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
