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

## Stack

- React 19, TypeScript, Tailwind CSS
- Vite
- Capacitor (iOS / Android)
- Subsonic API
