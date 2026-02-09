# Armada Den

A modern collaboration and communication platform built with Next.js. Armada Den combines channels, topics, direct messaging, AI chat, Gmail integration, and real-time features into a unified workspace.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Key Capabilities](#key-capabilities)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

---

## Features

### Core Communication

- **Channels & Topics** — Organize discussions in hierarchical channels with threaded topics
- **Direct Messages** — One-on-one messaging with attachments, reactions, and read receipts
- **Real-Time Chat Rooms** — Multi-user chat rooms with Socket.IO for instant messaging
- **AI Chat** — Conversational AI assistant with conversation history and markdown support

### Integrations

- **Gmail** — Read, compose, send, and manage emails directly within the app
- **Search** — Connect external search tools and query search history

### Collaboration

- **Agents** — Create and manage AI agents within channels
- **Mentions** — @mention users in topics and messages
- **File Attachments** — Upload and share files in topics and direct messages

### Notifications & Status

- **Push Notifications** — Web push notifications via Firebase Cloud Messaging (works when browser is closed)
- **Online Status** — Real-time user presence indicators across the app
- **Unread Badges** — Per-topic and aggregate unread message counts
- **Global Message Alerts** — Toast notifications for new messages in inactive topics

### Administration

- **User Approval Flow** — Admin approval required for new user access
- **Admin Panel** — Pending user management for superusers

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI** | React 19, Tailwind CSS 4 |
| **State** | Redux Toolkit, Redux Persist |
| **Real-Time** | Socket.IO Client |
| **AI** | Vercel AI SDK, OpenAI |
| **Auth** | JWT (FastAPI OAuth2) |
| **Push** | Firebase Cloud Messaging |
| **Icons** | Lucide React |
| **Forms/Validation** | Zod |
| **HTTP** | Axios |

---

## Prerequisites

- **Node.js** 20+ 
- **pnpm** 8+ (recommended) or npm
- **Backend API** — A running Armada Den backend (FastAPI) instance

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd armada-den-frontend
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required variables (see [Environment Variables](#environment-variables) below):

- `NEXT_PUBLIC_API_URL` — Backend API base URL
- `NEXT_PUBLIC_APP_URL` — Frontend app URL

### 4. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g. `http://localhost:8002/api`) | Yes |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (e.g. `http://localhost:3000`) | Yes |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase config for push notifications | For push |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | VAPID key from Firebase Cloud Messaging | For push |
| `OPENAI_API_KEY` | OpenAI API key for AI chat features | Optional |

See `.env.example` and `.env.production.example` for full reference.

---

## Project Structure

```
armada-den-frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home (auth routing)
│   └── gmail/callback/     # Gmail OAuth callback
├── components/
│   ├── admin/              # Admin approval UI
│   ├── auth/               # Login, approval screens
│   ├── channels/           # Channels, topics, DMs, agents
│   ├── chat/               # AI chat
│   ├── directMessages/     # DM-specific components
│   ├── gmail/              # Gmail integration UI
│   ├── layout/             # MainLayout, Sidebar
│   ├── providers/          # NotificationProvider, ServiceWorkerProvider
│   ├── realtimeChat/       # Real-time chat rooms
│   ├── search/             # Search UI
│   └── ui/                 # Shared UI (Toast, badges, dialogs)
├── lib/
│   ├── constants/          # API endpoints, constants
│   ├── features/           # Redux slices & thunks (by feature)
│   ├── firebase.ts         # Firebase initialization
│   ├── hooks/              # useNotifications, useOnlineStatus
│   ├── services/           # socketService, notificationService
│   ├── slices/             # auth, agents, directMessages
│   ├── store.ts            # Redux store
│   ├── types.ts            # TypeScript types
│   └── util/               # apiClient, permissions, etc.
├── public/
│   ├── firebase-messaging-sw.js  # Push notification service worker
│   └── sw.js                     # General service worker
└── docs/                   # Additional documentation
```

---

## Key Capabilities

### Authentication

- JWT-based login with email/password
- Admin approval flow for new users
- Redux-persisted auth state
- Protected routes with auth checks

### Channels & Topics

- Create channels and topics
- Topic-based messaging with threads
- Pin/unpin topics
- Member management (add/remove users)
- File uploads and attachments
- Reactions on messages

### Direct Messages

- List conversations with unread counts
- Send/receive messages with attachments
- Edit and delete messages
- Mark as read
- Reactions

### Real-Time

- Socket.IO for live updates
- User online/offline status
- New message alerts
- Unread count sync

### Push Notifications

- Web push via Firebase
- Subscribe/unsubscribe from settings
- Click-to-navigate to relevant topic
- Service worker handles notifications when app is closed

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |

---

## Deployment

### Vercel (recommended)

The project includes a `vercel.json` with:

- Build command: `npm run build`
- Install command: `pnpm install`
- Framework: Next.js

Configure environment variables in your Vercel project settings before deploying.

### Other platforms

1. Set required environment variables (see `.env.production.example`)
2. Run `pnpm build`
3. Serve the output with `pnpm start` or your platform’s Node.js runtime

---

## Documentation

| Document | Description |
|----------|-------------|
| [DM_API_REFERENCE.md](docs/DM_API_REFERENCE.md) | Direct Messaging API reference |
| [FIREBASE_SETUP_GUIDE.md](FIREBASE_SETUP_GUIDE.md) | Firebase / push notification setup |
| [docs/implementation/FRONTEND_IMPLEMENTATION_GUIDE.md](docs/implementation/FRONTEND_IMPLEMENTATION_GUIDE.md) | Alerts, online status, push implementation |
| [docs/NOTIFICATION_FEATURES.md](docs/NOTIFICATION_FEATURES.md) | Notification features overview |
| [docs/QUICK_START_NOTIFICATIONS.md](docs/QUICK_START_NOTIFICATIONS.md) | Quick start for notifications |

---

## License

Private — All rights reserved.
