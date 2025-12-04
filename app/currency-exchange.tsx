import { CURRENCIES, ExchangeRatesStorage } from "@/lib/storage";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CurrencyExchangeScreen() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  const loadRates = async () => {
    const saved = await ExchangeRatesStorage.load();
    if (saved && Object.keys(saved).length > 0) {
      setExchangeRates(saved);
      setLastUpdated(new Date());
    } else {
      // Set default rates (these would normally come from an API)
      const defaultRates = {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        INR: 83.12,
        JPY: 149.5,
        CNY: 7.24,
        AUD: 1.52,
        CAD: 1.36,
        CHF: 0.88,
        AED: 3.67,
        SAR: 3.75,
        PKR: 278.5,
      };
      setExchangeRates(defaultRates);
      await ExchangeRatesStorage.save(defaultRates);
      setLastUpdated(new Date());
    }
  };

  const refreshRates = async () => {
    setLoading(true);
    // Simulate API call - in production, you'd call a real exchange rate API
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock updated rates with slight variations
    const updatedRates = { ...exchangeRates };
    Object.keys(updatedRates).forEach((key) => {
      if (key !== "USD") {
        const variation = 0.98 + Math.random() * 0.04; // ±2% variation
        updatedRates[key] = updatedRates[key] * variation;
      }
    });

    setExchangeRates(updatedRates);
    await ExchangeRatesStorage.save(updatedRates);
    setLastUpdated(new Date());
    setLoading(false);
  };

  const convertAmount = () => {
    const numAmount = parseFloat(amount) || 0;
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    const result = (numAmount / fromRate) * toRate;
    return result.toFixed(2);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const getSymbol = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.symbol || code;
  };

  const getName = (code: string) => {
    return CURRENCIES.find((c) => c.code === code)?.name || code;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Currency Exchange</Text>
          <Pressable onPress={refreshRates} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : (
              <Ionicons name="refresh" size={24} color="#4F46E5" />
            )}
          </Pressable>
        </View>

        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Text>
        )}

        <View style={styles.converterCard}>
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>From</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#94A3B8"
              />
              <View style={styles.currencySelector}>
                <Text style={styles.currencyCode}>{fromCurrency}</Text>
                <Text style={styles.currencySymbol}>{getSymbol(fromCurrency)}</Text>
              </View>
            </View>
            <Text style={styles.currencyName}>{getName(fromCurrency)}</Text>
          </View>

          <Pressable style={styles.swapButton} onPress={swapCurrencies}>
            <Ionicons name="swap-vertical" size={24} color="#4F46E5" />
          </Pressable>

          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>To</Text>
            <View style={styles.resultRow}>
              <Text style={styles.resultAmount}>{convertAmount()}</Text>
              <View style={styles.currencySelector}>
                <Text style={styles.currencyCode}>{toCurrency}</Text>
                <Text style={styles.currencySymbol}>{getSymbol(toCurrency)}</Text>
              </View>
            </View>
            <Text style={styles.currencyName}>{getName(toCurrency)}</Text>
          </View>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.cardTitle}>Select From Currency</Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr.code}
                style={[
                  styles.currencyChip,
                  fromCurrency === curr.code && styles.currencyChipActive,
                ]}
                onPress={() => setFromCurrency(curr.code)}
              >
                <Text style={styles.currencyChipSymbol}>{curr.symbol}</Text>
                <Text
                  style={[
                    styles.currencyChipCode,
                    fromCurrency === curr.code && styles.currencyChipCodeActive,
                  ]}
                >
                  {curr.code}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.selectorCard}>
          <Text style={styles.cardTitle}>Select To Currency</Text>
          <View style={styles.currencyGrid}>
            {CURRENCIES.map((curr) => (
              <Pressable
                key={curr.code}
                style={[
                  styles.currencyChip,
                  toCurrency === curr.code && styles.currencyChipActive,
                ]}
                onPress={() => setToCurrency(curr.code)}
              >
                <Text style={styles.currencyChipSymbol}>{curr.symbol}</Text>
                <Text
                  style={[
                    styles.currencyChipCode,
                    toCurrency === curr.code && styles.currencyChipCodeActive,
                  ]}
                >
                  {curr.code}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.ratesCard}>
          <Text style={styles.cardTitle}>Exchange Rates (Base: USD)</Text>
          {Object.entries(exchangeRates)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([code, rate]) => (
              <View key={code} style={styles.rateRow}>
                <View style={styles.rateLeft}>
                  <Text style={styles.rateSymbol}>{getSymbol(code)}</Text>
                  <Text style={styles.rateCode}>{code}</Text>
                </View>
                <Text style={styles.rateValue}>{rate.toFixed(4)}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F7F9FC",
  },
  container: {
    padding: 20,
    gap: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
  },
  lastUpdated: {
    fontSize: 13,
    color: "#64748B",
    marginTop: -8,
  },
  converterCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    gap: 16,
  },
  currencySection: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F172A",
    padding: 0,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resultAmount: {
    flex: 1,
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
  },
  currencySelector: {
    alignItems: "flex-end",
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },
  currencySymbol: {
    fontSize: 24,
    color: "#64748B",
  },
  currencyName: {
    fontSize: 13,
    color: "#94A3B8",
  },
  swapButton: {
    alignSelf: "center",
    backgroundColor: "#EEF2FF",
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  selectorCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
  },
  currencyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minWidth: 70,
    alignItems: "center",
  },
  currencyChipActive: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  currencyChipSymbol: {
    fontSize: 20,
    marginBottom: 2,
  },
  currencyChipCode: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  currencyChipCodeActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },
  ratesCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  rateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  rateLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rateSymbol: {
    fontSize: 18,
    width: 30,
  },
  rateCode: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },
  rateValue: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
});
