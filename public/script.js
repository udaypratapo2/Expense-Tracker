// API Base URL
const API_BASE = 'http://localhost:3000/api';
const CURRENCY_SYMBOL = '₹';

// DOM Elements
const expenseForm = document.getElementById('expenseForm');
const expensesList = document.getElementById('expensesList');
const logsList = document.getElementById('logsList');
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const closeModalBtn = document.querySelector('.close');
const cancelEditBtn = document.getElementById('cancelEdit');
const searchExpense = document.getElementById('searchExpense');
const categoryFilter = document.getElementById('categoryFilter');

function formatCurrency(amount) {
  return `${CURRENCY_SYMBOL}${Number(amount).toFixed(2)}`;
}

// Set today's date as default
document.getElementById('date').valueAsDate = new Date();

// ============= EVENT LISTENERS =============

// Tab Navigation
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    switchTab(tabName, btn);
  });
});

// Form Submission
expenseForm.addEventListener('submit', (e) => {
  e.preventDefault();
  addExpense();
});

editForm.addEventListener('submit', (e) => {
  e.preventDefault();
  updateExpense();
});

// Modal Controls
closeModalBtn.addEventListener('click', closeModal);
cancelEditBtn.addEventListener('click', closeModal);
window.addEventListener('click', (event) => {
  if (event.target === editModal) {
    closeModal();
  }
});

// Search and Filter
searchExpense.addEventListener('input', displayExpenses);
categoryFilter.addEventListener('change', displayExpenses);

// ============= TAB MANAGEMENT =============

function switchTab(tabName, tabButton = null) {
  // Hide all tabs
  tabContents.forEach(tab => tab.classList.remove('active'));
  tabButtons.forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  document.getElementById(tabName).classList.add('active');
  if (tabButton) {
    tabButton.classList.add('active');
  }

  // Load data for the tab
  if (tabName === 'view-expenses') {
    loadExpenses();
  } else if (tabName === 'logs') {
    loadLogs();
  } else if (tabName === 'summary') {
    loadSummary();
  }
}

// ============= EXPENSE MANAGEMENT =============

async function addExpense() {
  const expense = {
    description: document.getElementById('description').value,
    amount: parseFloat(document.getElementById('amount').value),
    category: document.getElementById('category').value,
    date: document.getElementById('date').value,
    payment_method: document.getElementById('payment_method').value,
    notes: document.getElementById('notes').value
  };

  try {
    const response = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expense)
    });

    if (!response.ok) {
      throw new Error('Failed to add expense');
    }

    const data = await response.json();
    showNotification('Expense added successfully!', 'success');
    expenseForm.reset();
    document.getElementById('date').valueAsDate = new Date();

    // Switch to view expenses tab
    switchTab('view-expenses');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error adding expense. Please try again.', 'error');
  }
}

async function loadExpenses() {
  try {
    const response = await fetch(`${API_BASE}/expenses`);
    if (!response.ok) {
      throw new Error('Failed to load expenses');
    }

    const expenses = await response.json();
    displayExpenses(expenses);
  } catch (error) {
    console.error('Error:', error);
    expensesList.innerHTML = '<p class="empty-state">Error loading expenses</p>';
  }
}

function displayExpenses(expenses) {
  const searchTerm = searchExpense.value.toLowerCase();
  const selectedCategory = categoryFilter.value;

  fetch(`${API_BASE}/expenses`)
    .then(response => response.json())
    .then(allExpenses => {
      let filtered = allExpenses;

      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter(exp => 
          exp.description.toLowerCase().includes(searchTerm)
        );
      }

      // Filter by category
      if (selectedCategory) {
        filtered = filtered.filter(exp => exp.category === selectedCategory);
      }

      // Display expenses
      if (filtered.length === 0) {
        expensesList.innerHTML = '<p class="empty-state">No expenses found</p>';
        return;
      }

      expensesList.innerHTML = filtered.map(expense => `
        <div class="expense-item">
          <div class="expense-info">
            <div class="expense-header">
              <span class="expense-description">${escapeHtml(expense.description)}</span>
              <span class="expense-category">${escapeHtml(expense.category)}</span>
            </div>
            <div class="expense-details">
              <span class="expense-detail">📅 ${formatDate(expense.date)}</span>
              <span class="expense-detail">💳 ${expense.payment_method || 'Not specified'}</span>
              ${expense.notes ? `<span class="expense-detail">📝 ${escapeHtml(expense.notes)}</span>` : ''}
            </div>
            <div class="expense-actions">
              <button class="btn btn-edit" onclick="openEditModal(${expense.id})">✏️ Edit</button>
              <button class="btn btn-danger" onclick="deleteExpense(${expense.id})">🗑️ Delete</button>
            </div>
          </div>
          <div class="expense-amount">${formatCurrency(expense.amount)}</div>
        </div>
      `).join('');
    })
    .catch(error => {
      console.error('Error:', error);
      expensesList.innerHTML = '<p class="empty-state">Error loading expenses</p>';
    });
}

