# Setup guide — getting Gym Tracker onto your phones

Two halves: **(A)** connect the Google Sheet (the shared database) and **(B)**
put the app online with GitHub Pages. Do A once, B once, then each phone is a
30-second "Add to Home Screen".

---

## A. Google Sheet + Apps Script (the database)

You only do this on **one** Google account (yours). Simon doesn't need to — he
just uses the same web-app URL.

1. Open your Google Sheet.
2. **Extensions ▸ Apps Script**. A code editor opens in a new tab.
3. Delete whatever's in `Code.gs` there, then paste in the **entire** contents
   of this project's [`Code.gs`](Code.gs). Click the **Save** (💾) icon.
4. Click **Deploy ▸ New deployment**.
5. Click the gear ⚙ next to "Select type" ▸ choose **Web app**.
6. Fill in:
   - **Description**: anything (e.g. "gym").
   - **Execute as**: **Me**.
   - **Who has access**: **Anyone with the link**.
7. Click **Deploy**. Google asks you to **authorise** — it's your own script, so
   approve it (you may see an "unverified app" screen → *Advanced ▸ Go to … (unsafe)*;
   that's normal for personal scripts).
8. Copy the **Web app URL** (ends in `/exec`). Keep it safe — this is the link
   the app uses to read/write your data.

> The script creates the `Exercises`, `Workouts`, `Sets` tabs by itself on first use.
>
> If you ever edit `Code.gs`: **Deploy ▸ Manage deployments ▸ ✏️ edit ▸ Version:
> New version ▸ Deploy**, so the same URL keeps working.

You'll paste that `/exec` URL into the app's **⚙ Settings** once it's running
(step B6 below). Keep it private — anyone with it could read/write your data.

---

## B. Put the app online with GitHub Pages

This makes a tidy `https://…` link that works on iPhones (and lets the app cache
itself for offline use at the gym). The easy route needs **no command line**.

### Easy route — upload in the browser

1. Sign in / sign up at **github.com**.
2. Top-right **+ ▸ New repository**.
   - **Repository name**: `gym-tracker` (or anything).
   - **Public** (see the privacy note below) and leave the rest as default.
   - **Create repository**.
3. On the new repo page, click **"uploading an existing file"**
   (or **Add file ▸ Upload files**).
4. From the `gym` folder, drag in these files:
   `index.html`, `sw.js`, `manifest.json`, `chart.umd.min.js`,
   `icon-192.png`, `icon-512.png`, `avatars.png`, `Code.gs`, `README.md`.
   *(Skip the `.claude` folder and `avatars-raw.png` — not needed.)*
5. Click **Commit changes**.
6. **Settings** (top tab) ▸ **Pages** (left menu) ▸ under "Build and deployment":
   - **Source**: *Deploy from a branch*.
   - **Branch**: `main`, folder **`/ (root)`** ▸ **Save**.
7. Wait ~1 minute, refresh the Pages settings page. It shows:
   **"Your site is live at https://<your-username>.github.io/gym-tracker/"**.
   That's your app link.

### On each phone (Neil and Simon)

1. Open the `…github.io/gym-tracker/` link in **Safari** (on wifi the first time).
2. Tap **⚙ (top-right)** ▸ paste the **`/exec`** URL from part A ▸ **Save**.
3. Tap the **Share** button ▸ **Add to Home Screen**.

Now it's an app icon, opens full-screen, works offline, and both of you share the
same data through the Sheet.

### Updating later

If the app changes, re-upload the changed files (GitHub: open the file ▸ ✏️ ▸
replace, or drag-upload again) **and** make sure `CACHE` in `sw.js` is bumped
(e.g. `gym-v5`) so phones fetch the new version. Reopen the home-screen app while
online once to let it update.

---

## Privacy note

A public GitHub Pages site means **anyone with the link** can open the app and see
your cartoon avatars. They **cannot** see your workout data or your Sheet — that
lives in your private Google Sheet, and the Sheet URL is only stored on your phones
(it's never in the code). If you'd rather the avatars weren't public, tell me and
we can swap them for a generic icon, or host somewhere password-protected instead.

---

## Optional — the git command-line route (nicer for updates)

The repo is already initialised and committed locally. If you'd prefer pushing
over uploading:

1. Create an **empty** repo on GitHub (don't add a README).
2. In the `gym` folder run:
   ```
   git remote add origin https://github.com/<your-username>/gym-tracker.git
   git push -u origin main
   ```
   The first push opens a browser to log in to GitHub (Git Credential Manager).
3. Enable Pages as in B6. After that, future updates are just `git push` and the
   site refreshes automatically.
