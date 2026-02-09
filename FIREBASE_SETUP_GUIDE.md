# Firebase Cloud Messaging Setup Guide

## Current Issue
You're seeing the error: `Failed to execute 'subscribe' on 'PushManager': The provided applicationServerKey is not valid`

This means your Firebase environment variables are not properly configured.

## Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **h-armada-den**
3. Click the gear icon ⚙️ > **Project settings**
4. Scroll down to **Your apps** section
5. If you don't have a web app, click **Add app** > Web icon (`</>`)
6. Copy the `firebaseConfig` object

## Step 2: Get VAPID Key (Most Important!)

1. In Firebase Console, go to **Project settings**
2. Click the **Cloud Messaging** tab
3. Scroll to **Web configuration**
4. Under **Web Push certificates**, you'll see a **Key pair**
5. If no key exists, click **Generate key pair**
6. Copy this key - it's your VAPID key

## Step 3: Update .env.local

Open your `.env.local` file and add these variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[REDACTED]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=h-armada-den
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=h-armada-den.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id_here

# VAPID Key (from Cloud Messaging > Web Push certificates)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here
```

## Step 4: Update Service Worker

The service worker is generated from `public/firebase-messaging-sw.template.js` at install/build time. Set these environment variables in `.env.local` and run `pnpm install` or `pnpm build`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=[REDACTED]
NEXT_PUBLIC_FIREBASE_PROJECT_ID=h-armada-den
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=h-armada-den.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Never commit Firebase keys to the repo.** The generated `public/firebase-messaging-sw.js` is gitignored.

## Step 5: Restart Development Server

After updating the environment variables:

```bash
# Stop the current dev server (Ctrl+C)
# Then restart it
npx next dev
```

## Verification

Once configured correctly, you should see:
- No VAPID_KEY warning in the console
- Notification permission prompt when clicking "Enable Notifications"
- Successful subscription to FCM

## Troubleshooting

### Still seeing "applicationServerKey is not valid"?
- Double-check the VAPID key is copied correctly (no extra spaces)
- Ensure the key starts with `B` (it's a base64-encoded key)
- Restart the dev server after changing `.env.local`

### Can't find VAPID key in Firebase Console?
- Make sure you're in the **Cloud Messaging** tab
- Look for **Web Push certificates** section
- Click **Generate key pair** if none exists

### Environment variables not loading?
- Ensure the file is named `.env.local` (not `.env.local.txt`)
- All variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- Restart the dev server after any changes
