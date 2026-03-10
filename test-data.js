#!/usr/bin/env node

/**
 * Test script to verify visualization functionality
 * This creates some test data and generates visualizations
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Test data
const testExpenses = [
  // March 2026
  { description: 'Grocery Shopping', amount: 85.50, category: 'Food', date: '2026-03-01', payment_method: 'Credit Card' },
  { description: 'Gas', amount: 45.00, category: 'Transportation', date: '2026-03-02', payment_method: 'Debit Card' },
  { description: 'Movie Tickets', amount: 30.00, category: 'Entertainment', date: '2026-03-03', payment_method: 'Cash' },
  { description: 'Dining Out', amount: 65.00, category: 'Food', date: '2026-03-05', payment_method: 'Credit Card' },
  { description: 'Electricity Bill', amount: 120.00, category: 'Utilities', date: '2026-03-06', payment_method: 'Bank Transfer' },
  { description: 'Shopping', amount: 150.00, category: 'Shopping', date: '2026-03-07', payment_method: 'Credit Card' },
  // February 2026
  { description: 'Bus Ticket', amount: 15.00, category: 'Transportation', date: '2026-02-28', payment_method: 'Cash' },
  { description: 'Doctor Visit', amount: 200.00, category: 'Healthcare', date: '2026-02-27', payment_method: 'Credit Card' },
  { description: 'Coffee', amount: 5.50, category: 'Food', date: '2026-02-26', payment_method: 'Digital Wallet' },
  { description: 'Book Purchase', amount: 25.00, category: 'Education', date: '2026-02-25', payment_method: 'Credit Card' },
  { description: 'Restaurant', amount: 55.00, category: 'Food', date: '2026-02-24', payment_method: 'Credit Card' },
  { description: 'Taxi', amount: 30.00, category: 'Transportation', date: '2026-02-23', payment_method: 'Digital Wallet' },
  { description: 'Game Purchase', amount: 60.00, category: 'Entertainment', date: '2026-02-22', payment_method: 'Credit Card' },
  // January 2026
  { description: 'Concert', amount: 100.00, category: 'Entertainment', date: '2026-01-20', payment_method: 'Credit Card' },
  { description: 'Groceries', amount: 95.00, category: 'Food', date: '2026-01-19', payment_method: 'Credit Card' },
  { description: 'Taxi Ride', amount: 35.00, category: 'Transportation', date: '2026-01-18', payment_method: 'Digital Wallet' },
  { description: 'Dental Checkup', amount: 180.00, category: 'Healthcare', date: '2026-01-17', payment_method: 'Credit Card' },
  { description: 'New Shoes', amount: 120.00, category: 'Shopping', date: '2026-01-16', payment_method: 'Credit Card' },
  { description: 'Water Bill', amount: 50.00, category: 'Utilities', date: '2026-01-15', payment_method: 'Bank Transfer' }
];

function insertTestData() {
  const db = new sqlite3.Database('./expenses.db', (err) => {
    if (err) {
      console.error('Error opening database:', err);
      return;
    }

    console.log('Inserting test data...');
    
    let inserted = 0;
    testExpenses.forEach(expense => {
      db.run(
        'INSERT INTO expenses (description, amount, category, date, payment_method) VALUES (?, ?, ?, ?, ?)',
        [expense.description, expense.amount, expense.category, expense.date, expense.payment_method],
        function(err) {
          if (err) {
            console.error('Error inserting expense:', err);
          } else {
            inserted++;
            console.log(`✓ Inserted: ${expense.description} - $${expense.amount}`);
          }

          if (inserted === testExpenses.length) {
            console.log('\n✅ All test data inserted successfully!');
            console.log('\nYou can now test the visualizations by:');
            console.log('1. Going to the Analytics tab in the application');
            console.log('2. Clicking the "Refresh Charts" button');
            console.log('3. Charts will be generated using Pandas & Matplotlib');
            db.close();
          }
        }
      );
    });
  });
}

// Check if database exists and has data
const db = new sqlite3.Database('./expenses.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
    return;
  }

  db.get('SELECT COUNT(*) as count FROM expenses', (err, row) => {
    if (err) {
      console.error('Error:', err);
      db.close();
      return;
    }

    if (row.count === 0) {
      console.log('Database is empty. Inserting test data for visualization demo...\n');
      db.close();
      insertTestData();
    } else {
      console.log(`✅ Database already has ${row.count} expenses.`);
      console.log('You can proceed to the Analytics tab to view visualizations.');
      db.close();
    }
  });
});
