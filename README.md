# 💳 SpendWise – Java Full Stack Expense & Financial Analytics Dashboard

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-green.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supported-blue.svg)](https://www.postgresql.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)

SpendWise is a production-grade, human-engineered **Java Full Stack Financial Intelligence Application**. It combines a high-performance **Spring Boot 3 REST API backend** with a **React 18 single-page web UI** featuring Linear/Stripe aesthetics, interactive Chart.js analytics, AI-powered financial advisor recommendations, category budget limit alerts, and cloud database persistence.

---

## 📸 Key Features & Capabilities

### 1. 📊 Financial Intelligence Dashboard
- **KPI Metrics**: Real-time Total Balance, Cash Inflow, Outflow, and Net Savings Rate %.
- **Interactive Visualizations**: Cash flow trend line charts & category spending doughnut breakdowns with percentage legends using **Chart.js**.
- **Multi-Currency Converter**: Instant currency switching (USD `$`, EUR `€`, GBP `£`, INR `₹`, JPY `¥`, CAD `CA$`, AUD `A$`).

### 2. 💸 Transaction Workbench
- Multi-category search, filter by transaction type (Income/Expense), date range filtering, and amount/date sorting.
- Add, edit, duplicate, and delete income or expense items with category icons and payment method badges.

### 3. 🎯 Budget & Savings Tracker
- Set monthly budget caps per category (Food, Housing, Transport, Entertainment, Utilities, Health, Shopping, etc.).
- Real-time limit progress bars with automated alerts:
  - ⚠️ **Warning Alert**: Triggered at 80%+ category limit.
  - 🚨 **Exceeded Alert**: Triggered when spending passes 100% capacity.
- Active savings goals tracker (Emergency Fund, Vacation, Work Laptop).

### 4. 🤖 AI Financial Advisor Widget
- Calculates an automated **Financial Health Score (0–100)** based on savings rate and budget compliance.
- Interactive AI chat widget providing personalized saving tips and spending anomaly analysis.

### 5. 🔔 Notification Center & Profile Security
- Header notification bell with badge counters for over-budget alerts and savings milestones.
- User authentication & profile settings with **BCrypt password encryption**.

### 6. 📱 Progressive Web App (PWA) & Data Export
- Web App Manifest & Service Worker allowing one-click installation on mobile and desktop home screens.
- **CSV Data Export** compatible with Excel & Google Sheets, plus JSON database backup.

---

## 🏗️ Architecture & Technology Stack

```
               ┌────────────────────────────────────────────────────────┐
               │    React 18 + Vite Web Frontend (Port 5173 / 5174)    │
               │    - Linear/Stripe Obsidian Design System (CSS)        │
               │    - Chart.js, Lucide Icons, AI Advisor, PWA Manifest  │
               └───────────────────────────┬────────────────────────────┘
                                           │ REST API (JSON)
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │    Java 17 Spring Boot 3 Backend API (Port 8080)       │
               │    - Controllers: Transaction, Analytics, Budget, Auth │
               │    - Services: TransactionService, BudgetService, Auth  │
               │    - JPA Repositories & PasswordEncoderUtil            │
               └───────────────────────────┬────────────────────────────┘
                                           │ JDBC Persistence
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │    Database Tier (H2 Local / PostgreSQL Cloud)         │
               │    - Transactions, Budgets, Users Tables               │
               └────────────────────────────────────────────────────────┘
```

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Java 17, Spring Boot 3.2.3, Spring Data JPA, Spring Web |
| **Database** | H2 Database (Dev) / PostgreSQL (Production Cloud) |
| **Security** | SHA-256 / BCrypt Password Hashing (`PasswordEncoderUtil`) |
| **Frontend Framework**| React 18, Vite 5, JavaScript (ES6+) |
| **UI & Styling** | Custom Obsidian CSS Design System, Lucide Icons |
| **Data Viz** | Chart.js 4, `react-chartjs-2` |
| **PWA** | Web App Manifest (`manifest.json`), Service Worker (`sw.js`) |

---

## ⚡ Getting Started (Local Setup)

### Prerequisites
- **Java 17 or higher** installed
- **Node.js 18 or higher** & `npm` installed
- Maven (or embedded Maven Wrapper)

---

### Step 1: Run the Backend (Java Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Once started:
- 🌐 REST API Endpoint: `http://localhost:8080/api/v1/transactions`
- 🗄️ Embedded H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:spendwisedb`, User: `sa`, Password: *blank*)

---

### Step 2: Run the Frontend (React + Vite)

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:5173/`**

---

## 📡 REST API Documentation

### Transactions API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/transactions` | Fetch transactions (Supports `type`, `category`, `search` query params) |
| `POST` | `/api/v1/transactions` | Create a new income or expense transaction |
| `PUT` | `/api/v1/transactions/{id}` | Update existing transaction record |
| `DELETE` | `/api/v1/transactions/{id}` | Delete transaction record |

### Analytics API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/summary` | Get Net Balance, Total Inflow, Total Outflow, & Savings Rate % |
| `GET` | `/api/v1/analytics/category-breakdown` | Get spending breakdown per category with percentages |

### Budgets & Auth API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/budgets/progress` | Fetch monthly category budget limits & overflow warning status |
| `POST` | `/api/v1/budgets` | Set or update monthly category budget cap |
| `POST` | `/api/v1/auth/login` | Authenticate user credentials |
| `POST` | `/api/v1/auth/register` | Register a new user with encrypted password |

---

## ☁️ Cloud Deployment (Render.com)

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "SpendWise Ready for Cloud Deployment"
   git push origin main
   ```
2. Provision a **PostgreSQL Database** on Render.com.
3. Deploy **Java Backend** as a Render Web Service (`mvn clean package -DskipTests`, set `SPRING_DATASOURCE_URL` env vars).
4. Deploy **React Frontend** as a Render Static Site (`npm run build`, publish dir `dist`).

---

## 📝 License

Distributed under the MIT License. Feel free to fork, adapt, and use this project for learning or portfolio applications.
