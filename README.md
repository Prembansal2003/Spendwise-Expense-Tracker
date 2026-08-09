# 💳 SpendWise – Java Full Stack Expense & Financial Analytics Dashboard

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.3-green.svg)](https://spring.io/projects/spring-boot)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon.tech-blue.svg)](https://neon.tech/)
[![PWA](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://web.dev/progressive-web-apps/)

**SpendWise** is a production-grade, human-engineered **Java Full Stack Financial Intelligence Application**. It combines a high-performance **Spring Boot 3 REST API backend** with a modern **React 18 single-page web UI** featuring glassmorphism aesthetics, an AI financial advisor widget, live real-time forex currency conversions, interactive Chart.js analytics, monthly & yearly category budget caps, automated cash balance deductions on savings deposits, multi-user account isolation, and cloud database synchronization with permanent lifetime PostgreSQL hosting.

---

## 📸 Visual Showcase & Application Screenshots

### 1. 📊 Main Financial Overview & Monthly/Yearly Analysis
Complete overview header featuring KPI metrics (Net Balance, Total Inflow, Total Outflow, Savings Rate %), Header Currency selector, AI Advisor trigger button, and Monthly & Yearly Financial Analysis.

![Main Financial Overview](docs/screenshots/01_overview_dashboard.png)

---

### 2. 🤖 SpendWise AI Financial Advisor Widget
Interactive AI Financial Advisor featuring an automated **Health Score Audit**, **50/30/20 Budget Check**, **Expenses & Outflow Analysis**, **Income Forecasts**, and **Tailored Savings Action Plans**.

![AI Financial Advisor Widget](docs/screenshots/02_ai_financial_advisor.png)

---

### 3. 🎯 Monthly Category Budgets & Live Forex Conversion
Real-time multi-currency category budget limits stored in original fed currency and converted dynamically across display currencies (`USD`, `EUR`, `GBP`, `INR`, `JPY`, `CAD`, `AUD`) with automated over-budget alerts.

![Monthly Category Budgets](docs/screenshots/03_monthly_category_budgets.png)

---

### 4. 💸 Income & Expense Transaction Workbench
Sleek modal for recording new income or expense transactions with merchant titles, custom amounts, transaction date selection, category tags, and payment method badges.

![New Transaction Modal](docs/screenshots/04_new_transaction_modal.png)

---

### 5. 🐷 Interactive Active Savings Goals & Automated Cash Deductions
Define personal savings milestones (Vacation, Laptop, Emergency Fund) with target progress bars, percentage tracking, and **automated cash balance deductions** when adding deposits.

![Active Savings Goals](docs/screenshots/05_active_savings_goals.png)

---

### 6. 📈 12-Month Cashflow Breakdown & Filtered Transaction Log
Interactive 12-month bar chart comparing Income vs Outflow, category expense share doughnut chart, and transaction history with **specific date picker filtering**.

![Cashflow Analytics & Transactions](docs/screenshots/06_cashflow_breakdown_and_transactions.png)

---

### 7. 📥 Custom Timeframe Data Export & PDF Statement Generator
Filter transaction records by custom start/end date ranges (`From Date` – `To Date`) or preset timeframes, then export to **Excel CSV**, **JSON Backup**, or print a formatted **PDF Statement**.

![Custom Timeframe Data Export](docs/screenshots/07_custom_timeframe_export.png)

---

## ✨ Key Features & Capabilities

### 1. 👥 Multi-User Account Isolation & Clean State Initializer
- **Demo Account (`Prem Agrawal`)**: Pre-populated with rich sample data for instant demonstration.
- **New User Accounts**: Starts with a **100% clean, fresh dashboard** with zero pre-existing sample transactions or balance artifacts.

### 2. 💱 Real-Time Live Forex Exchange Rates & Multi-Currency System
- Live currency API integration (`open.er-api.com`) fetching real-time exchange rates.
- Instant conversion between **USD ($)**, **EUR (€)**, **GBP (£)**, **INR (₹)**, **JPY (¥)**, **CAD (CA$)**, and **AUD (A$)**.
- **Fed-Currency Budget Storage**: Stores budget caps in whichever currency fed by the user and dynamically converts to any header display currency in real time.

### 3. 📊 Financial Intelligence Dashboard & Analytics
- **KPI Metrics**: Real-time Total Balance, Cash Inflow, Outflow, and Net Savings Rate %.
- **12-Month Breakdown & Yearly Analysis**: Multi-period bar charts comparing Income vs Outflow per month for any selected year (2020 through 2030 + All Years).
- **Interactive Visualizations**: Cash flow trend line charts & category spending doughnut breakdowns with percentage legends using **Chart.js**.

### 4. 🤖 AI Financial Advisor Widget
- Automated **Financial Health Score (0–100)** calculation based on live savings rate and budget compliance.
- Interactive category-based AI advisor with data-driven advice on 50/30/20 budgets, expense spikes, and investment goals.

### 5. 🎯 Monthly & Yearly Category Budgets
- Set monthly or annual spending caps per category (Food, Housing, Transport, Entertainment, Utilities, Health, Shopping, etc.).
- Real-time limit progress bars with automated alerts:
  - ⚠️ **Warning Alert**: Triggered at 80%+ category limit.
  - 🚨 **Exceeded Alert**: Triggered when spending passes 100% capacity.

### 6. 🐷 Dynamic Active Savings Goals
- Create personal target savings goals (Vacation, Emergency Fund, Laptop).
- **Automated Cash Deduction**: Depositing money into a savings goal automatically creates an outflow transaction, deducting the deposit from your available cash balance.

### 7. 🔍 Specific Date Filtering & Custom Timeframe Exports
- **Specific Date Filter**: Filter transaction history by exact calendar date (`YYYY-MM-DD`).
- **Custom Timeframe Export**: Filter transaction records by custom start/end date ranges and download **CSV**, **JSON**, or printable **PDF Statements**.

### 8. 📸 Profile Picture Upload & Lightbox Preview
- Upload photo from device, paste web URL, or choose preset avatars.
- **Fullscreen Lightbox**: Click profile photo anytime to preview in fullscreen backdrop-blur view.

### 9. 🔄 Continuous Real-Time Sync & Persistent Sessions
- **8-Second Background Polling**: Syncs data continuously across connected devices.
- **Persistent Sessions**: User remains signed in on refresh until explicitly clicking **Log Out**.

### 10. 🔒 Enhanced Privacy & Data Security
- **Global Console Suppression**: Complete suppression of developer console outputs (`console.log`, `console.error`) in the frontend to prevent sensitive API payloads or state data from leaking into the browser's inspect tool.
- **Strict Virtual Demo Isolation**: Demo profiles and their associated data are explicitly persisted to the PostgreSQL database for accuracy, but are strictly and permanently wiped from the database the moment the user clicks **Log Out**.
- **Hidden Metadata Tracking**: Background synchronization identifiers (like `[GoalID]`) are securely hidden from all UI components and CSV exports for a cleaner user experience.

### 11. 🚀 Additional Improvements
- **Expanded Analytics Range**: Interactive cashflow breakdown and analytics filtering now supports an extended year range from **1999 to 2050**.
- **Strict Savings Goal Caps**: Deposits into Active Savings Goals are strictly limited to prevent exceeding the goal's target amount.
- **Smart Cache Purging**: The frontend actively intercepts and purges legacy cached avatars (like stock Unsplash photos) from `localStorage`, seamlessly upgrading to the new default portrait picture.

### 12. ⏳ Automated Lifecycle Management & Uptime
- **Uptime Monitoring API (`/ping`)**: Includes a dedicated, ultra-lightweight `/api/v1/auth/ping` endpoint designed to be hooked into free uptime services (like cron-job.org) to prevent Render's free-tier containers from cold-starting.
- **Automated Ghost-Session Sweeper**: An automated background Cron Job (`@Scheduled`) sweeps the database every 60 minutes. It identifies any "Virtual Demo Accounts" (IDs >= 100M) that have been inactive for over 2 hours and permanently purges their orphaned transactions, budgets, and goals to maintain pristine database hygiene.
- **Dual-Mode Demo Architecture**: The system utilizes a dual-ghost architecture where `ID: 101` acts as the permanent global demo profile (for instant 0-millisecond dashboard loading), while 9-digit Virtual IDs act as private, disposable guest sessions that are swept automatically.

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
               │    - Multi-stage Dockerfile Packaging                  │
               └───────────────────────────┬────────────────────────────┘
                                           │ JDBC Persistence
                                           ▼
               ┌────────────────────────────────────────────────────────┐
               │    Database Tier (Neon.tech Permanent PostgreSQL)      │
               │    - Transactions, Budgets, Users Tables               │
               └───────────────────────────┬────────────────────────────┘
```

| Layer | Technology |
| :--- | :--- |
| **Backend Framework** | Java 17, Spring Boot 3.2.3, Spring Data JPA, Spring Web |
| **Packaging & Docker**| Multi-stage `Dockerfile` (`maven:3.9.6` & `eclipse-temurin:17-alpine`) |
| **Database** | H2 Database (Dev) / Neon.tech PostgreSQL (Production Permanent Cloud) |
| **Security** | SHA-256 / BCrypt Password Hashing (`PasswordEncoderUtil`) |
| **Frontend Framework**| React 18, Vite 5, JavaScript (ES6+) |
| **UI & Styling** | Custom Obsidian CSS Design System, Lucide Icons |
| **Data Viz** | Chart.js 4, `react-chartjs-2` |
| **Forex API** | Open Exchange Rates API (`open.er-api.com`) |
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

## ☁️ Permanent Free Cloud Deployment (Render + Neon.tech)

1. Push latest code to GitHub:
   ```bash
   git add .
   git commit -m "SpendWise Production Build"
   git push origin main
   ```

2. Create a 100% Permanent Free PostgreSQL Database on [**Neon.tech**](https://neon.tech/):
   - Project Name: `spendwise-db`
   - Copy JDBC Connection string details.

3. Deploy **Spring Boot Backend** Web Service on Render:
   - Root Directory: `backend`
   - Environment / Runtime: **Docker**
   - Environment Variables:
     - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`
     - `SPRING_DATASOURCE_USERNAME` = `neondb_owner`
     - `SPRING_DATASOURCE_PASSWORD` = `<your_password>`

4. Deploy **React Frontend** Static Site on Render:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL` = `https://spendwise-backend-api-rje3.onrender.com/api/v1`

---

## 📡 REST API Documentation

### Transactions API
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/transactions` | Fetch transactions (Supports `type`, `category`, `search`, `userId` query params) |
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
| `GET` | `/api/v1/budgets/progress` | Fetch monthly/yearly category budget limits & overflow warning status |
| `POST` | `/api/v1/budgets` | Set or update category budget cap with currency & period |
| `POST` | `/api/v1/auth/login` | Authenticate user credentials |
| `POST` | `/api/v1/auth/register` | Register a new user with encrypted password |
| `GET` | `/api/v1/auth/profile/{id}` | Fetch user profile and avatar URL |
| `PUT` | `/api/v1/auth/profile/{id}` | Update user profile and custom avatar URL |

---

## 👨‍💻 Developer & Contact

**SpendWise Expense Tracker** • Designed & Developed by **Prem Agrawal**  
📧 Contact Email: [bansalprem900@gmail.com](mailto:bansalprem900@gmail.com)

---

## 📝 License

Distributed under the MIT License. Feel free to fork, adapt, and use this project for learning or portfolio applications.
