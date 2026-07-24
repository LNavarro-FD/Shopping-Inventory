# Setting up push notifications

This adds real push notifications — you'll get notified even if the app/tab
is completely closed, whenever someone adds a new item to the main shopping
list or flags something in El Nook.

Three files are involved, and they all need to agree with each other:
- `index.html` — the app itself
- `firebase-messaging-sw.js` — must sit in the same folder as `index.html` on
  your host (not in a subfolder), so the browser can find it
- `functions/index.js` — the actual "send the push" logic, deployed separately

## 1. Turn on Cloud Messaging + get a VAPID key

1. Go to your Firebase project → ⚙️ **Project settings** → **Cloud Messaging** tab
2. Under **Web configuration**, click **Generate key pair**
3. Copy the long key it gives you

## 2. Paste your config in three places

- In `index.html`, find `const VAPID_KEY = "REPLACE_ME_VAPID_KEY";` and paste your key in
- In `firebase-messaging-sw.js`, paste the **same** `firebaseConfig` values you
  already used in `index.html` (apiKey, databaseURL, etc.)
- Double check `index.html`'s own `firebaseConfig` is filled in too, if you
  haven't done that yet

## 3. Move to the Blaze plan

Cloud Functions requires the **Blaze (pay-as-you-go)** plan to deploy at all —
Firebase Console → ⚙️ → **Usage and billing** → **Modify plan**. At this
volume (a household + one Airbnb) you'll stay well within the free monthly
allowance; you're just required to have a card on file.

## 4. Deploy the Cloud Function

You'll need [Node.js](https://nodejs.org) installed on your computer. Then,
in a terminal, inside the `shopping-list` folder (the one containing
`functions/`):

```
npm install -g firebase-tools
firebase login
firebase init functions
```

When `firebase init` asks questions:
- "Use an existing project" → pick the Firebase project you made for this
- Language → JavaScript
- It'll ask to overwrite `functions/index.js` and `functions/package.json` —
  say **No** (you already have the right versions)
- Install dependencies now? → Yes

Then deploy:

```
firebase deploy --only functions
```

This uploads `onCurrentListItemAdded` and `onRequestItemAdded` — the two
functions that watch for new items and send the push.

## 5. Turn notifications on in the app

Reload the app on your phone and tap the 🔔 in the header. Your browser will
ask for notification permission — allow it. The bell turns gold once it's
registered. Do this on each device you want notified (yours, and anyone
else's you want to alert).

## Notes

- Everyone who's tapped the bell gets notified on every new item — there's no
  per-person filtering (e.g. it doesn't skip notifying the person who just
  added the item themselves).
- If a device stops responding to pushes (uninstalled, permission revoked,
  etc.), the function automatically cleans up its stored token next time it
  tries to send.
- If you ever need to check what's registered, look under `deviceTokens` in
  your Realtime Database.
