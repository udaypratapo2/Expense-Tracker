const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const csv = require('csv-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Initialize SQLite Database
const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.serialize(() => {
    // Expenses table
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        payment_method TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Expense log table
    db.run(`
      CREATE TABLE IF NOT EXISTS expense_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_id INTEGER,
        action TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(expense_id) REFERENCES expenses(id)
      )
    `);

    // Bank transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS bank_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        description TEXT NOT NULL,
        amount REAL NOT NULL,
        type TEXT NOT NULL, -- 'credit' or 'debit'
        balance REAL,
        category TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Budget targets table
    db.run(`
      CREATE TABLE IF NOT EXISTS budget_targets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        target_amount REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(year, month)
      )
    `);

    console.log('Database schema initialized');
  });
}

// ============= API ENDPOINTS =============

// GET - Retrieve all expenses
app.get('/api/expenses', (req, res) => {
  db.all('SELECT * FROM expenses ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// GET - Retrieve expenses by category
app.get('/api/expenses/category/:category', (req, res) => {
  const category = req.params.category;
  db.all(
    'SELECT * FROM expenses WHERE category = ? ORDER BY date DESC',
    [category],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// GET - Retrieve single expense
app.get('/api/expenses/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }
    res.json(row);
  });
});

// POST - Create new expense
app.post('/api/expenses', (req, res) => {
  const { description, amount, category, date, payment_method, notes } = req.body;

  if (!description || !amount || !category || !date) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  db.run(
    'INSERT INTO expenses (description, amount, category, date, payment_method, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [description, amount, category, date, payment_method || '', notes || ''],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Log the creation
      const expenseId = this.lastID;
      db.run(
        'INSERT INTO expense_logs (expense_id, action, new_value) VALUES (?, ?, ?)',
        [expenseId, 'CREATED', JSON.stringify(req.body)],
        (logErr) => {
          if (logErr) console.error('Error logging expense creation:', logErr);
          res.status(201).json({ id: expenseId, ...req.body });
        }
      );
    }
  );
});

// PUT - Update expense
app.put('/api/expenses/:id', (req, res) => {
  const id = req.params.id;
  const { description, amount, category, date, payment_method, notes } = req.body;

  // Get old values
  db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, oldData) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!oldData) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Update expense
    db.run(
      'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ?, payment_method = ?, notes = ? WHERE id = ?',
      [description, amount, category, date, payment_method || '', notes || '', id],
      function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }

        // Log the update
        const changes = {
          description: description !== oldData.description ? { old: oldData.description, new: description } : null,
          amount: amount !== oldData.amount ? { old: oldData.amount, new: amount } : null,
          category: category !== oldData.category ? { old: oldData.category, new: category } : null,
          date: date !== oldData.date ? { old: oldData.date, new: date } : null,
        };

        Object.entries(changes).forEach(([field, change]) => {
          if (change) {
            db.run(
              'INSERT INTO expense_logs (expense_id, action, old_value, new_value) VALUES (?, ?, ?, ?)',
              [id, `UPDATED_${field.toUpperCase()}`, JSON.stringify(change.old), JSON.stringify(change.new)],
              (logErr) => {
                if (logErr) console.error('Error logging update:', logErr);
              }
            );
          }
        });

        res.json({ id, ...req.body });
      }
    );
  });
});

// DELETE - Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const id = req.params.id;

  // Get expense details before deletion
  db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Expense not found' });
      return;
    }

    // Delete expense
    db.run('DELETE FROM expenses WHERE id = ?', [id], function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Log the deletion
      db.run(
        'INSERT INTO expense_logs (expense_id, action, old_value) VALUES (?, ?, ?)',
        [id, 'DELETED', JSON.stringify(row)],
        (logErr) => {
          if (logErr) console.error('Error logging deletion:', logErr);
          res.json({ message: 'Expense deleted successfully' });
        }
      );
    });
  });
});

