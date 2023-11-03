const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "13thRitz@1997",
    database: "sundaytech"
});

connection.connect(function(err) {
  if (err) console.error('Error connecting to database:', err);
  console.log('Mysql Connected!');
});

module.exports = connection

