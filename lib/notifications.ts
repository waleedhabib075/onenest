import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";

import { StoredNote, StoredSubscription } from "./storage";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowList: true,
    shouldShowBanner: true,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "General",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

export async function ensureNotificationPermissions() {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    const request = await Notifications.requestPermissionsAsync();
    if (!request.granted) {
      throw new Error("Notification permissions not granted");
    }
  }
  await ensureAndroidChannel();
}

export async function cancelNotification(notificationId?: string | null) {
  if (notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch {
      // ignore failures
    }
  }
}

export async function scheduleSubscriptionReminder(
  subscription: StoredSubscription
): Promise<string | null> {
  if (!subscription.nextRenewalTimestamp) {
    return null;
  }
  try {
    await ensureNotificationPermissions();
  } catch {
    return null;
  }

  const triggerDate = new Date(subscription.nextRenewalTimestamp);
  triggerDate.setDate(triggerDate.getDate() - 1);

  if (triggerDate.getTime() <= Date.now()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `${subscription.name} renews soon`,
      body: `Your ${subscription.cycle.toLowerCase()} plan renews on ${new Date(
        subscription.nextRenewalTimestamp
      ).toDateString()}.`,
      sound: false,
    },
    trigger: triggerDate as unknown as Notifications.NotificationTriggerInput,
  });
}

export async function scheduleNoteReminder(
  note: StoredNote
): Promise<string | null> {
  if (!note.reminderTimestamp) {
    return null;
  }
  try {
    await ensureNotificationPermissions();
  } catch {
    return null;
  }

  if (note.reminderTimestamp <= Date.now()) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: note.title,
      body: note.preview,
    },
    trigger:
      (new Date(note.reminderTimestamp) as unknown as Notifications.NotificationTriggerInput),
  });
}

export async function scheduleExpenseLoggedNotification(
  label: string,
  amount: number
) {
  try {
    await ensureNotificationPermissions();
  } catch {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Expense added",
      body: `${label} - $${amount.toFixed(2)}`,
    },
    trigger: null,
  });
}

export async function scheduleBudgetAlertNotification(total: number) {
  try {
    await ensureNotificationPermissions();
  } catch {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Budget alert",
      body: `You've spent $${total.toFixed(0)} this month.`,
    },
    trigger: null,
  });
}

