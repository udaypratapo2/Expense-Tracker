# 💰 Expense Tracker Web Application

A modern, full-featured web application for tracking and managing your expenses with complete transaction logging and analytics.

## Features

### 📊 Core Functionality
- **Add Expenses**: Record expenses with description, amount, category, date, and payment method
- **View Expenses**: Browse all expenses with filtering and search capabilities
- **Edit Expenses**: Modify expense details anytime
- **Delete Expenses**: Remove expenses with confirmations
- **Transaction Logs**: Complete audit trail of all expense modifications
- **Summary & Analytics**: View spending statistics and category breakdown
- **Advanced Visualizations**: Pie charts, monthly analysis, and trend analysis powered by Pandas & Matplotlib
- **Bank Statement Upload**: Upload CSV bank statements for automatic transaction analysis and insights

### 🏦 Bank Statement Analysis
- **CSV Upload**: Support for standard bank statement CSV formats
- **Automatic Parsing**: Intelligent detection of date, description, amount, and balance columns
- **Transaction Insights**: Total credits, debits, net flow, and spending patterns
- **Category Classification**: Automatic categorization of transactions (Income, Food, Transportation, etc.)
- **Monthly Breakdown**: Analysis of spending and income trends over time
- **Recent Transactions**: View latest bank transactions with categorization

### 📄 Bank Statement CSV Format
The application supports flexible CSV formats. Common column names are automatically detected:
- **Date**: `date`, `transaction_date`, `date/time`
- **Description**: `description`, `details`, `narration`
- **Amount**: `amount`, `value` (positive for credits, negative for debits)
- **Balance**: `balance` (optional)

Example CSV format:
```csv
Date,Description,Amount,Balance
2024-01-01,Salary Deposit,50000.00,50000.00
2024-01-02,Grocery Store,-2500.00,47500.00
2024-01-03,ATM Withdrawal,-5000.00,42500.00
```

### 🎯 Categories
- Food & Dining
- Transportation
- Entertainment
- Shopping
- Utilities
- Healthcare
- Education
- Other

### 💳 Payment Methods
- Cash
- Credit Card
- Debit Card
- Bank Transfer
- Digital Wallet

## Technology Stack

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with flexbox and grid
- **JavaScript (Vanilla)**: No dependencies, fully functional

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **SQLite3**: Lightweight database

### Data Visualization
- **Pandas**: Data analysis and manipulation
- **Matplotlib**: Chart and visualization generation
- **NumPy**: Numerical computing

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)
- Python (v3.7 or higher)
- pip (Python Package Manager)

### Step 1: Install Node.js Dependencies
```bash
cd e:\expense_tracker
npm install
```

### Step 2: Install Python Dependencies
```bash
pip install -r requirements.txt
```

This installs:
- **pandas**: Data analysis and manipulation
- **matplotlib**: Data visualization and chart generation
- **numpy**: Numerical computing

### Step 3: Start the Server
```bash
npm start
```

The server will start on `http://localhost:3000`

### Step 4: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
expense_tracker/
├── server.js                 # Express server & API routes
├── package.json             # Node.js dependencies
├── expenses.db              # SQLite database (created on first run)
└── public/
    ├── index.html           # Main HTML file
    ├── styles.css           # Styling
    └── script.js            # Frontend JavaScript
```

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get single expense
- `GET /api/expenses/category/:category` - Get expenses by category
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Logs
- `GET /api/logs` - Get all transaction logs
- `GET /api/logs/:expense_id` - Get logs for specific expense

### Summary
- `GET /api/summary` - Get overall summary statistics
- `GET /api/summary/by-category` - Get summary by category

### Visualizations
- `POST /api/visualizations/generate` - Generate all charts
- `POST /api/visualizations/regenerate` - Regenerate all charts (clears cache)
- `GET /api/visualizations/category-pie` - Get category pie chart
- `GET /api/visualizations/monthly-analysis` - Get monthly analysis chart
- `GET /api/visualizations/category-trend` - Get category trend chart
- `GET /api/visualizations/stats` - Get detailed statistics

## Database Schema

### expenses table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### expense_logs table
```sql
CREATE TABLE expense_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_id INTEGER,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(expense_id) REFERENCES expenses(id)
);
```

## Usage Guide

### Adding an Expense
1. Click on "Add Expense" tab
2. Fill in the expense details:
   - Description (required)
   - Amount (required)
   - Category (required)
   - Date (required)
   - Payment Method (optional)
   - Notes (optional)
3. Click "Add Expense"

### Viewing Expenses
1. Click on "View Expenses" tab
2. Use the search bar to find expenses by description
3. Filter by category using the dropdown
4. Click "Edit" to modify or "Delete" to remove an expense

### Checking Transaction Logs
1. Click on "Transaction Logs" tab
2. View complete history of all modifications
3. See what changed, when it changed, and who changed it

### Viewing Summary
1. Click on "Summary" tab
2. See total expenses and average spending
3. View breakdown by category

### Analytics & Visualizations
1. Click on "Analytics" tab
2. View three main visualizations:
   - **Pie Chart**: Expense distribution by category
   - **Monthly Analysis**: Monthly totals and category breakdown
   - **Trend Chart**: Category spending trends over time
3. View detailed statistics:
   - Total expenses count
   - Total amount spent
   - Average and median expenses
   - Highest and lowest expenses
   - Top spending category
4. Click "Refresh Charts" button to regenerate visualizations with updated data

## Features in Detail

### Expense Management
- **Real-time search** across all expenses
- **Category filtering** for organized tracking
- **Edit mode** for updating expense details
- **Confirmation dialogs** for destructive actions

### Transaction Logs
- Automatic logging of all operations
- Tracks: CREATE, UPDATE, DELETE actions
- Records old and new values for changes
- Timestamped entries for audit trail

### Advanced Visualizations (Pandas & Matplotlib)
- **Pie Charts**: Shows expense distribution by category with percentages
- **Monthly Analysis**: Dual view showing:
  - Monthly total expense bars
  - Category breakdown within each month
- **Trend Analysis**: Line chart showing top 5 categories' spending trends over time
- **Detailed Statistics**: Comprehensive metrics including:
  - Total expense count
  - Total amount spent
  - Average and median values
  - Min/max expenses
  - Top spending category

## Notes

- The application uses SQLite for persistent storage
- All data is stored locally in `expenses.db`
- The database is automatically created on first run
- All transactions are logged for complete audit trail
- The interface is fully responsive for mobile devices

## Future Enhancements

Potential features for future versions:
- User authentication and multi-user support
- Budget limits and alerts
- Recurring expenses
- Export to CSV/PDF
- Charts and visualizations
- Monthly/yearly reports
- Attachment uploads
- Cloud synchronization
- Mobile app

## License

This project is open source and available under the MIT License.

---

**Created**: March 2026
**Version**: 1.0.0
