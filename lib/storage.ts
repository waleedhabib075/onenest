import AsyncStorage from "@react-native-async-storage/async-storage";

export type StoredNote = {
  id: string;
  title: string;
  preview: string;
  content?: string;
  imageUri?: string | null;
  reminderTimestamp?: number | null;
  notificationId?: string | null;
};

export type StoredSubscription = {
  id: string;
  name: string;
  price: string;
  cycle: "Monthly" | "Yearly";
  nextRenewal: string;
  nextRenewalTimestamp?: number | null;
  notificationId?: string | null;
};

export type StoredExpense = {
  id: string;
  label: string;
  amount: number;
  category: string;
  notificationId?: string | null;
};

export type StoredTodo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "Low" | "Medium" | "High";
  category: string;
  dueDate?: string | null;
  dueDateTimestamp?: number | null;
  notificationId?: string | null;
  createdAt: number;
};

export type StoredPreferences = {
  notificationsEnabled: boolean;
  subscriptionAlerts: boolean;
  budgetAlerts: boolean;
  monthlyBudget?: number; // in same currency as expenses
  currency?: string;
  baseCurrency?: string; // for exchange rates
};

export type CurrencyInfo = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
];

const KEYS = {
  notes: "@onenest/notes",
  subscriptions: "@onenest/subscriptions",
  expenses: "@onenest/expenses",
  preferences: "@onenest/preferences",
  todos: "@onenest/todos",
  exchangeRates: "@onenest/exchangeRates",
} as const;

async function loadJSON<T>(key: string): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (e) {
    console.warn(`Failed to load storage key ${key}`, e);
    return null;
  }
}

async function saveJSON<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to save storage key ${key}`, e);
  }
}

export const NotesStorage = {
  load: () => loadJSON<StoredNote[]>(KEYS.notes),
  save: (notes: StoredNote[]) => saveJSON(KEYS.notes, notes),
};

export const SubscriptionsStorage = {
  load: () => loadJSON<StoredSubscription[]>(KEYS.subscriptions),
  save: (subs: StoredSubscription[]) => saveJSON(KEYS.subscriptions, subs),
};

export const ExpensesStorage = {
  load: () => loadJSON<StoredExpense[]>(KEYS.expenses),
  save: (expenses: StoredExpense[]) => saveJSON(KEYS.expenses, expenses),
};

export const PreferencesStorage = {
  load: () => loadJSON<StoredPreferences>(KEYS.preferences),
  save: (prefs: StoredPreferences) => saveJSON(KEYS.preferences, prefs),
};

export const TodosStorage = {
  load: () => loadJSON<StoredTodo[]>(KEYS.todos),
  save: (todos: StoredTodo[]) => saveJSON(KEYS.todos, todos),
};

export const ExchangeRatesStorage = {
  load: () => loadJSON<Record<string, number>>(KEYS.exchangeRates),
  save: (rates: Record<string, number>) => saveJSON(KEYS.exchangeRates, rates),
};

export const defaultPreferences: StoredPreferences = {
  notificationsEnabled: true,
  subscriptionAlerts: true,
  budgetAlerts: true,
  monthlyBudget: 1000,
  currency: "$",
  baseCurrency: "USD",
};