// GET - Retrieve expense logs
app.get('/api/logs', (req, res) => {
  db.all(
    'SELECT el.*, e.description FROM expense_logs el LEFT JOIN expenses e ON el.expense_id = e.id ORDER BY el.timestamp DESC',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// GET - Retrieve logs for specific expense
app.get('/api/logs/:expense_id', (req, res) => {
  const expenseId = req.params.expense_id;
  db.all(
    'SELECT * FROM expense_logs WHERE expense_id = ? ORDER BY timestamp DESC',
    [expenseId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// GET - Get summary statistics
app.get('/api/summary', (req, res) => {
  db.get(
    'SELECT COUNT(*) as total_expenses, SUM(amount) as total_amount FROM expenses',
    [],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row);
    }
  );
});

// GET - Get expenses by category summary
app.get('/api/summary/by-category', (req, res) => {
  db.all(
    'SELECT category, COUNT(*) as count, SUM(amount) as total FROM expenses GROUP BY category',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// ============= BUDGET MANAGEMENT ENDPOINTS =============

// GET - Get budget target for a specific month
app.get('/api/budget/:year/:month', (req, res) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);

  db.get(
    'SELECT * FROM budget_targets WHERE year = ? AND month = ?',
    [year, month],
    (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(row || null);
    }
  );
});

// POST - Set or update budget target for a month
app.post('/api/budget', (req, res) => {
  const { year, month, target_amount } = req.body;

  if (!year || !month || target_amount === undefined) {
    res.status(400).json({ error: 'Missing required fields: year, month, target_amount' });
    return;
  }

  const targetAmount = parseFloat(target_amount);
  if (isNaN(targetAmount) || targetAmount < 0) {
    res.status(400).json({ error: 'Invalid target amount' });
    return;
  }

  // Check if budget target already exists
  db.get(
    'SELECT id FROM budget_targets WHERE year = ? AND month = ?',
    [year, month],
    (err, existing) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      if (existing) {
        // Update existing
        db.run(
          'UPDATE budget_targets SET target_amount = ?, updated_at = CURRENT_TIMESTAMP WHERE year = ? AND month = ?',
          [targetAmount, year, month],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: existing.id, year, month, target_amount: targetAmount, updated: true });
          }
        );
      } else {
        // Insert new
        db.run(
          'INSERT INTO budget_targets (year, month, target_amount) VALUES (?, ?, ?)',
          [year, month, targetAmount],
          function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
              return;
            }
            res.json({ id: this.lastID, year, month, target_amount: targetAmount, created: true });
          }
        );
      }
    }
  );
});

// GET - Get current month's budget and spending comparison
app.get('/api/budget/current-month', (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // JavaScript months are 0-based

  // Get budget target
  db.get(
    'SELECT * FROM budget_targets WHERE year = ? AND month = ?',
    [year, month],
    (err, budget) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Get total spending for current month
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = month === 12 ? `${year + 1}-01-01` : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

      db.get(
        'SELECT SUM(amount) as total_spent FROM expenses WHERE date >= ? AND date < ?',
        [startDate, endDate],
        (err, spending) => {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }

          const totalSpent = spending.total_spent || 0;
          const targetAmount = budget ? budget.target_amount : 0;
          const remaining = targetAmount - totalSpent;
          const percentage = targetAmount > 0 ? (totalSpent / targetAmount) * 100 : 0;

          res.json({
            year,
            month,
            target_amount: targetAmount,
            total_spent: totalSpent,
            remaining: remaining,
            percentage_used: Math.round(percentage * 100) / 100,
            is_over_budget: remaining < 0
          });
        }
      );
    }
  );
});

// ============= BANK STATEMENT ENDPOINTS =============

// POST - Upload and parse bank statement CSV
app.post('/api/bank-statement/upload', upload.single('statement'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const transactions = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Assuming CSV has columns: date, description, amount, balance (optional)
      // Normalize column names (case insensitive)
      const normalizedRow = {};
      Object.keys(row).forEach(key => {
        normalizedRow[key.toLowerCase()] = row[key];
      });

      const date = normalizedRow.date || normalizedRow.transaction_date || normalizedRow['date/time'];
      const description = normalizedRow.description || normalizedRow.details || normalizedRow.narration;
      let amount = parseFloat(normalizedRow.amount || normalizedRow.value || '0');
      const balance = parseFloat(normalizedRow.balance || '0');

      if (date && description && !isNaN(amount)) {
        // Determine type based on amount sign
        const type = amount >= 0 ? 'credit' : 'debit';
        amount = Math.abs(amount); // Store positive amount

        transactions.push({
          date,
          description,
          amount,
          type,
          balance: isNaN(balance) ? null : balance
        });
      }
    })
    .on('end', () => {
      console.log(`CSV parsing complete. Found ${transactions.length} transactions`);
      
      if (transactions.length === 0) {
        // Clean up uploaded file
        fs.unlinkSync(filePath);
        return res.json({
          success: true,
          message: 'No valid transactions found in CSV',
          totalParsed: 0,
          inserted: 0
        });
      }

      // Insert transactions into database
      let inserted = 0;
      let completed = 0;

      console.log('Starting database insertions...');
      transactions.forEach(tx => {
        db.run(
          `INSERT INTO bank_transactions (date, description, amount, type, balance) VALUES (?, ?, ?, ?, ?)`,
          [tx.date, tx.description, tx.amount, tx.type, tx.balance],
          function(err) {
            completed++;
            console.log(`Completed ${completed}/${transactions.length}, err:`, err ? err.message : 'none');
            if (!err) {
              inserted++;
            }
            
            // When all insertions are complete
            if (completed === transactions.length) {
              // Clean up uploaded file
              fs.unlinkSync(filePath);

              console.log(`Final result: inserted=${inserted}, total=${transactions.length}`);
              res.json({
                success: true,
                message: `Successfully processed ${inserted} transactions`,
                totalParsed: transactions.length,
                inserted,
                debug: `inserted=${inserted}, completed=${completed}`
              });
            }
          }
        );
      });
    })
    .on('error', (error) => {
      // Clean up uploaded file
      fs.unlinkSync(filePath);
      res.status(500).json({ error: 'Failed to parse CSV', details: error.message });
    });
});

