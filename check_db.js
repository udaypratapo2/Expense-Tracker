const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./expenses.db');

db.all("SELECT * FROM bank_transactions", [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Bank transactions:', rows.length, 'rows');
    console.log('Sample rows:', rows.slice(0, 3));
  }
  db.close();
});