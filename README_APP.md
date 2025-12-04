# OneNest — Personal Organizer

OneNest is a compact personal organizer built with Expo and React Native. It combines notes, todos, subscriptions, and expense tracking in a clean, minimal interface so you can stay organised without clutter.

## Short description

A compact personal organizer to manage notes, todos, subscriptions, and expenses — all in one tidy app.

## Long description

OneNest is a lightweight personal productivity app that helps you capture notes, manage todos, track recurring subscriptions, and log expenses quickly. The app focuses on speed and clarity: an overview dashboard surfaces your most important stats and reminders, quick actions let you add items fast, and dedicated editors keep entry simple. Built using Expo and `expo-router`, OneNest stores data locally and provides subtle visual design to keep your attention on what matters.

Key highlights:

- Overview dashboard with quick stats and reminders
- Quick actions for adding notes, todos, expenses, and currency conversions
- Editors for notes, todos, subscriptions, and expenses
- Local storage and lightweight notifications/reminders

## App screens & features

- **Home / Overview** (`app/(tabs)/index.tsx`): Dashboard showing quick stats for notes, todos, expenses, and subscriptions; quick action boxes; reminders for upcoming subscription renewals and note reminders.
- **Expenses** (`app/(tabs)/expenses.tsx`): View and manage expenses; shows totals and chart navigation.
- **Notes** (`app/(tabs)/notes.tsx`): Create, edit, and list notes; supports setting reminders.
- **Todos** (`app/(tabs)/todos.tsx`): Task list with count of active todos shown on the overview.
- **Subscriptions** (`app/(tabs)/subscriptions.tsx`): Manage recurring subscriptions with next-renewal dates and summaries.
- **Profile** (`app/(tabs)/profile.tsx`): Application preferences and basic profile settings.

### Editors & Utilities

- `app/note-editor.tsx`: Create or edit notes and add reminders.
- `app/todo-editor.tsx`: Add or edit todos and mark them completed.
- `app/expense-editor.tsx`: Log expenses with amounts and notes.
- `app/subscription-editor.tsx`: Add or edit subscriptions and set next renewal dates.
- `app/subscriptions-overview.tsx`: Focused subscription overview screen.
- `app/currency-exchange.tsx`: Simple currency converter utility.

## Project structure

- `app/` — File-based routes and screens (used by `expo-router`).
- `components/` — Reusable UI components (e.g. `OutlineBox`, themed views).
- `assets/images/` — App icon and splash assets (`splashscreen.png` used for startup).
- `lib/` — Utilities for storage and notifications.

## Getting started

1. Install dependencies

```bash
npm install
```

2. Start the app

```bash
npm run start
```

Open the Expo dev tools and run on a simulator or device.

## Notes & next steps

- The splash image is located at `assets/images/splashscreen.png` and configured in `app.json`.
- If you'd like, I can add App Store / Play Store-ready descriptions, short marketing blurbs, and suggested keywords. Would you like short/long store descriptions drafted now?

## Join the community

- Expo docs: https://docs.expo.dev
- Expo Discord: https://chat.expo.dev