// GET - Get bank statement insights
app.get('/api/bank-statement/insights', (req, res) => {
  db.all('SELECT * FROM bank_transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (rows.length === 0) {
      return res.json({
        totalTransactions: 0,
        totalCredits: 0,
        totalDebits: 0,
        netFlow: 0,
        insights: []
      });
    }

    let totalCredits = 0;
    let totalDebits = 0;
    const categoryCounts = {};
    const monthlyData = {};

    rows.forEach(tx => {
      if (tx.type === 'credit') {
        totalCredits += tx.amount;
      } else {
        totalDebits += tx.amount;
      }

      // Simple categorization based on description keywords
      const desc = tx.description.toLowerCase();
      let category = 'Other';
      if (desc.includes('salary') || desc.includes('deposit') || desc.includes('transfer in')) {
        category = 'Income';
      } else if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant')) {
        category = 'Food';
      } else if (desc.includes('gas') || desc.includes('fuel') || desc.includes('transport')) {
        category = 'Transportation';
      } else if (desc.includes('shopping') || desc.includes('amazon') || desc.includes('store')) {
        category = 'Shopping';
      } else if (desc.includes('utility') || desc.includes('electric') || desc.includes('water')) {
        category = 'Utilities';
      } else if (desc.includes('atm') || desc.includes('withdrawal')) {
        category = 'Cash Withdrawal';
      }

      tx.category = category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      // Monthly aggregation
      const month = tx.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { credits: 0, debits: 0 };
      }
      if (tx.type === 'credit') {
        monthlyData[month].credits += tx.amount;
      } else {
        monthlyData[month].debits += tx.amount;
      }
    });

    const insights = [
      `Total transactions: ${rows.length}`,
      `Total credits: ₹${totalCredits.toFixed(2)}`,
      `Total debits: ₹${totalDebits.toFixed(2)}`,
      `Net flow: ₹${(totalCredits - totalDebits).toFixed(2)}`,
      `Most common category: ${Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b)}`
    ];

    res.json({
      totalTransactions: rows.length,
      totalCredits,
      totalDebits,
      netFlow: totalCredits - totalDebits,
      categoryBreakdown: categoryCounts,
      monthlyBreakdown: monthlyData,
      insights,
      recentTransactions: rows.slice(0, 10)
    });
  });
});

// GET - Get all bank transactions
app.get('/api/bank-transactions', (req, res) => {
  db.all('SELECT * FROM bank_transactions ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// ============= VISUALIZATION ENDPOINTS =============

// Helper function to run Python script
function runPythonVisualization(scriptFunction) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', ['visualize.py']);
    let output = '';
    let error = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(error);
      }
    });
  });
}

// Generate all visualizations
app.post('/api/visualizations/generate', (req, res) => {
  const pythonScript = `
import sys
sys.path.insert(0, '.')
from visualize import generate_category_pie_chart, generate_monthly_analysis, generate_category_trend

try:
    result1 = generate_category_pie_chart()
    result2 = generate_monthly_analysis()
    result3 = generate_category_trend()
    print('success')
except Exception as e:
    print(f'error: {str(e)}')
`;

  const python = spawn('python', ['-c', pythonScript]);
  let output = '';
  let error = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    error += data.toString();
  });

  python.on('close', (code) => {
    if (code === 0 || output.includes('success')) {
      res.json({ 
        success: true,
        message: 'Visualizations generated successfully'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to generate visualizations',
        details: error
      });
    }
  });
});

