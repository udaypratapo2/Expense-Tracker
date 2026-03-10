# 🎯 Expense Tracker - Complete Architecture

## Application Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     EXPENSE TRACKER 💰                           │
│                     Full-Stack Web App                           │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   FRONTEND (Web)     │         │  BACKEND (Node.js)   │
│─────────────────────┤         │─────────────────────┤
│ • HTML5             │◄────────►│ • Express.js        │
│ • CSS3 (Modern)     │  HTTP    │ • REST API          │
│ • Vanilla JS        │  JSON    │ • Event Handlers    │
│ • Responsive UI     │          │ • Python Integration│
│                     │          │                     │
│ Tabs:               │          │ Routes:             │
│ • Add Expense       │          │ • /api/expenses     │
│ • View Expenses     │          │ • /api/logs         │
│ • Analytics         │          │ • /api/summary      │
│ • Logs              │          │ • /api/visualize*   │
│ • Summary           │          │                     │
└──────────────────────┘         └──────────────────────┘
         │                                │
         │                                │
         │                    ┌───────────▼──────────────┐
         │                    │  PYTHON VISUALIZATION  │
         │                    │─────────────────────────┤
         │                    │ • Pandas (Data)         │
         │                    │ • Matplotlib (Charts)   │
         │                    │ • NumPy (Math)          │
         │                    │                         │
         │                    │ Generates:              │
         │                    │ • Pie Charts            │
         │                    │ • Monthly Analysis      │
         │                    │ • Trend Charts          │
         │                    │ • Statistics            │
         │                    └─────────────┬───────────┘
         │                                  │
         │                                  │
         └──────────────┬────────┬──────────┘
                        │        │
                        ▼        ▼
              ┌─────────────────────────┐
              │   SQLite Database       │
              │─────────────────────────┤
              │ Tables:                 │
              │ • expenses              │
              │ • expense_logs          │
              │ • (auto-created)        │
              │                         │
              │ Data Types:             │
              │ • Descriptions          │
              │ • Amounts               │
              │ • Categories            │
              │ • Dates                 │
              │ • Audit Logs            │
              └─────────────────────────┘

              ┌─────────────────────────┐
              │  Generated Assets       │
              │─────────────────────────┤
              │ public/charts/          │
              │ • category_pie.png      │
              │ • monthly_analysis.png  │
              │ • category_trend.png    │
              └─────────────────────────┘
```

## Request Flow

```
User Action (Click button)
        │
        ▼
JavaScript Event Handler
        │
        ▼
Fetch API Call
        │
        ▼
Express Route Handler
        │
    ┌───┴──────────────────────┐
    │                           │
    ▼                           ▼
(Data only)            (Charts needed)
    │                           │
    │                    Spawn Python
    │                    Process
    │                           │
    │                    read expenses.db
    │                           │
    │                    Pandas Processing
    │                           │
    │                    Matplotlib Chart
    │                           │
    │                    Save as PNG
    │                           │
    └───────────┬───────────────┘
                │
                ▼
        Send Response
                │
                ▼
        Display in UI
                │
                ▼
        User sees results
