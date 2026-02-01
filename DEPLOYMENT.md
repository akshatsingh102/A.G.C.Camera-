# 🚀 Make Your AI Camera Live & Install on Device

## Part 1: Deploy (Make it Live)

Your app needs **HTTPS** for the camera to work. Here are the easiest options:

### Option A: Vercel (Recommended – Free & Easy)

1. **Push your code to GitHub**
   - Create a repo at [github.com/new](https://github.com/new)
   - Push your `Camera` folder

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click **Add New** → **Project**
   - Import your repo
   - Click **Deploy** (no config needed)

3. **Your live URL** will look like: `https://your-app.vercel.app`

---

### Option B: Netlify

1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import existing project**
3. Connect GitHub and select your repo
4. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.next`
5. For Next.js, use **Netlify’s Next.js runtime** or the default setup

---

### Option C: Run on Your Own PC (Local Network)

To use it on your phone while on the same Wi‑Fi:

1. **Find your PC's IP**
   - Windows: `ipconfig` → look for `IPv4 Address` (e.g. `192.168.1.5`)
   - Mac: `ifconfig` or System Preferences → Network

2. **Run the app so it's reachable**
   ```bash
   npm run build
   npm run start:lan
   ```
   Then on your phone, open: `http://YOUR_IP:3000` (e.g. `http://192.168.1.5:3000`)

   ⚠️ **Note:** Camera may not work over HTTP on some browsers. For full camera support, use a deployed HTTPS URL (Vercel/Netlify).

---

## Part 2: Install on Your Device (Download / Add to Home Screen)

Once your app is live with **HTTPS**:

### On iPhone / iPad (Safari)

1. Open your app URL in **Safari** (e.g. `https://your-app.vercel.app`)
2. Tap the **Share** button (box with arrow)
3. Scroll down and tap **Add to Home Screen**
4. Tap **Add**
5. The app icon appears on your home screen like a native app

### On Android (Chrome)

1. Open your app URL in **Chrome**
2. Tap the **menu** (⋮) or install banner if shown
3. Tap **Install** or **Add to Home Screen**
4. Confirm with **Install**
5. The app is installed and can be opened from the app drawer

### On Windows / Mac (Chrome or Edge)

1. Open your app URL in **Chrome** or **Edge**
2. Look for the **install icon** (⊕ or computer icon) in the address bar
3. Or use menu → **Install AI Camera** / **Install app**
4. The app opens in its own window like a desktop app

---

## Optional: Better Install Icons

For a nicer install experience, add PNG icons:

1. Create `public/icon-192.png` (192×192) and `public/icon-512.png` (512×512)
2. You can use [realfavicongenerator.net](https://realfavicongenerator.net) or any image editor
3. Update `public/manifest.json`:

```json
"icons": [
  { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
  { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
]
```

---

## Checklist

- [ ] Code pushed to GitHub
- [ ] Deployed on Vercel (or Netlify)
- [ ] App opens over HTTPS
- [ ] Camera works in the browser
- [ ] Added to Home Screen (phone) or installed (desktop)