// Get category pie chart
app.get('/api/visualizations/category-pie', (req, res) => {
  const chartPath = path.join(__dirname, 'public/charts/category_pie.png');
  
  // Check if chart exists, if not generate it
  if (!fs.existsSync(chartPath)) {
    const pythonScript = `
import sys
sys.path.insert(0, '.')
from visualize import generate_category_pie_chart
result = generate_category_pie_chart()
print('done')
`;
    
    const python = spawn('python', ['-c', pythonScript]);
    let error = '';

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0 && fs.existsSync(chartPath)) {
        res.sendFile(chartPath);
      } else {
        res.status(500).json({ error: 'Failed to generate chart', details: error });
      }
    });
  } else {
    res.sendFile(chartPath);
  }
});

// Get monthly analysis chart
app.get('/api/visualizations/monthly-analysis', (req, res) => {
  const chartPath = path.join(__dirname, 'public/charts/monthly_analysis.png');
  
  // Check if chart exists, if not generate it
  if (!fs.existsSync(chartPath)) {
    const pythonScript = `
import sys
sys.path.insert(0, '.')
from visualize import generate_monthly_analysis
result = generate_monthly_analysis()
print('done')
`;
    
    const python = spawn('python', ['-c', pythonScript]);
    let error = '';

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0 && fs.existsSync(chartPath)) {
        res.sendFile(chartPath);
      } else {
        res.status(500).json({ error: 'Failed to generate chart', details: error });
      }
    });
  } else {
    res.sendFile(chartPath);
  }
});

// Get category trend chart
app.get('/api/visualizations/category-trend', (req, res) => {
  const chartPath = path.join(__dirname, 'public/charts/category_trend.png');
  
  // Check if chart exists, if not generate it
  if (!fs.existsSync(chartPath)) {
    const pythonScript = `
import sys
sys.path.insert(0, '.')
from visualize import generate_category_trend
result = generate_category_trend()
print('done')
`;
    
    const python = spawn('python', ['-c', pythonScript]);
    let error = '';

    python.stderr.on('data', (data) => {
      error += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0 && fs.existsSync(chartPath)) {
        res.sendFile(chartPath);
      } else {
        res.status(500).json({ error: 'Failed to generate chart', details: error });
      }
    });
  } else {
    res.sendFile(chartPath);
  }
});

// Get visualization stats
app.get('/api/visualizations/stats', (req, res) => {
  const pythonScript = `
import sys
import json
sys.path.insert(0, '.')
from visualize import get_summary_stats

result = get_summary_stats()
print(json.dumps(result))
`;

  const python = spawn('python', ['-c', pythonScript]);
  let output = '';
  let error = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    error += data.toString();
  });

  python.on('close', (code) => {
    if (code === 0) {
      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse stats' });
      }
    } else {
      res.status(500).json({ error: 'Failed to get stats', details: error });
    }
  });
});

// Regenerate all visualizations
app.post('/api/visualizations/regenerate', (req, res) => {
  // Delete existing charts
  const chartsDir = path.join(__dirname, 'public/charts');
  if (fs.existsSync(chartsDir)) {
    fs.readdirSync(chartsDir).forEach(file => {
      fs.unlinkSync(path.join(chartsDir, file));
    });
  }

  // Generate new charts
  const pythonScript = `
import sys
sys.path.insert(0, '.')
from visualize import generate_category_pie_chart, generate_monthly_analysis, generate_category_trend

try:
    generate_category_pie_chart()
    generate_monthly_analysis()
    generate_category_trend()
    print('success')
except Exception as e:
    print(f'error: {str(e)}')
`;

  const python = spawn('python', ['-c', pythonScript]);
  let output = '';
  let error = '';

  python.stdout.on('data', (data) => {
    output += data.toString();
  });

  python.stderr.on('data', (data) => {
    error += data.toString();
  });

  python.on('close', (code) => {
    if (code === 0 && output.includes('success')) {
      res.json({ 
        success: true,
        message: 'Visualizations regenerated successfully'
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to regenerate visualizations',
        details: error
      });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Expense Tracker Server running at http://localhost:${PORT}`);
});
