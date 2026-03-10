# 📊 Expense Tracker - Complete Setup Guide

## Quick Start

Your Expense Tracker application is now fully set up with advanced visualization features!

### What's Installed:
✅ **Node.js Backend** - Express.js server  
✅ **SQLite Database** - Local data storage  
✅ **Python Visualization** - Pandas & Matplotlib charts  
✅ **Modern Frontend** - Responsive web interface  

## Running the Application

### Start the Server:
```bash
cd e:\expense_tracker
npm start
```

The server will run on `http://localhost:3000`

### Access the Web App:
Open your browser and go to: **http://localhost:3000**

## Features Overview

### 1. **Add & Manage Expenses** 📝
- Click "Add Expense" tab
- Fill in details (description, amount, category, date, payment method, notes)
- Expenses are automatically logged

### 2. **View & Search Expenses** 📋
- Click "View Expenses" tab
- Search by description
- Filter by category
- Edit or delete any expense

### 3. **Analytics & Visualizations** 📊
- Click "Analytics" tab to see beautiful charts:
  - **Pie Chart**: Expense distribution by category
  - **Monthly Analysis**: Total spending per month + category breakdown
  - **Trend Chart**: Category spending trends over time
  - **Statistics**: Detailed metrics (average, median, min, max, etc.)
- Click "Refresh Charts" to regenerate charts with updated data

### 4. **Transaction Logs** 📝
- Click "Transaction Logs" tab
- View complete history of all changes
- See who changed what and when

### 5. **Summary Dashboard** 📈
- Click "Summary" tab
- View total spending and category breakdown
- See spending patterns at a glance

## File Structure

```
expense_tracker/
├── server.js                    # Node.js/Express backend + API
├── visualize.py                 # Python visualization module (Pandas/Matplotlib)
├── package.json                 # Node.js dependencies
├── requirements.txt             # Python dependencies
├── expenses.db                  # SQLite database (created on first run)
├── test-data.js                 # Script to add sample data
├── public/
│   ├── index.html              # Main HTML page
│   ├── styles.css              # CSS styling
│   ├── script.js               # Frontend JavaScript
│   └── charts/                 # Generated chart images
│       ├── category_pie.png
│       ├── monthly_analysis.png
│       └── category_trend.png
└── README.md                    # Full documentation
```

## Python Dependencies

The application uses Python for advanced visualizations:
- **pandas** (2.3.0+) - Data analysis and manipulation
- **matplotlib** (3.4.0+) - Chart generation
- **numpy** (1.20.0+) - Numerical computing

These are already installed!

## API Endpoints

### Expenses Management
- `POST /api/expenses` - Add new expense
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get specific expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Visualizations
- `GET /api/visualizations/category-pie` - Get pie chart
- `GET /api/visualizations/monthly-analysis` - Get monthly chart
- `GET /api/visualizations/category-trend` - Get trend chart
- `GET /api/visualizations/stats` - Get detailed statistics
- `POST /api/visualizations/regenerate` - Regenerate all charts

### Other
- `GET /api/logs` - Get transaction logs
- `GET /api/summary` - Get summary statistics

## Testing the Application

### Add Sample Data:
```bash
node test-data.js
```
This will add test expenses to the database (only runs if database is empty).

### Generate Sample Charts:
1. Add some expenses through the UI
2. Go to the "Analytics" tab
3. Click "Refresh Charts" button
4. Charts will be generated in `public/charts/` directory

## Database Schema

### Expenses Table
```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  payment_method TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Expense Logs Table
```sql
CREATE TABLE expense_logs (
  id INTEGER PRIMARY KEY,
  expense_id INTEGER,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(expense_id) REFERENCES expenses(id)
);
```

## Troubleshooting

### Port 3000 already in use?
```bash
# Find process using port 3000 and kill it
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Python not found?
Make sure Python 3.7+ is installed and added to PATH:
```bash
python --version
pip --version
```

### Charts not generating?
1. Check if data exists in the database
2. Verify Python dependencies are installed: `pip install -r requirements.txt`
3. Check browser console for errors (F12)

### Database errors?
Delete `expenses.db` to recreate it:
```bash
Remove-Item expenses.db -Force
npm start
```

## Technologies Used

**Frontend:**
- HTML5, CSS3, Vanilla JavaScript
- Responsive design for mobile/tablet

**Backend:**
- Node.js + Express.js
- SQLite3 database

**Data Visualization:**
- Python 3.11
- Pandas - Data processing
- Matplotlib - Chart generation
- NumPy - Numerical operations

## Features Highlights

✨ **Real-time Updates** - Charts refresh automatically  
✨ **Complete Audit Trail** - All changes logged  
✨ **Multiple Visualizations** - Pie, bar, and line charts  
✨ **Advanced Statistics** - Mean, median, min, max, trends  
✨ **Responsive Design** - Works on all devices  
✨ **No Dependencies** - Frontend uses vanilla JavaScript  
✨ **Export Ready** - Charts can be saved/printed  

## Future Enhancements

- User authentication
- Budget limits and alerts
- Recurring expenses
- CSV/PDF export
- Cloud sync
- Mobile app
- Advanced filtering options
- Recurring expense templates

## Support & Documentation

For more details, see **README.md** in the project directory.

---

**Happy Expense Tracking! 💰**
