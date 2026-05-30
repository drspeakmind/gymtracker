# Gym Tracker — Neil &amp; Simon

A single-file, phone-first workout tracker. Plan a session, log fast (one entry
for both of you, or split when you differ), and watch progress on a dashboard.
Works offline and syncs to a Google Sheet in the background.

## Files

- **`index.html`** — the whole app. Open it on your phone or host it (see below).
- **`Code.gs`** — the Google Apps Script that turns a Google Sheet into the database.

## Using it locally (no setup)

Just open `index.html` in a browser. Everything is stored on that device
(`localStorage`) and the 16 seed exercises are ready to go. Good for trying it,
but Neil and Simon won't see each other's data until you connect a Sheet.

## Connecting the Google Sheet (shared sync)

Do this once.

1. Create a new Google Sheet (any blank one). Name it e.g. *Gym Tracker Data*.
2. **Extensions ▸ Apps Script**. Delete the placeholder code.
3. Paste in everything from **`Code.gs`** and **Save** (disk icon).
4. **Deploy ▸ New deployment**. Click the gear ▸ **Web app**.
   - *Description*: anything.
   - *Execute as*: **Me**.
   - *Who has access*: **Anyone with the link**.
   - **Deploy**, then authorise when prompted (it's your own script).
5. Copy the **Web app URL** — it ends in `/exec`.
6. Open the app, tap **⚙ (top right) ▸ paste the URL ▸ Save**.

The app creates the `Exercises`, `Workouts`, and `Sets` tabs automatically on the
first sync. Give Simon the same `index.html` **and** the same `/exec` URL and you
share one dataset.

> If you ever change `Code.gs`, **Deploy ▸ Manage deployments ▸ edit ▸ New version**
> so the URL keeps working.

## Putting it on your phones (works in a no-signal gym)

This is an installable offline app (PWA). Host the folder once, install it, and it
works with **zero signal** thereafter.

1. Host the folder on a free static host — **Netlify Drop** (drag the folder onto
   app.netlify.com/drop) or **GitHub Pages**. You get an `https://…` URL.
2. On the iPhone, open that URL in **Safari** while you have signal/wifi, then
   **Share ▸ Add to Home Screen**. (Do this once on wifi so it can cache itself.)
3. After that first load, the whole app is cached on the phone — open it from the
   home-screen icon and it launches full-screen even with **no signal**. You log
   normally; sets save locally and push to the Sheet whenever signal returns.

Each phone needs the Apps Script URL set once (⚙ Settings). Simon does the same
three steps on his phone with the same URL.

> Must be served over `https://` (any host above does this) — service workers,
> which power the offline caching, don't run from a bare file opened off disk.
> If you ever update `index.html`, bump `CACHE` in `sw.js` (e.g. `gym-v2`) so
> phones pick up the new version next time they're online.

## How things work

- **Plan** — make a workout (date, *together* or *solo*), tick the exercises and
  go. Add brand-new exercises right from the picker.
- **Log** — for each exercise, **Add set**: pick Heavy 5 / Light 15, dial in
  weight + reps. *Same for both* writes Neil's and Simon's set in one tap;
  *Log separately* when you differ. Weight input adapts per exercise: plates step
  2.5 kg, machines have +1.1 / +2.3 kg micro-plate buttons, dumbbells/kettlebells
  are size pickers. Last-used weight pre-fills.
- **Progress** — pick an exercise. The top chart is **estimated 1RM** (Epley),
  which puts 5-rep and 15-rep sets on one comparable strength line for both of
  you; below is **volume** per session; then **personal-record** cards. Filter by
  scheme. Assisted pull-ups are flagged *inverted* (less assistance = stronger),
  so their chart and PRs read the right way round.
- **Exercises** — manage the library; archive what you don't use; toggle
  *inverted* for any assistance-based movement.

## Sync behaviour

Every change saves locally first (instant, works with no signal) and queues for
the Sheet. The dot top-left shows status: green = synced, amber = changes
pending, red = offline/error, grey = local-only. It retries automatically when
you're back online. Conflicts use last-write-wins by timestamp — fine for two
people who rarely edit the same set at the same second.

## Offline at the gym

One caveat worth knowing: iOS clears a website's stored data if you don't open it
for ~7 days. Because you'll use this regularly *and* it syncs to the Google Sheet,
that's not a real risk — but it's the reason connecting the Sheet matters: the
Sheet is the durable copy, the phone is the fast offline cache.

## The avatars

The Neil/Simon portrait (`avatars.png`) shows on the Log header and in the New
Workout dialog. Whoever isn't training is greyed out — both lit for a *Together*
session, one greyed for *Solo*. Left card = Neil, right card = Simon, split at the
midline. To change the picture, replace `avatars.png` (keep the two people roughly
left/right of centre so the split lands in the gap) and bump `CACHE` in `sw.js`.
`avatars-raw.png` is the original before the background was made transparent.

## Tweaking

Dumbbell, kettlebell, and micro-plate sizes are constants near the top of the
`<script>` in `index.html` (`DUMBBELLS`, `KETTLEBELLS`, `MACHINE_ADDONS`) — edit
to match your gym. Person names are in `PEOPLE`.
