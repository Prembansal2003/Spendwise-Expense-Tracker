package com.spendwise.tracker.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
public class CurrencyService {

    private final Map<String, BigDecimal> rates = new HashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();

    public CurrencyService() {
        // Initialize default/fallback rates (1 USD = X units)
        rates.put("USD", new BigDecimal("1.0"));
        rates.put("EUR", new BigDecimal("0.92"));
        rates.put("GBP", new BigDecimal("0.79"));
        rates.put("INR", new BigDecimal("83.2"));
        rates.put("JPY", new BigDecimal("155.0"));
        rates.put("CAD", new BigDecimal("1.36"));
        rates.put("AUD", new BigDecimal("1.52"));

        // Try fetching live rates on startup
        try {
            fetchLiveRates();
        } catch (Exception e) {
            System.err.println("Could not fetch live FX rates in CurrencyService: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public void fetchLiveRates() {
        try {
            Map<String, Object> response = restTemplate.getForObject("https://open.er-api.com/v6/latest/USD", Map.class);
            if (response != null && response.containsKey("rates")) {
                Map<String, Object> responseRates = (Map<String, Object>) response.get("rates");
                for (String code : rates.keySet()) {
                    if (responseRates.containsKey(code)) {
                        Object val = responseRates.get(code);
                        rates.put(code, new BigDecimal(val.toString()));
                    }
                }
                System.out.println("Backend CurrencyService loaded live rates: " + rates);
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch live FX rates: " + e.getMessage());
        }
    }

    public BigDecimal convertCurrency(BigDecimal amount, String fromCurrency, String toCurrency) {
        if (amount == null) return BigDecimal.ZERO;
        String from = fromCurrency != null ? fromCurrency.toUpperCase() : "USD";
        String to = toCurrency != null ? toCurrency.toUpperCase() : "USD";

        if (from.equals(to)) return amount;

        BigDecimal fromRate = rates.getOrDefault(from, new BigDecimal("1.0"));
        BigDecimal toRate = rates.getOrDefault(to, new BigDecimal("1.0"));

        if (fromRate.compareTo(BigDecimal.ZERO) == 0) return amount;

        // amount * (toRate / fromRate)
        return amount.multiply(toRate)
                .divide(fromRate, 6, RoundingMode.HALF_UP);
    }
}