```

## Component Breakdown

### Frontend Components

```
┌─────────────────────────────────────────┐
│         HTML Structure (index.html)      │
├─────────────────────────────────────────┤
│ • Header (Title)                        │
│ • Navigation Tabs                       │
│ • Add Expense Form                      │
│ • View Expenses List                    │
│ • Analytics Section                     │
│   ├─ Pie Chart Display                  │
│   ├─ Monthly Analysis Display           │
│   ├─ Trend Chart Display                │
│   └─ Statistics Panel                   │
│ • Transaction Logs                      │
│ • Summary Dashboard                     │
│ • Edit Modal                            │
└─────────────────────────────────────────┘
```

### Styling System

```
┌──────────────────────────────────┐
│      CSS (styles.css)            │
├──────────────────────────────────┤
│ • Color Variables (--primary, etc)
│ • Flexbox Layouts                │
│ • Grid Layouts                   │
│ • Responsive Breakpoints         │
│ • Animations & Transitions       │
│ • Dark/Light Elements            │
│ • Form Styling                   │
│ • Chart Container Styling        │
│ • Modal Styling                  │
│ • Media Queries (Mobile/Tablet)  │
└──────────────────────────────────┘
```

### JavaScript Logic

```
┌────────────────────────────────────┐
│  JavaScript (script.js)            │
├────────────────────────────────────┤
│ Tab Navigation                     │
│ ├─ switchTab()                     │
│ └─ Tab event listeners             │
│                                    │
│ Expense Management                 │
│ ├─ addExpense()                    │
│ ├─ loadExpenses()                  │
│ ├─ displayExpenses()               │
│ ├─ updateExpense()                 │
│ ├─ deleteExpense()                 │
│ └─ Search/Filter logic             │
│                                    │
│ Analytics                          │
│ ├─ generateVisualizations()        │
│ ├─ loadAnalytics()                 │
│ ├─ loadCategoryPieChart()          │
│ ├─ loadMonthlyAnalysisChart()      │
│ ├─ loadCategoryTrendChart()        │
│ └─ loadDetailedStats()             │
│                                    │
│ Logs Management                    │
│ ├─ loadLogs()                      │
│ └─ displayLogs()                   │
│                                    │
│ Summary                            │
│ ├─ loadSummary()                   │
│ └─ displaySummary()                │
│                                    │
│ Utilities                          │
│ ├─ Formatting functions            │
│ ├─ HTML escaping                   │
│ ├─ Notifications                   │
│ └─ Modal handling                  │
└────────────────────────────────────┘
```

### Backend API Structure

```
┌──────────────────────────────────────┐
│      Express.js Server               │
│      (server.js)                     │
├──────────────────────────────────────┤
│                                      │
│ Middleware                           │
│ ├─ CORS                              │
│ ├─ Body Parser                       │
│ └─ Static Files                      │
│                                      │
│ Database Initialization              │
│ ├─ SQLite Connection                 │
│ └─ Schema Creation                   │
│                                      │
│ Routes                               │
│ ├─ GET/POST /api/expenses            │
│ ├─ PUT/DELETE /api/expenses/:id      │
│ ├─ GET /api/logs                     │
│ ├─ GET /api/summary                  │
│ └─ Visualization Routes              │
│    ├─ POST /regenerate               │
│    ├─ GET /category-pie              │
│    ├─ GET /monthly-analysis          │
│    ├─ GET /category-trend            │
│    └─ GET /stats                     │
│                                      │
│ Error Handling                       │
│ └─ Global error middleware           │
└──────────────────────────────────────┘
```

### Python Visualization Module

```
┌─────────────────────────────────────────┐
│     visualize.py (Python)               │
├─────────────────────────────────────────┤
│                                         │
│ Data Loading                            │
│ └─ get_expenses_dataframe()             │
│    ├─ Read SQLite                       │
│    └─ Convert to Pandas DF              │
│                                         │
│ Chart Generation                        │
│ ├─ generate_category_pie_chart()        │
│ │  ├─ Group by category                 │
│ │  └─ Create pie chart                  │
│ │                                       │
│ ├─ generate_monthly_analysis()          │
│ │  ├─ Extract year-month                │
│ │  └─ Create dual-chart view            │
│ │                                       │
│ ├─ generate_category_trend()            │
│ │  ├─ Get top 5 categories              │
│ │  └─ Create line chart                 │
│ │                                       │
│ └─ generate_*() functions               │
│    ├─ Use Matplotlib                    │
│    ├─ Add styling                       │
│    └─ Save as PNG                       │
│                                         │
│ Statistics                              │
│ └─ get_summary_stats()                  │
│    ├─ Calculate metrics                 │
│    └─ Return JSON                       │
│                                         │
│ Dependencies                            │
│ ├─ sqlite3                              │
│ ├─ pandas                               │
│ ├─ matplotlib                           │
│ ├─ numpy                                │
│ └─ os, json, datetime                   │
└─────────────────────────────────────────┘
```

### Database Schema

```
┌──────────────────────────────────────┐
│   SQLite Database (expenses.db)      │
├──────────────────────────────────────┤
│                                      │
│ expenses TABLE                       │
│ ├─ id (Primary Key)                  │
│ ├─ description (Text)                │
│ ├─ amount (Real)                     │
│ ├─ category (Text)                   │
│ ├─ date (Text/Date)                  │
│ ├─ payment_method (Text)             │
│ ├─ notes (Text)                      │
│ └─ created_at (DateTime)             │
│                                      │
│ expense_logs TABLE                   │
│ ├─ id (Primary Key)                  │
│ ├─ expense_id (Foreign Key)          │
│ ├─ action (Text)                     │
│ ├─ old_value (Text/JSON)             │
│ ├─ new_value (Text/JSON)             │
│ └─ timestamp (DateTime)              │
│                                      │
│ Indexes                              │
│ ├─ On date for sorting               │
│ ├─ On category for filtering         │
│ └─ On expense_id for logs            │
└──────────────────────────────────────┘
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                         │
│  Browser - HTML, CSS, JavaScript                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/JSON
                            │
┌─────────────────────────────────────────────────────────────┐
│  APPLICATION LAYER                                          │
│  Node.js + Express.js                                       │
│  REST API - Routing, Controllers, Middleware                │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
                    │ Python Process (Child)
                    │ Visualization Engine
                    │ Pandas + Matplotlib
                    │
                    │
┌─────────────────────────────────────────────────────────────┐
│  DATA LAYER                                                 │
│  SQLite Database - ACID Compliance, Transactions            │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Computer / Server
│
├─ Node.js Runtime
│  └─ Express Server
│     ├─ API Routes
│     ├─ Static Files
│     ├─ Error Handling
│     └─ Process Management
│
├─ Python Runtime
│  └─ Visualization Engine
│     ├─ Chart Generation
│     ├─ Data Processing
│     └─ Statistics
│
├─ SQLite Database
│  ├─ Data Storage
│  ├─ Audit Logs
│  └─ Indexes
│
└─ File System
   ├─ public/ (Assets)
   ├─ charts/ (Generated images)
   └─ expenses.db (Database file)
```

---

**Architecture shows a complete, production-ready expense tracking system with advanced visualization capabilities.** 🚀
