# Voyage MMXXVI

A self-contained travel itinerary that installs to your iPhone home screen and works offline.

---

## What's in this folder

```
voyage-pwa/
├── index.html         The itinerary itself (everything's in here)
├── manifest.json      Tells the phone "this is an app, not a webpage"
├── sw.js              Service worker — handles offline caching
├── icons/
│   ├── icon.svg               Master vector (in case you ever need to redo the rasters)
│   ├── icon-1024.png          Largest, for App Store / future use
│   ├── icon-512.png           Android adaptive
│   ├── icon-192.png           Standard PWA
│   ├── icon-maskable-512.png  Android maskable
│   ├── apple-touch-icon.png   iOS home screen (180px)
│   └── favicon-32.png         Browser tab
└── README.md          This file
```

---

## Deploying to GitHub Pages

### One-time setup

1. **Create a new GitHub repo.** Name it whatever you want (e.g. `voyage`). Public is fine; Pages requires a paid plan for private repos.

2. **Upload these files to the repo root.** Either:
   - Web UI: open the repo, click *Add file → Upload files*, drag everything from this folder in (including the `icons/` subfolder), commit.
   - Or via git: `git clone`, copy files in, `git add . && git commit -m "initial" && git push`.

3. **Enable Pages.** Repo *Settings → Pages → Build and deployment*. Under *Source*, pick *Deploy from a branch*. Pick branch `main` and folder `/ (root)`. Save.

4. **Wait ~30 seconds.** GitHub builds the site. Refresh the Pages settings tab — you'll see a green check and a URL like `https://YOURUSERNAME.github.io/voyage/`.

5. **Visit the URL on your iPhone.** Use Safari (not Chrome — Chrome on iOS won't install PWAs to the home screen).

6. **Add to home screen.** Tap the Share button (square with up-arrow) → scroll down → *Add to Home Screen* → confirm name "Voyage" → *Add*.

That's it. The icon now sits on your home screen. Tap it: launches full-screen, no Safari UI, works offline after first visit.

### Sharing with a travel partner

Just send them the GitHub Pages URL. They open it in Safari and follow steps 5–6.

---

## Updating the itinerary

You'll want to make changes (new dinner reservation, time shift, etc.). Here's the workflow:

### Step 1: Edit `index.html`

The simplest path: open `index.html` in the GitHub web UI, click the pencil icon, edit, commit. The whole itinerary lives in the `PHASES` array near the top of the `<script type="text/babel">` block — it reads naturally as data.

### Step 2 (IMPORTANT): Bump the cache version

Open `sw.js`. Find this line near the top:

```js
const CACHE_VERSION = 'voyage-v1';
```

Change it to `'voyage-v2'`, then `'voyage-v3'` for the next update, etc. Commit.

**Why this matters:** the service worker aggressively caches files so the app loads instantly and works offline. Without bumping the version, your phone keeps showing the OLD itinerary even after you've pushed changes. Bumping the version forces a refresh on next launch.

### Step 3: Wait ~30 seconds for GitHub Pages to rebuild

You can check the build status under the *Actions* tab of your repo.

### Step 4: Open the app on your phone (while online)

The new version takes effect on the *second* launch after the update — first launch detects the new service worker, second launch uses it. If you want it immediately, force-quit and relaunch.

---

## Caveats worth knowing

- **iOS evicts PWA cache after ~7 days of non-use.** If you install this in mid-May and don't open it for two weeks, iOS may clear the offline cache. Practical fix: open the app at least once a week before the trip.

- **First launch needs internet.** The PWA caches everything on first load (about 1.4 MB), then runs offline forever after. Make sure the first launch happens on WiFi.

- **Photos are embedded as base64 in `index.html`.** That's why the file is large but also why it has zero external image dependencies — nothing can break.

- **Google Fonts and the React/Babel CDN are external.** The service worker tries to cache them on first load so they work offline, but if your first launch fails to fetch them, fonts will fall back to system serif. Not the end of the world.

- **Adding a custom domain** (e.g. `voyage.yourname.com`) is supported by GitHub Pages — *Settings → Pages → Custom domain*. You'd need to own the domain and add a CNAME record at your registrar. Optional, costs ~$10/year for a domain.

---

## What you can't do (intentionally)

- No notifications. iOS PWAs only support these on iOS 16.4+ and require additional setup; not worth the complexity for an itinerary.
- No native calendar/maps integration beyond what regular `<a href="tel:">` and `<a href="https://maps.apple.com/?q=...">` links provide.
- No App Store distribution. This requires a $99/year Apple Developer account and a wrapping framework like Capacitor — overkill for personal use.

If you ever want any of these, the current PWA is a solid foundation to build on top of.