async function openEditModal(id) {
  try {
    const response = await fetch(`${API_BASE}/expenses/${id}`);
    if (!response.ok) {
      throw new Error('Failed to load expense');
    }

    const expense = await response.json();

    document.getElementById('editId').value = expense.id;
    document.getElementById('editDescription').value = expense.description;
    document.getElementById('editAmount').value = expense.amount;
    document.getElementById('editCategory').value = expense.category;
    document.getElementById('editDate').value = expense.date;
    document.getElementById('editPaymentMethod').value = expense.payment_method || '';
    document.getElementById('editNotes').value = expense.notes || '';

    editModal.style.display = 'block';
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error loading expense', 'error');
  }
}

function closeModal() {
  editModal.style.display = 'none';
  editForm.reset();
}

async function updateExpense() {
  const id = document.getElementById('editId').value;
  const expense = {
    description: document.getElementById('editDescription').value,
    amount: parseFloat(document.getElementById('editAmount').value),
    category: document.getElementById('editCategory').value,
    date: document.getElementById('editDate').value,
    payment_method: document.getElementById('editPaymentMethod').value,
    notes: document.getElementById('editNotes').value
  };

  try {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expense)
    });

    if (!response.ok) {
      throw new Error('Failed to update expense');
    }

    showNotification('Expense updated successfully!', 'success');
    closeModal();
    loadExpenses();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error updating expense', 'error');
  }
}

async function deleteExpense(id) {
  if (!confirm('Are you sure you want to delete this expense?')) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }

    showNotification('Expense deleted successfully!', 'success');
    loadExpenses();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error deleting expense', 'error');
  }
}

// ============= LOGS MANAGEMENT =============

async function loadLogs() {
  try {
    const response = await fetch(`${API_BASE}/logs`);
    if (!response.ok) {
      throw new Error('Failed to load logs');
    }

    const logs = await response.json();
    displayLogs(logs);
  } catch (error) {
    console.error('Error:', error);
    logsList.innerHTML = '<p class="empty-state">Error loading logs</p>';
  }
}

