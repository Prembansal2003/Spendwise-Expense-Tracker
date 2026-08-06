package com.spendwise.tracker.model;

public enum Category {
    FOOD("Food & Dining", "🍽️"),
    HOUSING("Housing & Rent", "🏠"),
    TRANSPORT("Transportation", "🚗"),
    ENTERTAINMENT("Entertainment", "🎬"),
    UTILITIES("Utilities & Bills", "⚡"),
    HEALTH("Health & Medical", "🏥"),
    SHOPPING("Shopping", "🛍️"),
    SALARY("Salary & Income", "💼"),
    FREELANCE("Freelance & Side Gigs", "💻"),
    INVESTMENT("Investments", "📈"),
    OTHER("Other Expenses", "📦");

    private final String displayName;
    private final String icon;

    Category(String displayName, String icon) {
        this.displayName = displayName;
        this.icon = icon;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getIcon() {
        return icon;
    }
}