function displayLogs(logs) {
  if (logs.length === 0) {
    logsList.innerHTML = '<p class="empty-state">No transaction logs yet</p>';
    return;
  }

  logsList.innerHTML = logs.map(log => `
    <div class="log-item">
      <div class="log-header">
        <span class="log-action">${escapeHtml(log.action)}</span>
        <span class="log-time">${formatDateTime(log.timestamp)}</span>
      </div>
      <div class="log-description">
        <strong>Expense:</strong> ${log.description || 'Unknown'}
      </div>
      ${log.old_value || log.new_value ? `
        <div class="log-details">
          ${log.old_value ? `<strong>Old Value:</strong> ${escapeHtml(log.old_value)}<br>` : ''}
          ${log.new_value ? `<strong>New Value:</strong> ${escapeHtml(log.new_value)}` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// ============= SUMMARY MANAGEMENT =============

async function loadSummary() {
  try {
    const [summaryRes, categoryRes, budgetRes] = await Promise.all([
      fetch(`${API_BASE}/summary`),
      fetch(`${API_BASE}/summary/by-category`),
      fetch(`${API_BASE}/budget/current-month`)
    ]);

    if (!summaryRes.ok || !categoryRes.ok) {
      throw new Error('Failed to load summary');
    }

    const summary = await summaryRes.json();
    const categories = await categoryRes.json();
    const budget = budgetRes.ok ? await budgetRes.json() : null;

    displaySummary(summary, categories);
    displayBudgetStatus(budget);
  } catch (error) {
    console.error('Error:', error);
  }
}

function displaySummary(summary, categories) {
  const totalAmount = summary.total_amount || 0;
  const totalCount = summary.total_expenses || 0;
  const average = totalCount > 0 ? (totalAmount / totalCount).toFixed(2) : '0.00';

  document.getElementById('totalExpenses').textContent = formatCurrency(totalAmount);
  document.getElementById('totalCount').textContent = `${totalCount} expenses`;
  document.getElementById('averageExpense').textContent = formatCurrency(average);
  document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();

  // Display category breakdown
  const categoryBreakdown = document.getElementById('categoryBreakdown');
  if (categories.length === 0) {
    categoryBreakdown.innerHTML = '<p class="empty-state">No category data</p>';
    return;
  }

  categoryBreakdown.innerHTML = categories.map(cat => `
    <div class="category-item">
      <div class="category-name">${escapeHtml(cat.category)}</div>
      <div class="category-stats">
        <span>${cat.count} expense${cat.count !== 1 ? 's' : ''}</span>
        <span class="category-amount">${formatCurrency(cat.total)}</span>
      </div>
    </div>
  `).join('');
}

// ============= BUDGET MANAGEMENT =============

async function setBudgetTarget() {
  const budgetMonth = document.getElementById('budgetMonth').value;
  const budgetAmount = document.getElementById('budgetAmount').value;

  if (!budgetMonth || !budgetAmount) {
    showNotification('Please fill in both month and amount', 'error');
    return;
  }

  const [year, month] = budgetMonth.split('-').map(Number);

  try {
    const response = await fetch(`${API_BASE}/budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        year,
        month,
        target_amount: parseFloat(budgetAmount)
      })
    });

    if (!response.ok) {
      throw new Error('Failed to set budget target');
    }

    const result = await response.json();
    showNotification(
      `Budget target ${result.created ? 'set' : 'updated'} successfully!`,
      'success'
    );

    // Reload summary to show updated budget
    loadSummary();
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error setting budget target', 'error');
  }
}

function displayBudgetStatus(budget) {
  const budgetStatus = document.getElementById('budgetStatus');

  if (!budget) {
    budgetStatus.innerHTML = '<p class="empty-state">Unable to load budget information</p>';
    return;
  }

  if (budget.target_amount === 0) {
    budgetStatus.innerHTML = `
      <p class="empty-state">No budget target set for current month. Set one above to track your spending!</p>
    `;
    return;
  }

  const progressPercentage = Math.min(budget.percentage_used, 100);
  const progressClass = budget.is_over_budget ? 'over-budget' : 'on-track';
  const alertClass = budget.is_over_budget ? 'over-budget' : 'on-track';
  const alertMessage = budget.is_over_budget 
    ? `⚠️ Over budget by ${formatCurrency(Math.abs(budget.remaining))}`
    : `✅ On track - ${formatCurrency(budget.remaining)} remaining`;

  budgetStatus.innerHTML = `
    <div class="budget-info">
      <div class="budget-metric">
        <div class="metric-label">Target</div>
        <div class="metric-value">${formatCurrency(budget.target_amount)}</div>
      </div>
      <div class="budget-metric">
        <div class="metric-label">Spent</div>
        <div class="metric-value">${formatCurrency(budget.total_spent)}</div>
      </div>
      <div class="budget-metric">
        <div class="metric-label">Remaining</div>
        <div class="metric-value ${budget.remaining >= 0 ? 'positive' : 'negative'}">
          ${formatCurrency(budget.remaining)}
        </div>
      </div>
      <div class="budget-metric">
        <div class="metric-label">Used</div>
        <div class="metric-value">${budget.percentage_used.toFixed(1)}%</div>
      </div>
    </div>
    
    <div class="budget-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${progressPercentage}%"></div>
      </div>
      <div class="progress-text">${budget.percentage_used.toFixed(1)}% of budget used</div>
    </div>
    
    <div class="budget-alert ${alertClass}">
      ${alertMessage}
    </div>
  `;
}

// Set current month as default for budget input
document.addEventListener('DOMContentLoaded', function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  document.getElementById('budgetMonth').value = `${year}-${month}`;
});

// ============= UTILITY FUNCTIONS =============

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTime(dateString) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    color: white;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2000;
    animation: slideIn 0.3s ease;
    font-weight: 500;
  `;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// ============= VISUALIZATION FUNCTIONS =============

async function generateVisualizations() {
  showNotification('Generating visualizations...', 'info');

  try {
    // Request visualization generation
    const genResponse = await fetch(`${API_BASE}/visualizations/regenerate`, {
      method: 'POST'
    });

    if (!genResponse.ok) {
      throw new Error('Failed to generate visualizations');
    }

    // Wait a moment for files to be created
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Load the visualizations
    loadAnalytics();
    showNotification('Visualizations updated successfully!', 'success');
  } catch (error) {
    console.error('Error:', error);
    showNotification('Error generating visualizations', 'error');
  }
}

async function loadAnalytics() {
  try {
    // Load charts and stats
    await Promise.all([
      loadCategoryPieChart(),
      loadMonthlyAnalysisChart(),
      loadCategoryTrendChart(),
      loadDetailedStats()
    ]);
  } catch (error) {
    console.error('Error loading analytics:', error);
  }
}

async function loadCategoryPieChart() {
  const chartDiv = document.getElementById('categoryPieChart');
  const statsDiv = document.getElementById('categoryStats');

  try {
    // Add timestamp to bust cache
    const timestamp = new Date().getTime();
    const imgUrl = `${API_BASE}/visualizations/category-pie?t=${timestamp}`;
    
    // Check if chart exists by trying to load it
    const imgElement = new Image();
    imgElement.onload = () => {
      chartDiv.innerHTML = `<img src="${imgUrl}" alt="Category Pie Chart">`;
    };
    imgElement.onerror = () => {
      chartDiv.innerHTML = '<p class="loading-text">No expense data available for chart</p>';
    };
    imgElement.src = imgUrl;

  } catch (error) {
    console.error('Error loading category pie chart:', error);
    chartDiv.innerHTML = '<p class="empty-state">Error loading chart</p>';
  }
}

async function loadMonthlyAnalysisChart() {
  const chartDiv = document.getElementById('monthlyAnalysisChart');
  const statsDiv = document.getElementById('monthlyStats');

  try {
    // Add timestamp to bust cache
    const timestamp = new Date().getTime();
    const imgUrl = `${API_BASE}/visualizations/monthly-analysis?t=${timestamp}`;
    
    const imgElement = new Image();
    imgElement.onload = () => {
      chartDiv.innerHTML = `<img src="${imgUrl}" alt="Monthly Analysis Chart">`;
    };
    imgElement.onerror = () => {
      chartDiv.innerHTML = '<p class="loading-text">No monthly data available for chart</p>';
    };
    imgElement.src = imgUrl;

  } catch (error) {
    console.error('Error loading monthly analysis chart:', error);
    chartDiv.innerHTML = '<p class="empty-state">Error loading chart</p>';
  }
}

async function loadCategoryTrendChart() {
  const chartDiv = document.getElementById('categoryTrendChart');

  try {
    // Add timestamp to bust cache
    const timestamp = new Date().getTime();
    const imgUrl = `${API_BASE}/visualizations/category-trend?t=${timestamp}`;
    
    const imgElement = new Image();
    imgElement.onload = () => {
      chartDiv.innerHTML = `<img src="${imgUrl}" alt="Category Trend Chart">`;
    };
    imgElement.onerror = () => {
      chartDiv.innerHTML = '<p class="loading-text">Insufficient data for trend analysis</p>';
    };
    imgElement.src = imgUrl;

  } catch (error) {
    console.error('Error loading category trend chart:', error);
    chartDiv.innerHTML = '<p class="empty-state">Error loading chart</p>';
  }
}

async function loadDetailedStats() {
  const statsDiv = document.getElementById('detailedStats');

  try {
    const response = await fetch(`${API_BASE}/visualizations/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to load stats');
    }

    const result = await response.json();

    if (result.error) {
      statsDiv.innerHTML = '<p class="empty-state">No data available</p>';
      return;
    }

    const stats = result.data;

    statsDiv.innerHTML = `
      <div class="stat-card">
        <h4>Total Expenses</h4>
        <div class="stat-card-value">${stats.total_expenses}</div>
      </div>
      <div class="stat-card">
        <h4>Total Amount Spent</h4>
        <div class="stat-card-value">${formatCurrency(stats.total_amount)}</div>
      </div>
      <div class="stat-card">
        <h4>Average Expense</h4>
        <div class="stat-card-value">${formatCurrency(stats.average_amount)}</div>
      </div>
      <div class="stat-card">
        <h4>Median Expense</h4>
        <div class="stat-card-value">${formatCurrency(stats.median_amount)}</div>
      </div>
      <div class="stat-card">
        <h4>Highest Expense</h4>
        <div class="stat-card-value">${formatCurrency(stats.max_amount)}</div>
      </div>
      <div class="stat-card">
        <h4>Lowest Expense</h4>
        <div class="stat-card-value">${formatCurrency(stats.min_amount)}</div>
      </div>
      <div class="stat-card">
        <h4>Top Category</h4>
        <div class="stat-card-value">${stats.top_category}</div>
      </div>
      <div class="stat-card">
        <h4>Total Categories</h4>
        <div class="stat-card-value">${stats.total_categories}</div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading stats:', error);
    statsDiv.innerHTML = '<p class="empty-state">Error loading statistics</p>';
  }
}

// Initial load
document.addEventListener('DOMContentLoaded', () => {
  loadExpenses();
});
